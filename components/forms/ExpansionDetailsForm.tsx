/**
 * ExpansionDetailsForm Component
 *
 * HITL form that collects business location expansion details
 * before the Site Selection Agent runs.
 */

import React, { useState, useEffect } from "react";

interface ExpansionDetailsFormProps {
  args: any;
  respond: any;
}

export const ExpansionDetailsForm: React.FC<ExpansionDetailsFormProps> = ({ args, respond }) => {
  let parsedArgs = args;
  if (typeof args === "string") {
    try { parsedArgs = JSON.parse(args); } catch { parsedArgs = {}; }
  }

  const [targetArea, setTargetArea] = useState("");
  const [budgetRange, setBudgetRange] = useState("moderate");
  const [businessType, setBusinessType] = useState("F&B Kiosk");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (parsedArgs?.targetArea) setTargetArea(parsedArgs.targetArea);
    if (parsedArgs?.budgetRange) setBudgetRange(parsedArgs.budgetRange);
    if (parsedArgs?.businessType) setBusinessType(parsedArgs.businessType);
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!targetArea.trim()) errs.targetArea = "Please enter a target area or city";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitted(true);
    respond?.({ targetArea, budgetRange, businessType });
  };

  if (submitted) {
    return (
      <div className="bg-green-50/95 border border-green-200 rounded-xl p-4 my-3 shadow-sm animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-lg border border-green-200">
            ✓
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Expansion Details Submitted</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Searching for <span className="font-semibold text-indigo-600">{targetArea}</span> — {budgetRange} budget
            </p>
          </div>
        </div>
      </div>
    );
  }

  const budgetOptions = [
    { value: "low", label: "Low", sub: "RM 3k–6k/mo" },
    { value: "moderate", label: "Moderate", sub: "RM 6k–12k/mo" },
    { value: "high", label: "High", sub: "RM 12k+/mo" },
  ];

  return (
    <div className="bg-indigo-50/80 backdrop-blur-xl border border-indigo-100 rounded-xl p-4 my-3 shadow-lg animate-in fade-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg shadow-sm">
          🏪
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Business Location Expansion</h3>
          <p className="text-[11px] text-indigo-700/80 font-medium uppercase tracking-wide">
            Tell us where you want to expand
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Target Area */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            Target Area / City *
          </label>
          <input
            type="text"
            value={targetArea}
            onChange={(e) => setTargetArea(e.target.value)}
            className={`w-full px-3 py-2.5 text-sm rounded-lg border transition-all duration-200 shadow-sm ${
              errors.targetArea
                ? "border-red-300 bg-red-50"
                : "border-indigo-100 bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 focus:outline-none"
            }`}
            placeholder="e.g., Bangsar South, KL or Johor Bahru"
          />
          {errors.targetArea && (
            <p className="text-xs text-red-500 mt-1 font-medium">{errors.targetArea}</p>
          )}
        </div>

        {/* Business Type */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            Business Type
          </label>
          <input
            type="text"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-indigo-100 bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 focus:outline-none transition-all shadow-sm"
            placeholder="e.g., F&B Kiosk, Bubble Tea, Nasi Lemak"
          />
        </div>

        {/* Budget Range */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            Monthly Rent Budget
          </label>
          <div className="flex bg-indigo-100/40 rounded-lg p-1 border border-indigo-100 gap-1">
            {budgetOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setBudgetRange(opt.value)}
                className={`flex-1 py-2 px-1 text-center rounded-md transition-all duration-200 ${
                  budgetRange === opt.value
                    ? "bg-white text-indigo-700 shadow-sm border border-indigo-200"
                    : "text-gray-500 hover:bg-white/60 hover:text-indigo-600"
                }`}
              >
                <div className="text-[11px] font-bold">{opt.label}</div>
                <div className="text-[9px] text-gray-400">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-5 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-4 text-sm rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
      >
        Find Best Locations →
      </button>
    </div>
  );
};
