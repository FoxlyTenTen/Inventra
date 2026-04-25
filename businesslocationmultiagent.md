# Inventra — Multi-Agent Business Location Expansion System

> Developer reference for the 5-agent expansion strategy workflow.  
> Spec source: `CLAUDE_CODE_MULTI_AGENT_PROMPT_COMPLETE.md`

---

## What This System Does

A guided decision-making workflow for kiosk owners who want to open a new F&B outlet. Instead of giving a single recommendation, each of the 5 agents generates **3 distinct options with pros/cons**. The user picks one, that selection is saved to shared state, and the next agent's analysis is shaped by that choice. The final output is a full expansion roadmap.

**User journey:**
```
Enter target location
    → Site Selection: pick 1 of 3 candidate sites
    → Financial Analyst: pick 1 of 3 investment scenarios
    → Market Researcher: pick 1 of 3 market strategies
    → Risk Manager: pick 1 of 3 risk profiles
    → Strategic Planner: pick 1 of 3 expansion roadmaps
    → Final plan saved to Supabase
```

---

## System Architecture

```
User (Expansion Wizard page / Chat sidebar)
        ↓
CopilotKit Frontend  ←→  /api/copilotkit  (Next.js)
        ↓
A2A Middleware Agent
        ↓
Orchestrator (ILMU GLM-5.1 via LiteLLM + Google ADK)
        ↓  Category E routing → expansion agents via A2A
┌────────────────────────────────────────────────────┐
│  Expansion Agent Pipeline (sequential)             │
│  1. Site Selection Expert      (port 9020)         │
│  2. Financial Analyst          (port 9021)         │
│  3. Market Researcher          (port 9022)         │
│  4. Risk Manager               (port 9023)         │
│  5. Strategic Planner          (port 9024)         │
└────────────────────────────────────────────────────┘
        ↓  read/write shared state
/api/expansion/session  (Next.js API)
        ↓
Supabase: expansion_sessions table (JSONB state)
        ↓  external data
Google Cloud APIs
  ├─ Places API (Nearby Search)  → competitor F&B kiosks near candidate site
  ├─ Maps Distance Matrix        → drive time, accessibility
  └─ Gemini / Vertex AI          → market demand forecasting
```

---

## Existing Infrastructure (Reused)

| Component | Already Exists | How It's Reused |
|---|---|---|
| Google ADK + LiteLLM | `agents/orchestrator.py` | Same pattern for all 5 new agents |
| A2A Protocol | `app/api/copilotkit/route.ts` | Add 5 new agent URLs |
| ILMU GLM-5.1 | `.env` → `ILMU_API_KEY` | Primary LLM for all expansion agents |
| Gemini API | `.env` → `GEMINI_API_KEY` | Market Researcher + Site Selection (Google tools) |
| Google API Key | `.env` → `GOOGLE_API_KEY` | Google Places + Maps API calls |
| Supabase client | `lib/supabase.ts` | New `expansion_sessions` table |
| SQL MCP Server | `agents/sql_mcp_server.py` port 9014 | Financial Analyst reads pos_orders benchmarks |
| CopilotKit form tools | `agents/orchestrator.py` | `gather_expansion_details` form (new tool) |

---

## Data Sources

### From Existing Supabase Tables

| Table | Used By | Purpose |
|---|---|---|
| `pos_orders` + `pos_orders_daily` | Financial Analyst | Revenue baseline & growth trend for 3 existing outlets |
| `locations` | Site Selection | Benchmark: existing outlet locations + performance |
| `inventory_stock` | Financial Analyst | COGS % and waste cost estimates |
| `dashboard_ai_insights` | Market Researcher | Existing AI insights as market context |

### New External APIs

| API | Called By | Data Returned |
|---|---|---|
| Google Places Nearby Search | Site Selection | F&B competitor count within 500m of candidate site |
| Google Maps Distance Matrix | Site Selection | Drive time from city centre, accessibility score |
| Google Places Text Search | Site Selection | Anchor tenants (mall, transit hub, university) |
| Gemini (google-generativeai) | Market Researcher | TAM estimate, market growth rate, demographic summary |

All Google API calls are wrapped in a single helper: `agents/google_maps_tool.py`.

---

## New Supabase Table

Run this in the Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS public.expansion_sessions (
  session_id   TEXT PRIMARY KEY,
  user_id      TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  state        JSONB NOT NULL DEFAULT '{}'
);

