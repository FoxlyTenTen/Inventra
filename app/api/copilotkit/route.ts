/**
 * CopilotKit API Route with A2A Middleware
 *
 * Sets up the connection between:
 * - Frontend (CopilotKit) → A2A Middleware → Orchestrator → A2A Agents
 *
 * KEY CONCEPTS:
 * - AG-UI Protocol: Agent-UI communication (CopilotKit ↔ Orchestrator)
 * - A2A Protocol: Agent-to-agent communication (Orchestrator ↔ Specialized Agents)
 * - A2A Middleware: Injects send_message_to_a2a_agent tool to bridge AG-UI and A2A
 */

import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";
import { A2AMiddlewareAgent } from "@ag-ui/a2a-middleware";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // STEP 1: Define A2A agent URLs
  const forecastAgentUrl = process.env.FORECAST_AGENT_URL || "http://localhost:9025";
  const siteSelectionAgentUrl = process.env.SITE_SELECTION_AGENT_URL || "http://localhost:9020";
  const expansionFeasibilityAgentUrl = process.env.EXPANSION_FEASIBILITY_AGENT_URL || "http://localhost:9021";
  const marketResearcherAgentUrl = process.env.MARKET_RESEARCHER_AGENT_URL || "http://localhost:9022";
  const riskManagerAgentUrl = process.env.RISK_MANAGER_AGENT_URL || "http://localhost:9023";
  const strategicPlannerAgentUrl = process.env.STRATEGIC_PLANNER_AGENT_URL || "http://localhost:9024";

  // STEP 2: Define orchestrator URL (speaks AG-UI Protocol)
  const orchestratorUrl = process.env.ORCHESTRATOR_URL || "http://localhost:9000";

  // STEP 3: Wrap orchestrator with HttpAgent (AG-UI client)
  const orchestrationAgent = new HttpAgent({
    url: orchestratorUrl,
  });

  // STEP 4: Create A2A Middleware Agent
  const a2aMiddlewareAgent = new A2AMiddlewareAgent({
    description:
      "Inventra Operations Intelligence — kiosk analytics, business location expansion, and demand forecasting.",

    agentUrls: [
      forecastAgentUrl,
      siteSelectionAgentUrl,
      expansionFeasibilityAgentUrl,
      marketResearcherAgentUrl,
      riskManagerAgentUrl,
      strategicPlannerAgentUrl,
    ],

    orchestrationAgent,

    // Workflow instructions (middleware auto-adds routing info)
    instructions: `
      You are Inventra's Operations Intelligence Orchestrator for F&B kiosk owners in Malaysian malls.

      AVAILABLE AGENTS:
      - Forecast Agent (ADK): ML-powered demand forecasting using live Supabase data. Predicts daily orders, revenue, AOV, stockout risk, expiry waste, reorder quantities, and top sellers for outlet-1/outlet-2/outlet-3. Use for any forecast or prediction request.
      - Site Selection Expert Agent (ADK): Analyses Malaysian mall/commercial locations for F&B kiosk expansion. Returns 3 candidate sites with foot traffic, rent, competition scores, pros and cons.
      - Expansion Feasibility Agent (ADK): Projects financial feasibility for a selected F&B kiosk expansion location. Returns monthly revenue, profit, break-even timeline, ROI, and risk classification. Use exact name "Expansion Feasibility Agent".
      - Market Researcher (ADK): Analyses competitor market segments and demographics for a chosen location. Returns 3 market strategy options for the user to select. Use exact name "Market Researcher".
      - Risk Manager (ADK): Generates 3 risk management profiles (Conservative/Balanced/Aggressive) based on all prior selections. Use exact name "Risk Manager".
      - Strategic Planner (ADK): Synthesises all prior selections into 3 expansion roadmaps with timelines, investment schedules, and a final recommendation. Use exact name "Strategic Planner".

      WORKFLOW STRATEGY (SEQUENTIAL):

      1. **Business Location Expansion**:
         - Trigger: "expand", "new location", "open another outlet", "site selection", "second outlet", "expand my business".
         - Step 1: Call 'gather_expansion_details' (HITL form). Wait for submission.
         - Step 2: Call Site Selection Expert Agent with form data (targetArea, budgetRange, businessType).
         - Step 3: Call 'display_site_selection_options' with full agent JSON.
         - Step 4: Wait for user to select a location (respond() fires).
         - Step 5: Confirm the selected location.
         - Step 6: Call Expansion Feasibility Agent with selected location metrics.
         - Step 7: Call 'display_expansion_feasibility' with full agent JSON.
         - Step 8: Call Market Researcher with location name, coordinates, targetArea.
         - Step 9: Call 'display_market_strategy_options' with full agent JSON.
         - Step 10: Wait for user to select a strategy (respond() fires).
         - Step 11: Confirm the chosen strategy.
         - Step 12: Call Risk Manager with all prior selections.
         - Step 13: Call 'display_risk_profile_options' with full agent JSON.
         - Step 14: Wait for user to select a risk profile (respond() fires).
         - Step 15: Confirm the chosen risk profile.
         - Step 16: Call Strategic Planner with all prior selections.
         - Step 17: Call 'display_strategic_roadmap_options' with full agent JSON.
         - Step 18: Wait for user to select a roadmap (respond() fires).
         - Step 19: Congratulate the user with a brief expansion plan summary.

      2. **Demand Forecasting**:
         - Trigger: "forecast", "predict", "tomorrow's orders", "demand prediction", "stockout", "reorder", "waste risk", "top sellers next".
         - Call Forecast Agent with location_id (outlet-1/outlet-2/outlet-3) and what to forecast.

      CRITICAL RULES:
      - Call agents ONE AT A TIME.
      - Wait for results before calling the next agent.
      - Never mix expansion workflow with forecasting.
    `,
  });

  // STEP 5: Create CopilotKit Runtime
  const runtime = new CopilotRuntime({
    agents: {
      a2a_chat: a2aMiddlewareAgent, // Must match frontend: <CopilotKit agent="a2a_chat">
    },
  });

  // STEP 6: Set up Next.js endpoint handler
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new ExperimentalEmptyAdapter(),
    endpoint: "/api/copilotkit",
  });

  return handleRequest(request);
}
