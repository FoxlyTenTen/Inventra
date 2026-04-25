"use client";

import React, { useState, useEffect } from "react";
import { CopilotKit, useCopilotChat } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotAction } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import "./style.css";

import type {
  TravelChatProps,
  MessageActionRenderProps,
  SiteSelectionData,
  MarketStrategyData,
  MarketStrategyOption,
  RiskProfileData,
  RiskProfileOption,
  RoadmapData,
  RoadmapOption,
} from "./types";

import { MessageToA2A } from "./a2a/MessageToA2A";
import { MessageFromA2A } from "./a2a/MessageFromA2A";
import { ExpansionDetailsForm } from "./forms/ExpansionDetailsForm";
import { SiteSelectionCard } from "./SiteSelectionCard";
import { ExpansionFeasibilityCard } from "./ExpansionFeasibilityCard";
import type { ExpansionFeasibilityData } from "./ExpansionFeasibilityCard";
import {
  normalizeMarketStrategyData,
  normalizeRiskProfileData,
  normalizeRoadmapData,
  normalizeSiteSelectionData,
} from "./site-selection-utils";
import { MarketStrategyOptionsCard } from "./MarketStrategyOptionsCard";
import { MarketStrategyCard } from "./MarketStrategyCard";
import { RiskProfileOptionsCard } from "./RiskProfileOptionsCard";
import { RiskProfileCard } from "./RiskProfileCard";
import { RoadmapOptionsCard } from "./RoadmapOptionsCard";
import { StrategicRoadmapCard } from "./StrategicRoadmapCard";

// ─────────────────────────────────────────────────────────────────────────────

