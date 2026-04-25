/**
 * MarketStrategyCard Component
 *
 * Canvas read-only card displaying the selected market strategy from the Market Researcher Agent.
 */
import React from "react";
import type { MarketStrategyOption } from "./types";

interface MarketStrategyCardProps {
  data: MarketStrategyOption;
  locationName?: string;
}

const SCORE_COLOR = (score: number) =>
  score >= 75 ? "text-emerald-600" : score >= 55 ? "text-yellow-600" : "text-red-500";

const GROWTH_BG: Record<string, string> = {
  High: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Moderate: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Low: "bg-red-100 text-red-700 border-red-200",
};

export const MarketStrategyCard = ({ data, locationName }: MarketStrategyCardProps) => {
  const marginPct = Math.round(data.pricingStrategy.profitMargin * 100);
  const ltvCacRatio = data.marketingApproach.cac > 0
    ? (data.marketingApproach.ltv / data.marketingApproach.cac).toFixed(1)
    : "—";

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl p-5 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🎯</span>
            <div>
              <h2 className="text-lg font-bold leading-tight">{data.name}</h2>
              {locationName && (
                <p className="text-indigo-300 text-xs">{locationName}</p>
              )}
            </div>
          </div>
          <p className="text-indigo-200 text-xs leading-relaxed max-w-xs">{data.positioning}</p>
        </div>
        <div className="text-right shrink-0 ml-3">
          <div className={`text-3xl font-black ${SCORE_COLOR(data.marketOpportunity.opportunityScore)}`}>
            {data.marketOpportunity.opportunityScore}
          </div>
          <div className="text-indigo-400 text-[10px] uppercase tracking-wide">opp. score</div>
          <span
            className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              GROWTH_BG[data.marketOpportunity.growthPotential] ?? "bg-gray-100 text-gray-600 border-gray-200"
            }`}
          >
            {data.marketOpportunity.growthPotential} Growth
          </span>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <KpiTile label="Price Point" value={data.pricingStrategy.pricePoint} />
        <KpiTile label="Avg Order" value={`RM ${data.pricingStrategy.aov}`} />
        <KpiTile label="Margin" value={`${marginPct}%`} />
        <KpiTile label="LTV:CAC" value={`${ltvCacRatio}×`} />
      </div>

      {/* Marketing & Customer */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-[10px] text-indigo-300 uppercase tracking-wide font-semibold mb-2">Marketing</p>
          <div className="space-y-1">
            <MetricRow label="CAC" value={`RM ${data.marketingApproach.cac}`} />
            <MetricRow label="LTV" value={`RM ${data.marketingApproach.ltv}`} />
            <MetricRow label="Monthly Budget" value={`RM ${data.marketingApproach.monthlyBudget.toLocaleString()}`} />
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-[10px] text-indigo-300 uppercase tracking-wide font-semibold mb-2">Timeline</p>
          <div className="space-y-1">
            <MetricRow label="To Dominance" value={data.marketOpportunity.timelineToDominance} />
            <MetricRow label="Growth Rate" value={data.marketAnalysis.growthRate} />
          </div>
        </div>
      </div>

      {/* Target customer */}
      <div className="bg-white/10 rounded-xl p-3 mb-4">
        <p className="text-[10px] text-indigo-300 uppercase tracking-wide font-semibold mb-1">Target Customer</p>
        <p className="text-xs text-indigo-100 leading-relaxed">{data.customerProfile}</p>
      </div>

      {/* Growth tactics */}
      <div className="mb-4">
        <p className="text-[10px] text-indigo-300 uppercase tracking-wide font-semibold mb-2">Growth Tactics</p>
        <div className="space-y-1">
          {data.growthTactics.map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-indigo-100">
              <span className="text-indigo-400 mt-0.5 shrink-0">→</span>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Pros / Cons */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-emerald-400 uppercase tracking-wide font-semibold mb-1">Pros</p>
          {data.pros.map((p, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-indigo-100 mb-0.5">
              <span className="text-emerald-400 shrink-0">✓</span>
              {p}
            </div>
          ))}
        </div>
        <div>
          <p className="text-[10px] text-red-400 uppercase tracking-wide font-semibold mb-1">Cons</p>
          {data.cons.map((c, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-indigo-100 mb-0.5">
              <span className="text-red-400 shrink-0">×</span>
              {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const KpiTile = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white/10 rounded-xl p-2.5 text-center">
    <p className="text-[9px] text-indigo-300 uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-sm font-bold text-white leading-tight">{value}</p>
  </div>
);

const MetricRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-[10px] text-indigo-300">{label}</span>
    <span className="text-xs font-semibold text-white">{value}</span>
  </div>
);