ALTER TABLE public.expansion_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for now" ON public.expansion_sessions FOR ALL USING (true);
```

---

## Shared State Schema

The `state` JSONB column stores:

```json
{
  "sessionId": "exp-<uuid>",
  "userId": "demo_user",
  "targetAddress": "Bangsar South, Kuala Lumpur",
  "step": 1,
  "siteSelection": {
    "options": [ /* 3 location options from agent */ ],
    "selected": null
  },
  "financial": {
    "options": [ /* 3 financial scenarios */ ],
    "selected": null
  },
  "marketResearch": {
    "options": [ /* 3 market strategies */ ],
    "selected": null
  },
  "riskManagement": {
    "options": [ /* 3 risk profiles */ ],
    "selected": null
  },
  "strategicPlan": {
    "options": [ /* 3 expansion roadmaps */ ],
    "selected": null,
    "finalRecommendation": null
  }
}
```

`step` advances 1→5 as user selects options. Each agent only runs once the previous step's `selected` is non-null.

---

## API Endpoints (Next.js)

| Method | Path | Action |
|---|---|---|
| POST | `/api/expansion/session` | Create session, call Agent 1, return `{ sessionId, options }` |
| GET | `/api/expansion/session/[id]` | Return full state |
| POST | `/api/expansion/session/[id]/select` | Save selection, call next agent, return next options |

### `/select` request body:
```json
{
  "step": 1,
  "selectedOptionId": "option-2"
}
```

### `/select` response:
```json
{
  "sessionId": "exp-abc",
  "step": 2,
  "nextAgent": "Financial Analyst",
  "options": [ /* 3 financial scenarios */ ]
}
```

---

## Agent Specifications

### Agent 1 — Site Selection Expert

**File:** `agents/site_selection_agent.py` | **Port:** 9020

**Input:** `targetAddress` + benchmarks from `locations` table  
**External calls:** Google Places (competitors), Google Maps (drive time), Places (anchors)

**Output — 3 location options** (downtown / suburban / mixed-use), each with:
- `metrics`: population3Mile, householdIncome (RM), footTrafficDaily, rentMonthly (RM), driveTimeToCenter
- `scores`: demographics, visibility, competition, financial, regulatory, overallScore (1–100)
- `pros` (3–4 items), `cons` (2–3 items)

**Malaysian context:**
- Rent zones: KLCC RM25+/sqft, Mid Valley RM18/sqft, Subang RM12/sqft, Shah Alam RM8/sqft
- Population: Jabatan Perangkaan Malaysia open data (seeded as static reference)
- Competitor search: `types: ["restaurant", "food", "cafe"]` within 500m via Places API

---

### Agent 2 — Financial Analyst

**File:** `agents/financial_analyst_agent.py` | **Port:** 9021

**Input:** selected location (rent RM, foot traffic, population) + SQL benchmark data (avg daily revenue from `pos_orders` for 3 existing outlets)  
**External calls:** none — uses `sql_mcp_server.py` (port 9014) to read Supabase

**Output — 3 financial scenarios** (Conservative / Base Case / Aggressive), each with:
- Investment breakdown (in RM): lease deposit, buildout, equipment, pre-opening, working capital
- Monthly operating costs (in RM)
- Revenue projections Y1–Y3 (in RM, calibrated to existing outlet benchmarks)
- Break-even month, ROI, payback period
- Funding options: BSN/TEKUN microloan, MDEC grant, bank SME loan (Malaysian financing)

---

### Agent 3 — Market Researcher

**File:** `agents/market_research_agent.py` | **Port:** 9022

**Input:** selected location + selected financial scenario  
**External calls:** Gemini prompt (via `google-generativeai`) for TAM/growth rate, Google Places for anchor tenant density

**Output — 3 market strategies** (Premium / Value / Niche), each with:
- TAM (RM), SAM (RM), market growth rate %, competitor count
- Customer profile (age, income, buying behavior, price sensitivity)
- Pricing strategy (RM per transaction, avg order value, margin %)
- Marketing channels + budget (RM/month)
- LTV:CAC ratio, opportunity score

---

### Agent 4 — Risk Manager

**File:** `agents/risk_manager_agent.py` | **Port:** 9023

**Input:** all 3 prior selections  
**External calls:** none — pure LLM reasoning over accumulated state

**Output — 3 risk profiles** (Conservative / Balanced / Aggressive), each with:
- Top 5 risks (severity + likelihood + RM impact)
- Mitigation strategies (proactive actions)
- Contingency plans (if/then triggers)
- Monitoring KPIs and decision checkpoints
- Financial buffers (RM reserves breakdown)

---

### Agent 5 — Strategic Planner

**File:** `agents/strategic_planner_agent.py` | **Port:** 9024

**Input:** all 4 prior selections  
**External calls:** none — synthesis agent

**Output — 3 expansion roadmaps** (Conservative / Standard / Aggressive), each with:
- Phase 1 (pilot): timeline, investment, success criteria, decision point
- Phase 2 (regional): number of outlets, pace, investment per outlet
- Phase 3 (network): target size, year 3 revenue/profit
- Investment schedule (RM, staged by phase)
- Milestone timeline (month-by-month)
- `finalRecommendation`: auto-suggests best roadmap based on prior 4 selections

---

## Frontend (New Page + Components)

### New Page: `app/(dashboard)/expansion/page.tsx`

```
[Header]   Expansion Strategy Wizard — Step X of 5
[Progress] Site Selection → Financial → Market → Risk → Plan