const ChatInner = (props: TravelChatProps) => {
  const {
    onSelectedSiteUpdate,
    onExpansionFeasibilityUpdate,
    onSelectedMarketStrategyUpdate,
    onSelectedRiskProfileUpdate,
    onSelectedRoadmapUpdate,
    onRoadmapDataUpdate,
  } = props;

  // Financial planning co-agent sync disabled (financial planner agents removed from pipeline)

  // ── Extract structured data from A2A result messages ────────────────────────
  const { visibleMessages } = useCopilotChat();

  useEffect(() => {
    for (const message of visibleMessages) {
      const msg = message as any;
      if (msg.type !== "ResultMessage" || msg.actionName !== "send_message_to_a2a_agent") continue;

      try {
        const raw: string | object = msg.result;
        let parsed: any;

        if (typeof raw === "string") {
          const clean = raw.startsWith("A2A Agent Response: ")
            ? raw.slice("A2A Agent Response: ".length)
            : raw;
          parsed = JSON.parse(clean);
        } else if (typeof raw === "object" && raw !== null) {
          parsed = raw;
        }

        if (!parsed) continue;

        if (parsed.agentName === "Expansion Feasibility Agent" && parsed.breakEvenMonths !== undefined)
          onExpansionFeasibilityUpdate?.(parsed as ExpansionFeasibilityData);
      } catch (_) {}
    }
  }, [visibleMessages, onExpansionFeasibilityUpdate]);

  // ── A2A visualiser ───────────────────────────────────────────────────────────
  useCopilotAction({
    name: "send_message_to_a2a_agent",
    description: "Sends a message to an A2A agent",
    available: "frontend",
    parameters: [
      { name: "agentName", type: "string", description: "The name of the A2A agent" },
      { name: "task",      type: "string", description: "The message to send"       },
    ],
    render: (actionRenderProps: MessageActionRenderProps) => (
      <>
        <MessageToA2A {...actionRenderProps} />
        <MessageFromA2A {...actionRenderProps} />
      </>
    ),
  });

  // Financial planning HITL forms and display actions disabled (agents removed from pipeline)

  useCopilotAction({
    name: "display_expansion_feasibility",
    description: "Display the Expansion Financial Feasibility analysis card to the user (MANDATORY HITL STEP)",
    available: "frontend",
    parameters: [{ name: "data", type: "object", description: "Expansion feasibility data" }],
    renderAndWaitForResponse: ({ args, respond }) => {
      if (!args.data) return <></>;
      const feasData = args.data as ExpansionFeasibilityData;
      
      // Update canvas state
      onExpansionFeasibilityUpdate?.(feasData);

      return (
        <div className="space-y-3">
          <ExpansionFeasibilityCard data={feasData} />
          <button
            onClick={() => respond?.("Expansion feasibility analysis reviewed and accepted.")}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] text-sm"
          >
            Confirm Analysis & Finish
          </button>
        </div>
      );
    },
  });

  // ── HITL: Expansion details form ─────────────────────────────────────────────
  useCopilotAction({
    name: "gather_expansion_details",
    description: "Gather business location expansion details from the user",
    parameters: [
      { name: "targetArea",    type: "string", required: false },
      { name: "budgetRange",   type: "string", required: false },
      { name: "businessType",  type: "string", required: false },
    ],
    renderAndWaitForResponse: ({ args, respond }) => (
      <ExpansionDetailsForm args={args} respond={respond} />
    ),
  });

  // ── HITL: Site selection card ─────────────────────────────────────────────────
  useCopilotAction({
    name: "display_site_selection_options",
    description: "Display 3 candidate location options for the user to choose from",
    parameters: [
      { name: "agentName",   type: "string",   required: false },
      { name: "actionType",  type: "string",   required: false },
      { name: "targetArea",  type: "string",   required: false },
      { name: "userPrompt",  type: "string",   required: false },
      { name: "options",     type: "object[]", required: false },
      { name: "nextStep",    type: "string",   required: false },
    ],
    renderAndWaitForResponse: ({ args, respond }) => {
      const data = normalizeSiteSelectionData(args);
      if (!data?.options?.length) return <></>;
      const wrappedRespond = respond
        ? (selection: object) => {
            const opt = data.options.find(
              (o) => o.optionId === (selection as any).selectedOptionId
            );
            if (opt) onSelectedSiteUpdate?.(opt);
            respond(selection);
          }
        : undefined;
      return <SiteSelectionCard data={data} respond={wrappedRespond} />;
    },
  });

  // ── HITL: Market strategy selection card ────────────────────────────────────
  useCopilotAction({
    name: "display_market_strategy_options",
    description: "Display 3 market positioning strategy options for the user to choose from",
    parameters: [
      { name: "agentName",     type: "string",   required: false },
      { name: "actionType",    type: "string",   required: false },
      { name: "locationName",  type: "string",   required: false },
      { name: "targetArea",    type: "string",   required: false },
      { name: "userPrompt",    type: "string",   required: false },
      { name: "strategies",    type: "object[]", required: false },
      { name: "nextStep",      type: "string",   required: false },
    ],
    renderAndWaitForResponse: ({ args, respond }) => {
      const data = normalizeMarketStrategyData(args);
      if (!data?.strategies?.length || !Array.isArray(data.strategies)) return <></>;
      const wrappedRespond = respond
        ? (selection: object) => {
            const opt = data.strategies.find(
              (s) => s.strategyId === (selection as any).selectedStrategyId
            );
            if (opt) onSelectedMarketStrategyUpdate?.(opt);
            respond(selection);
          }
        : undefined;
      return <MarketStrategyOptionsCard data={data} respond={wrappedRespond} />;
    },
  });

  // ── HITL: Risk profile selection card ───────────────────────────────────────
  useCopilotAction({
    name: "display_risk_profile_options",
    description: "Display 3 risk management profile options for the user to choose from",
    parameters: [
      { name: "agentName",         type: "string",   required: false },
      { name: "actionType",        type: "string",   required: false },
      { name: "selectedLocation",  type: "string",   required: false },
      { name: "selectedFinancial", type: "string",   required: false },
      { name: "selectedStrategy",  type: "string",   required: false },
      { name: "userPrompt",        type: "string",   required: false },
      { name: "riskProfiles",      type: "object[]", required: false },
      { name: "nextStep",          type: "string",   required: false },
    ],
    renderAndWaitForResponse: ({ args, respond }) => {
      const data = normalizeRiskProfileData(args);
      if (!data?.riskProfiles?.length || !Array.isArray(data.riskProfiles)) return <></>;
      const wrappedRespond = respond
        ? (selection: object) => {
            const opt = data.riskProfiles.find(
              (p) => p.profileId === (selection as any).selectedProfileId
            );
            if (opt) onSelectedRiskProfileUpdate?.(opt);
            respond(selection);
          }
        : undefined;
      return <RiskProfileOptionsCard data={data} respond={wrappedRespond} />;
    },
  });

  // ── Display: Selected risk profile on canvas ─────────────────────────────────
  useCopilotAction({
    name: "display_risk_profile",
    description: "Display the selected risk profile on the canvas",
    available: "frontend",
    parameters: [
      { name: "data",         type: "object", description: "Selected risk profile data" },
      { name: "locationName", type: "string", required: false },
    ],
    render: ({ args }) => {
      if (!args.data) return <></>;
      return (
        <RiskProfileCard
          data={args.data as RiskProfileOption}
          locationName={args.locationName as string | undefined}
        />
      );
    },
  });

  // ── HITL: Strategic roadmap selection card ───────────────────────────────────
  useCopilotAction({
    name: "display_strategic_roadmap_options",
    description: "Display 3 expansion roadmap options for the user to choose from",
    parameters: [
      { name: "agentName",          type: "string",   required: false },
      { name: "actionType",         type: "string",   required: false },
      { name: "selectedLocation",   type: "string",   required: false },
      { name: "selectedFinancial",  type: "string",   required: false },
      { name: "selectedStrategy",   type: "string",   required: false },
      { name: "selectedRiskProfile",type: "string",   required: false },
      { name: "userPrompt",         type: "string",   required: false },
      { name: "roadmaps",           type: "object[]", required: false },
      { name: "finalRecommendation",type: "object",   required: false },
      { name: "nextStep",           type: "string",   required: false },
    ],
    renderAndWaitForResponse: ({ args, respond }) => {
      const data = normalizeRoadmapData(args);
      if (!data?.roadmaps?.length || !Array.isArray(data.roadmaps)) return <></>;
      const wrappedRespond = respond
        ? (selection: object) => {
            const opt = data.roadmaps.find(
              (r) => r.roadmapId === (selection as any).selectedRoadmapId
            );
            onRoadmapDataUpdate?.(data);
            if (opt) onSelectedRoadmapUpdate?.(opt);
            respond(selection);
          }
        : undefined;
      return <RoadmapOptionsCard data={data} respond={wrappedRespond} />;
    },
  });

  // ── Display: Selected roadmap on canvas ──────────────────────────────────────
  useCopilotAction({
    name: "display_strategic_roadmap",
    description: "Display the selected strategic roadmap on the canvas",
    available: "frontend",
    parameters: [
      { name: "data",         type: "object", description: "Selected roadmap data" },
      { name: "locationName", type: "string", required: false },
    ],
    render: ({ args }) => {
      if (!args.data) return <></>;
      return (
        <StrategicRoadmapCard
          data={args.data as RoadmapOption}
          locationName={args.locationName as string | undefined}
        />
      );
    },
  });

  // ── Display: Selected market strategy on canvas ──────────────────────────────
  useCopilotAction({
    name: "display_market_strategy",
    description: "Display the selected market strategy on the canvas",
    available: "frontend",
    parameters: [
      { name: "data",         type: "object", description: "Selected strategy data" },
      { name: "locationName", type: "string", required: false },
    ],
    render: ({ args }) => {
      if (!args.data) return <></>;
      return (
        <MarketStrategyCard
          data={args.data as MarketStrategyOption}
          locationName={args.locationName as string | undefined}
        />
      );
    },
  });

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="h-full">
      <CopilotChat
        className="h-full"
        labels={{
          initial:
            "👋 Hi! I'm Inventra's Operations Intelligence.\n\nAsk me about your kiosk revenue, stock levels, expiry alerts, demand forecasts, or your next business expansion location!",
        }}
        instructions="You are Inventra's Operations Intelligence assistant. Help kiosk owners with revenue data, stock levels, expiry alerts, demand forecasting, and business location expansion planning."
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

export default function TravelChat(props: TravelChatProps) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" showDevConsole={false} agent="a2a_chat">
      <ChatInner {...props} />
    </CopilotKit>
  );
}
