"use client";

import React, { createContext, useContext, useState } from "react";
import type {
  SiteSelectionOption,
  MarketStrategyOption,
  RiskProfileOption,
  RoadmapOption,
  RoadmapData,
} from "./types";
import type { ExpansionFeasibilityData } from "./ExpansionFeasibilityCard";

interface FinancialDataState {
  selectedSiteOption: SiteSelectionOption | null;
  expansionFeasibilityData: ExpansionFeasibilityData | null;
  selectedMarketStrategy: MarketStrategyOption | null;
  selectedRiskProfile: RiskProfileOption | null;
  selectedRoadmap: RoadmapOption | null;
  roadmapData: RoadmapData | null;
  setSelectedSiteOption: (d: SiteSelectionOption | null) => void;
  setExpansionFeasibilityData: (d: ExpansionFeasibilityData | null) => void;
  setSelectedMarketStrategy: (d: MarketStrategyOption | null) => void;
  setSelectedRiskProfile: (d: RiskProfileOption | null) => void;
  setSelectedRoadmap: (d: RoadmapOption | null) => void;
  setRoadmapData: (d: RoadmapData | null) => void;
}

const FinancialDataContext = createContext<FinancialDataState | null>(null);

export function FinancialDataProvider({ children }: { children: React.ReactNode }) {
  const [selectedSiteOption, setSelectedSiteOption] = useState<SiteSelectionOption | null>(null);
  const [expansionFeasibilityData, setExpansionFeasibilityData] = useState<ExpansionFeasibilityData | null>(null);
  const [selectedMarketStrategy, setSelectedMarketStrategy] = useState<MarketStrategyOption | null>(null);
  const [selectedRiskProfile, setSelectedRiskProfile] = useState<RiskProfileOption | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapOption | null>(null);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);

  return (
    <FinancialDataContext.Provider
      value={{
        selectedSiteOption,
        expansionFeasibilityData,
        selectedMarketStrategy,
        selectedRiskProfile,
        selectedRoadmap,
        roadmapData,
        setSelectedSiteOption,
        setExpansionFeasibilityData,
        setSelectedMarketStrategy,
        setSelectedRiskProfile,
        setSelectedRoadmap,
        setRoadmapData,
      }}
    >
      {children}
    </FinancialDataContext.Provider>
  );
}

export function useFinancialData() {
  const ctx = useContext(FinancialDataContext);
  if (!ctx) throw new Error("useFinancialData must be used within FinancialDataProvider");
  return ctx;
}