[3 Option Cards — side by side]
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │ Option 1     │  │ Option 2     │  │ Option 3     │
  │ Name + badge │  │ Name + badge │  │ Name + badge │
  │ Key metrics  │  │ Key metrics  │  │ Key metrics  │
  │ ✓ Pro 1      │  │ ✓ Pro 1      │  │ ✓ Pro 1      │
  │ ✓ Pro 2      │  │ ✓ Pro 2      │  │ ✓ Pro 2      │
  │ ✗ Con 1      │  │ ✗ Con 1      │  │ ✗ Con 1      │
  │ Score: 76    │  │ Score: 80    │  │ Score: 72    │
  │ [Select]     │  │ [Select]     │  │ [Select]     │
  └──────────────┘  └──────────────┘  └──────────────┘

[Selection History Panel — bottom or right]
  Step 1: Site — Mueller Suburban ✓
  Step 2: Financial — Base Case ✓
  Step 3: Market — (pending)
```

### New Components

| Component | File | Purpose |
|---|---|---|
| `ExpansionOptionCard` | `components/expansion/OptionCard.tsx` | Card with metrics grid, pros/cons list, score badge, select button |
| `ExpansionProgress` | `components/expansion/Progress.tsx` | 5-step progress indicator |
| `ExpansionStatePanel` | `components/expansion/StatePanel.tsx` | Shows accumulated selections as user advances |
| `ExpansionWizard` | `components/expansion/Wizard.tsx` | Top-level component: manages step, fetches options, handles select |

The existing **TravelChat right sidebar** is unchanged — users can also start expansion via chat ("I want to expand to Bangsar South"), which routes through the orchestrator's new Category E.

---

## Orchestrator Update (Category E)

Add to `agents/orchestrator.py` ORCHESTRATOR_INSTRUCTION:

```
E) EXPANSION STRATEGY — keywords: "expand", "new location", "open another outlet",
   "site selection", "new kiosk", "second outlet", "third outlet"

   Workflow:
   1. gather_expansion_details  ← form: target address, budget range
   2. Create expansion session via POST /api/expansion/session
   3. Return session link to user: "Your expansion analysis is ready at /expansion?session=<id>"
   4. User continues via the visual wizard
```

---

## A2A Middleware Update

Add to `app/api/copilotkit/route.ts`:

```typescript
const siteSelectionAgentUrl   = process.env.SITE_SELECTION_AGENT_URL   || "http://localhost:9020";
const financialAnalystAgentUrl = process.env.FINANCIAL_ANALYST_AGENT_URL || "http://localhost:9021";
const marketResearchAgentUrl  = process.env.MARKET_RESEARCH_AGENT_URL  || "http://localhost:9022";
const riskManagerAgentUrl     = process.env.RISK_MANAGER_AGENT_URL     || "http://localhost:9023";
const strategicPlannerAgentUrl = process.env.STRATEGIC_PLANNER_AGENT_URL || "http://localhost:9024";
```

Add all 5 to the `agentUrls` array in `A2AMiddlewareAgent`.

---

## New Environment Variables

Add to `.env` and `.env.example`:

```bash
# ============================================================
# Expansion Strategy Agents
# ============================================================
SITE_SELECTION_AGENT_URL=http://localhost:9020
FINANCIAL_ANALYST_AGENT_URL=http://localhost:9021
MARKET_RESEARCH_AGENT_URL=http://localhost:9022
RISK_MANAGER_AGENT_URL=http://localhost:9023
STRATEGIC_PLANNER_AGENT_URL=http://localhost:9024

SITE_SELECTION_PORT=9020
FINANCIAL_ANALYST_PORT=9021
MARKET_RESEARCH_PORT=9022
RISK_MANAGER_PORT=9023
STRATEGIC_PLANNER_PORT=9024
```

---

## package.json Scripts to Add

```json
"dev:site-selection":   "agents\\.venv\\Scripts\\python agents/site_selection_agent.py",
"dev:financial-analyst":"agents\\.venv\\Scripts\\python agents/financial_analyst_agent.py",
"dev:market-research":  "agents\\.venv\\Scripts\\python agents/market_research_agent.py",
"dev:risk-manager":     "agents\\.venv\\Scripts\\python agents/risk_manager_agent.py",
"dev:strategic-planner":"agents\\.venv\\Scripts\\python agents/strategic_planner_agent.py"
```

Add all 5 to the top-level `"dev"` concurrently command (names: `Site,FinAn,MktRs,Risk,Plan`).

---

## Python Dependencies to Add (`agents/requirements.txt`)

```
googlemaps          # Google Maps / Places API
google-generativeai # Gemini for market research
```

---

## Implementation Order

| Step | Task |
|---|---|
| 1 | Supabase: run `CREATE TABLE expansion_sessions` |
| 2 | `agents/google_maps_tool.py` — Places + Maps helper |
| 3 | `/api/expansion/session` + `/select` endpoints |
| 4 | `agents/site_selection_agent.py` (Agent 1) |
| 5 | `agents/financial_analyst_agent.py` (Agent 2) |
| 6 | `agents/market_research_agent.py` (Agent 3) |
| 7 | `agents/risk_manager_agent.py` (Agent 4) |
| 8 | `agents/strategic_planner_agent.py` (Agent 5) |
| 9 | Frontend: `app/(dashboard)/expansion/page.tsx` + components |
| 10 | Orchestrator: add Category E routing |
| 11 | `app/api/copilotkit/route.ts`: add 5 agent URLs |
| 12 | `package.json`: add 5 dev scripts |
| 13 | `.env.example`: add new vars |

---

## Files Summary

| File | Action |
|---|---|
| `agents/google_maps_tool.py` | New |
| `agents/site_selection_agent.py` | New |
| `agents/financial_analyst_agent.py` | New |
| `agents/market_research_agent.py` | New |
| `agents/risk_manager_agent.py` | New |
| `agents/strategic_planner_agent.py` | New |
| `app/api/expansion/session/route.ts` | New |
| `app/api/expansion/session/[id]/route.ts` | New |
| `app/api/expansion/session/[id]/select/route.ts` | New |
| `app/(dashboard)/expansion/page.tsx` | New |
| `components/expansion/OptionCard.tsx` | New |
| `components/expansion/Progress.tsx` | New |
| `components/expansion/StatePanel.tsx` | New |
| `components/expansion/Wizard.tsx` | New |
| `agents/orchestrator.py` | Modify — add Category E |
| `app/api/copilotkit/route.ts` | Modify — add 5 agent URLs |
| `package.json` | Modify — add 5 dev scripts |
| `.env` + `.env.example` | Modify — add new vars |
| `agents/requirements.txt` | Modify — add googlemaps, google-generativeai |

---

## Verification Checklist

- [ ] All 16 dev processes start without port conflicts (`npm run dev`)
- [ ] Navigate to `/expansion` — wizard loads with address input
- [ ] Enter "Bangsar South, KL" → Agent 1 returns 3 location cards with real competitor counts
- [ ] Select a card → Agent 2 returns 3 scenarios in RM amounts, calibrated to existing outlet revenue
- [ ] Select scenario → Agent 3 returns 3 market strategies
- [ ] Select strategy → Agent 4 returns 3 risk profiles
- [ ] Select profile → Agent 5 returns 3 roadmaps + `finalRecommendation`
- [ ] Select roadmap → session state saved to `expansion_sessions` in Supabase
- [ ] Chat: "I want to expand to a new outlet" → orchestrator triggers Category E, returns link to wizard
- [ ] Existing features (dashboard, planning chat, SQL/RAG tools) still work after changes
