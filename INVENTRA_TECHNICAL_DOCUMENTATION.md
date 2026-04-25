# Inventra — Technical Documentation

> AI-Powered F&B Kiosk Operations Intelligence for Malaysian Mall Operators

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [Main Features](#5-main-features)
6. [Agent System](#6-agent-system)
7. [Frontend Pages & Routes](#7-frontend-pages--routes)
8. [Component Library](#8-component-library)
9. [Data Flow & Protocols](#9-data-flow--protocols)
10. [Database Schema](#10-database-schema)
11. [External APIs & Services](#11-external-apis--services)
12. [Environment Variables](#12-environment-variables)
13. [Running the Project](#13-running-the-project)

---

## 1. Project Overview

**Inventra** is a full-stack AI operations platform for F&B kiosk owners operating in Malaysian shopping malls. It combines:

- A **real-time analytics dashboard** for multi-outlet monitoring (revenue, stock, expiry, demand trends)
- A **multi-agent AI pipeline** that guides kiosk owners through full business expansion planning — from site scouting to a final multi-phase strategic roadmap
- **ML-powered demand forecasting** for orders, revenue, stockout risk, waste, and reorder quantities
- A **3D inventory management** interface with live Supabase sync
- A **persistent AI chat** (CopilotKit + Gemini) that routes user intent to the correct data source or agent

The system supports 3 outlets: **Mid Valley Food Court** (outlet-1), **Sunway Pyramid Kiosk** (outlet-2), and **KLCC Food Corner** (outlet-3).

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Browser (Next.js)                          │
│   Dashboard Pages  │  Planning Canvas  │  CopilotKit Chat       │
└──────────────────────────────┬──────────────────────────────────┘
                               │ AG-UI Protocol
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              CopilotKit Runtime  (Next.js API Route)            │
│                  A2A Middleware Agent                           │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│           Orchestrator Agent  (ADK + Gemini 2.5-flash)          │
│                       Port 9000                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐   │
│   │  SQL MCP    │  │  RAG MCP    │  │  A2A Agent Routing   │   │
│   │  Port 9014  │  │  Port 9013  │  │  (A2A Protocol)      │   │
│   └──────┬──────┘  └──────┬──────┘  └──────────┬───────────┘   │
└──────────┼────────────────┼─────────────────────┼───────────────┘
           │                │                     │
           ▼                ▼                     ▼
     Supabase DB      OpenAI Embeds    ┌──────────────────────────┐
     (direct SQL)     (text-embed-3)  │   Specialized A2A Agents │
                                      │  ├─ Site Selection  9020  │
                                      │  ├─ Exp. Feasibility 9021 │
                                      │  ├─ Market Research 9022  │
                                      │  ├─ Risk Manager    9023  │
                                      │  ├─ Strategic Plan  9024  │
                                      │  └─ Forecast        9025  │
                                      └──────────────────────────┘
```

**Protocol Stack:**

| Layer | Protocol | Purpose |
|---|---|---|
| Browser ↔ CopilotKit API | HTTP/SSE | User messages, streaming responses |
| CopilotKit ↔ Orchestrator | AG-UI Protocol | Agent-UI communication |
| Orchestrator ↔ SQL/RAG | MCP over SSE | Tool calls for database and embeddings |
| Orchestrator ↔ Specialists | A2A Protocol (HTTP) | Agent-to-agent task delegation |

---

## 3. Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.4 | App Router, SSR, API routes |
| React | 19.0.0 | UI rendering |
| TypeScript | 5 | Type safety |
| TailwindCSS | 3.4.1 | Utility-first styling |
| CopilotKit | latest | AI chat, HITL actions, AG-UI protocol |
| @ag-ui/client | 0.0.40 | AG-UI HTTP agent client |
| @ag-ui/a2a-middleware | 0.0.2 | A2A middleware bridge |
| Recharts | 3.8.1 | Dashboard charts (line, bar, pie) |
| Three.js + @react-three | 0.184.0 | 3D inventory kiosk visualization |
| React Leaflet | 5.0.0 | Location maps with competitor markers |
| Radix UI | various | Accessible UI primitives |
| Lucide React | 0.477.0 | Icon library |
| next-themes | 0.4.6 | Dark/light mode |
| @supabase/supabase-js | 2.104.1 | Database client |
| SWR | 2.4.1 | Data fetching and caching |
| Concurrently | 9.1.2 | Run all agents + UI in one command |

### Backend (Python Agents)

| Technology | Purpose |
|---|---|
| Google ADK (Agent Development Kit) | LLM agent framework (LlmAgent, App, Runner) |
| A2A SDK | Agent-to-agent protocol (AgentCard, AgentExecutor, EventQueue) |
| FastMCP | MCP server definition and SSE transport |
| FastAPI + Uvicorn | HTTP server for A2A agent endpoints |
| Supabase Python client | Direct database access from agents |
| python-dotenv | Environment variable loading |
| requests | External API calls (Google Maps, BNM, Foursquare) |

### Infrastructure

| Service | Purpose |
|---|---|
| Supabase | PostgreSQL database + embeddings RPC |
| Google Cloud Run | Inventra ML Service hosting |
| Gemini 2.5-flash | Primary LLM for orchestrator |
| OpenAI text-embedding-3-small | RAG query embeddings |

---

## 4. Project Structure

```
Inventra/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard shell (uses DashboardLayout)
│   │   ├── page.tsx                # / — Dashboard Overview
│   │   ├── planning/page.tsx       # /planning — Business Intelligence Canvas
│   │   ├── location/page.tsx       # /location — Multi-outlet Location Cards
│   │   ├── inventory/page.tsx      # /inventory — 3D Inventory Management
│   │   └── settings/page.tsx       # /settings — User Preferences
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   └── api/
│       ├── copilotkit/route.ts     # CopilotKit runtime + A2A middleware
│       └── rag/embed/route.ts      # POST endpoint to sync data into RAG vector DB
│
├── agents/
│   ├── orchestrator.py             # Port 9000 — Main AG-UI agent (Gemini)
│   ├── sql_mcp_server.py           # Port 9014 — Supabase SQL tools (MCP)
│   ├── rag_mcp_server.py           # Port 9013 — Vector semantic search (MCP)
│   ├── site_selection_agent.py     # Port 9020 — Location scouting (A2A)
│   ├── expansion_feasibility_agent.py  # Port 9021 — Financial projection (A2A)
│   ├── market_researcher_agent.py  # Port 9022 — Market strategy (A2A)
│   ├── risk_manager_agent.py       # Port 9023 — Risk profiling (A2A)
│   ├── strategic_planner_agent.py  # Port 9024 — Expansion roadmap (A2A)
│   ├── forecast_agent.py           # Port 9025 — ML demand forecasting (A2A)
│   └── [legacy financial agents]   # Ports 9002–9008 (disabled, files kept)
│
├── components/
│   ├── travel-chat.tsx             # CopilotKit chat + all HITL actions
│   ├── DashboardLayout.tsx         # Layout: sidebar, header, chat panel
│   ├── FinancialDataContext.tsx     # Global expansion state (React Context)
│   ├── types/index.ts              # All TypeScript interfaces
│   ├── site-selection-utils.ts     # Data normalization (null-safe)
│   ├── forms/                      # HITL form components
│   ├── a2a/                        # A2A message visualizers
│   ├── ui/                         # Radix UI primitives (button, card, etc.)
│   └── [card components]           # See Component Library section
│
├── lib/
│   └── supabase.ts                 # Supabase client (anon key, frontend)
│
├── package.json                    # Scripts, dependencies
└── .env                            # Environment variables (not committed)
```

---

## 5. Main Features

### 5.1 Real-Time Analytics Dashboard

The home page (`/`) delivers an at-a-glance health check across all outlets.

**KPI Cards (top row):**
- Today's total orders (all outlets)
- Today's total revenue (RM)
- Average order value (RM)
- Predicted orders tomorrow
- Critical stock alerts count
- Expiring items count (next 7 days)

**Multi-Outlet Comparison Table:**
- Columns: Outlet Name, Orders, Revenue, Avg Order Value, Critical Stock, Warning Stock, Expiry Items
- Sortable columns
- Location badges (outlet-1/2/3)

**Charts:**
- Revenue trend (last 10 days, line chart)
- Orders trend with actual vs predicted (line chart)
- Top menu items by units sold (bar chart)
- Expiry urgency breakdown (pie chart)

**Data Source:** All dashboard data fetched directly from Supabase via the SQL MCP server tools. The orchestrator routes questions about numbers to `get_revenue_summary`, `get_stock_summary`, `get_expiry_summary`, `get_top_menu_items`, `get_orders_trend`.

---

### 5.2 Business Location Expansion Pipeline

The flagship feature. Activated by saying "I want to expand my business" or "find me a new kiosk location". A 5-agent sequential pipeline with 4 human-in-the-loop checkpoints.

```
User Intent Detected
      │
      ▼
[HITL FORM] gather_expansion_details
  - Target area (e.g., "Petaling Jaya")
  - Budget range (e.g., "RM 200,000–300,000")
  - Business type (e.g., "F&B Kiosk")
      │
      ▼
AGENT 1: Site Selection Expert (Port 9020)
  - Geocodes target area
  - Searches Foursquare for foot traffic density (venue_count × 400 + 2000)
  - Searches Google Places for F&B competitors within 800m radius
  - Calculates drive time from KLCC reference point
  - Scores 3 candidate locations: foot traffic + affordability + competition + growth
  - Returns: 3 site options with coordinates, rent (RM), daily foot traffic, competitor count
      │
[HITL CARD] display_site_selection_options
  User picks 1 of 3 locations
      │
      ▼
AGENT 2: Expansion Feasibility (Port 9021)
  - Fetches Bank Negara OPR rate
  - Calculates monthly revenue: foot_traffic × conversion_rate (1.5–2.3%) × avg_spend (RM 12–18) × 30
  - Calculates monthly costs: rent + 3 staff (RM 2,000–2,500 each) + COGS (30–35%) + utilities (RM 1,200–1,800)
  - Estimates initial investment: fit-out (RM 40–80k) + equipment (RM 25–45k) + deposit + working capital
  - Computes break-even months, ROI %, 12-month projections
  - Risk: Low (<18mo), Moderate (18–36mo), High (>36mo)
  - HITL confirm step (user reviews and accepts analysis)
      │
      ▼
AGENT 3: Market Researcher (Port 9022)
  - Calls Google Places Text Search for 10 competitors (price level analysis)
  - Calls data.gov.my for state population demographics
  - Generates 3 market positioning strategies: Premium / Value / Niche
  - Each strategy: TAM/SAM estimates, pricing (min/mid/max RM), AOV, customer profile, growth tactics
      │
[HITL CARD] display_market_strategy_options
  User picks 1 of 3 strategies
      │
      ▼
AGENT 4: Risk Manager (Port 9023)
  - Generates 3 risk profiles: Conservative / Balanced / Aggressive
  - Each profile: 5 risks (severity, likelihood, impact RM, mitigation, contingency)
  - Financial buffers: operating reserve, marketing buffer, staffing buffer, contingency fund
  - Contingency budget: Conservative 20–25% | Balanced 12–16% | Aggressive 6–8%
      │
[HITL CARD] display_risk_profile_options
  User picks 1 of 3 profiles
      │
      ▼
AGENT 5: Strategic Planner (Port 9024)
  - Synthesises all prior selections (location, financials, strategy, risk)
  - Generates 3 expansion roadmaps: Conservative / Standard / Aggressive
  - Each roadmap: 3 phases (pilot → regional → network), investment schedule,
    success metrics (month 6/12/24), comparison table (growth speed, capital, risk, complexity)
  - Provides finalRecommendation: recommended roadmap + reasoning + projected outcome
      │
[HITL CARD] display_strategic_roadmap_options
  User picks 1 of 3 roadmaps
      │
      ▼
Planning Canvas shows 5 slides:
  📍 Selected Location → 💰 Expansion Feasibility → 🎯 Market Strategy
  → 🛡️ Risk Profile → 🗺️ Strategic Roadmap (with AI recommendation block)
```

---

### 5.3 ML-Powered Demand Forecasting

Activated by phrases like "forecast tomorrow", "will we stock out?", "predict top sellers for outlet-2".

**Forecast Agent (Port 9025)** fetches live Supabase data, engineers ML features, and calls the Inventra ML Service (Google Cloud Run).

**Available Predictions:**

| Forecast Type | Input Features | Output |
|---|---|---|
| Daily Orders | lag_1/7, rolling_7/14, day_of_week, month_sin/cos, weekend flag | Predicted order count tomorrow |
| Revenue & AOV | order history, avg amounts | Forecasted revenue (RM), expected AOV (RM) |
| Stockout Risk | current qty, threshold, daily consumption rate | Risk % per item, days until stockout |
| Reorder Quantities | current stock, lead time, predicted consumption | Units to reorder per item |
| Expiry Waste Risk | expiry dates, days remaining, predicted consumption | Waste % risk, units at risk |
| Top Selling Items | historical item-level sales, day patterns | Top 5 predicted items tomorrow |

**Outlets:** outlet-1 (Mid Valley), outlet-2 (Sunway Pyramid), outlet-3 (KLCC)

---

### 5.4 Kiosk Analytics via Natural Language

The AI chat answers business data questions in plain English using SQL tools directly.

| User Question | Tool Called | Data Source |
|---|---|---|
| "What's today's revenue?" | `get_revenue_summary` | pos_orders |
| "Which items are critically low?" | `get_stock_summary` | inventory_stock |
| "What's expiring this week?" | `get_expiry_summary` | inventory_expiry |
| "What are the top sellers?" | `get_top_menu_items` | pos_order_items |
| "Is business growing?" | `get_orders_trend` | pos_orders_daily |
| "Compare all 3 outlets" | All SQL tools × 3 | All above tables |
| "Any business insights?" | `search_business_context` | RAG vector DB |

**Auto-fallback:** If today has no orders (e.g., demo/seeded data), the system automatically falls back to the most recent date with data, noting it in the response.

---

### 5.5 3D Inventory Management (`/inventory`)

- **Three.js visualization** of the kiosk layout with fridge, shelf, and freezer racks
- Items rendered as 3D shapes color-coded by status (red=critical, yellow=warning, green=ok)
- Click a rack to see item details in a side panel
- Rack flashes with animation on stock update
- **Real-time sync** via Supabase subscriptions (`useInventoryRealtime` hook)
- Stock update dialog: change current quantity inline
- Outlet selector: filter to outlet-1/2/3
- Stock summary badges: total critical/warning/ok counts

---

### 5.6 Location Overview (`/location`)

- Card-per-outlet display for all 3 locations
- Each card shows:
  - Predicted orders tomorrow (from `pos_orders_daily`)
  - Critical stock items count
  - Warning stock items count
  - Expiring items count
  - Address and location_id badge
- Data fetched client-side directly from Supabase

---

### 5.7 RAG Knowledge Base Sync

- **"Sync to AI"** button in the header calls `POST /api/rag/embed`
- Embeds latest Supabase data into the vector database using OpenAI `text-embedding-3-small`
- Enables the orchestrator to answer narrative/overview questions via `search_business_context` (RAG MCP tool)
- Match threshold: 0.3 similarity, top 6 results

---

## 6. Agent System

### Active Agents

| Agent | Port | Protocol | Model | Purpose |
|---|---|---|---|---|
| Orchestrator | 9000 | AG-UI | Gemini 2.5-flash | Intent routing, SQL/RAG/A2A dispatch |
| RAG MCP Server | 9013 | MCP/SSE | — | Semantic search over business context |
| SQL MCP Server | 9014 | MCP/SSE | — | Direct Supabase SQL queries |
| Site Selection Expert | 9020 | A2A | Gemini 2.5-flash | Location scoring with live APIs |
| Expansion Feasibility | 9021 | A2A | Gemini 2.5-flash | Financial projections for chosen site |
| Market Researcher | 9022 | A2A | Gemini 2.5-flash | Market segmentation, strategy options |
| Risk Manager | 9023 | A2A | Gemini 2.5-flash | Risk profiling, financial buffers |
| Strategic Planner | 9024 | A2A | Gemini 2.5-flash | Multi-phase expansion roadmaps |
| Forecast Agent | 9025 | A2A | Gemini 2.5-flash | ML demand forecasting via Cloud Run |

### Orchestrator Intent Categories

| Category | Trigger | Routing |
|---|---|---|
| B — Kiosk Numbers | revenue, orders, stock, expiry, top items | SQL MCP tools only |
| C — Kiosk Overview | "how is the business?", "any insights?" | RAG MCP only |
| E — Expansion | "expand", "new location", "open outlet" | 5-agent pipeline |
| F — Forecast | "forecast", "predict", "stockout", "reorder" | Forecast Agent |
| D — Other | greetings, unclear | Direct LLM answer |

### A2A Agent Pattern

All 5 expansion agents follow the same implementation pattern:

```python
# Ports, AgentCard, AgentSkill
# LlmAgent(model=GEMINI_MODEL, name=..., instruction=..., tools=[...])
# Runner with InMemoryArtifactService, InMemorySessionService, InMemoryMemoryService
# async def invoke(query, session_id) → returns JSON string
# AgentExecutor.execute() → event_queue.enqueue_event(new_agent_text_message(result))
# A2AStarletteApplication → uvicorn.run()
```

### Forecast Agent Tools

| Tool | ML Endpoint | Features Sent |
|---|---|---|
| `forecast_daily_orders` | `/predict/orders` | lag_1/7, rolling_7/14, day_of_week, month_sin/cos, weekend |
| `forecast_revenue_aov` | `/predict/revenue` | order history, amount history |
| `predict_stockout_risk` | `/predict/stockout` | current_qty, threshold, daily_consumption |
| `recommend_reorder_quantities` | `/predict/reorder` | stock levels, lead time, consumption rate |
| `predict_expiry_waste_risk` | `/predict/expiry-waste` | days_to_expiry, quantity, predicted_consumption |
| `predict_top_selling_items` | `/predict/top-items` | historical item sales, day features |

---

## 7. Frontend Pages & Routes

### `/` — Dashboard Overview

- KPI grid (6 cards)
- Multi-outlet comparison table
- Revenue & orders trend charts (Recharts)
- Top menu items chart
- Expiry alerts list
- Real-time data via SQL MCP through orchestrator or direct Supabase queries

### `/planning` — Business Intelligence Canvas

- Slideshow layout (up to 5 slides)
- Auto-advances to newest slide when agent data arrives
- Breadcrumb dot navigator with connecting lines
- Prev/Next navigation with slide counter
- Slides render in order: Selected Location → Expansion Feasibility → Market Strategy → Risk Profile → Strategic Roadmap
- Empty state: "Find Your Next Winning Location" prompt
- Data sourced from `FinancialDataContext`

### `/location` — Location & Strategy

- Cards for each outlet from `locations` Supabase table
- Predicted orders from `pos_orders_daily` (tomorrow's date)
- Stock status counts from `inventory_stock`
- Expiry item counts from `inventory_expiry`
- All queries run in parallel via `Promise.all`

### `/inventory` — Inventory & Waste

- Three.js 3D kiosk with colored inventory racks
- `LocationSelector` dropdown to switch outlets
- `RackDetailsPanel` shows items in selected rack
- `StockTable` with inline update capability
- `StockSummary` count badges
- Live Supabase subscription (`useInventoryRealtime`)

---

## 8. Component Library

### HITL (Human-in-the-Loop) Cards

These render inside the chat during the expansion flow and pause agent execution until user responds.

| Component | Action Name | Respond Payload |
|---|---|---|
| `ExpansionDetailsForm` | `gather_expansion_details` | `{ targetArea, budgetRange, businessType }` |
| `SiteSelectionCard` | `display_site_selection_options` | `{ selectedOptionId, selectedName, rentMonthlyRM, ... }` |
| `MarketStrategyOptionsCard` | `display_market_strategy_options` | `{ selectedStrategyId, selectedName, approach, ... }` |
| `RiskProfileOptionsCard` | `display_risk_profile_options` | `{ selectedProfileId, selectedName, riskTolerance, contingencyBudget, ... }` |
| `RoadmapOptionsCard` | `display_strategic_roadmap_options` | `{ selectedRoadmapId, selectedName, totalTimeline, totalInvestment, ... }` |
| `ExpansionFeasibilityCard` | `display_expansion_feasibility` | `"Expansion feasibility analysis reviewed and accepted."` |

### Canvas Cards (Planning Page Slides)

These render on the `/planning` page as read-only summaries.

| Component | Data Source | Key Info Shown |
|---|---|---|
| `SelectedSiteCard` | `selectedSiteOption` | Name, address, scores, pros/cons |
| `SiteMapCard` | `selectedSiteOption` | Leaflet map + competitor markers |
| `ExpansionFeasibilityCard` | `expansionFeasibilityData` | Monthly revenue/cost/profit, break-even, ROI, viability |
| `MarketStrategyCard` | `selectedMarketStrategy` | Positioning, TAM/SAM, pricing, customer profile |
| `RiskProfileCard` | `selectedRiskProfile` | Risks, severity, mitigation, financial buffers, pros/cons |
| `StrategicRoadmapCard` | `selectedRoadmap` + `roadmapData` | Phases, investment schedule, milestones, AI recommendation |

### A2A Visualizers

| Component | Purpose |
|---|---|
| `MessageToA2A` | Shows when orchestrator calls an agent (green → box with agent name) |
| `MessageFromA2A` | Shows agent response summary |

### Utility Components

| Component | Purpose |
|---|---|
| `DashboardLayout` | Sidebar + header + chat panel shell |
| `FinancialDataContext` | React Context holding all expansion state |
| `site-selection-utils.ts` | Null-safe normalization functions for streaming args |

### Data Normalization Pattern

All HITL cards receive streaming args from CopilotKit (arrive incrementally). Every `.map()` call requires a null guard:

```ts
// In every HITL card:
if (!opt?.fieldA || !opt?.fieldB) return null;

// Before passing to card component:
const data = normalizeXxxData(args);
if (!data?.items?.length) return <></>;
```

Normalize functions in `site-selection-utils.ts`:
- `normalizeSiteSelectionData(args)`
- `normalizeMarketStrategyData(args)`
- `normalizeRiskProfileData(args)`
- `normalizeRoadmapData(args)`

---

## 9. Data Flow & Protocols

### AG-UI Protocol (Browser ↔ Orchestrator)

CopilotKit speaks AG-UI over HTTP/SSE to the orchestrator. The orchestrator is wrapped in `ADKAgent.from_app()` via the `ag_ui_adk` adapter.

```
Browser → POST /api/copilotkit
  → A2AMiddlewareAgent injects send_message_to_a2a_agent tool
  → HttpAgent(url=orchestratorUrl) streams AG-UI events
  → Orchestrator processes, uses MCP tools or delegates to A2A agents
  → Events stream back to browser
```

### A2A Protocol (Orchestrator ↔ Agents)

When orchestrator calls `send_message_to_a2a_agent(agentName, task)`:

```
Orchestrator sends A2A message → http://localhost:{port}/
Agent receives, runs LLM with instruction + task
Agent returns JSON string via event_queue
Orchestrator receives response, parses JSON
Orchestrator calls display_* CopilotKit action with parsed data
```

### MCP Protocol (Orchestrator ↔ SQL/RAG)

```
orchestrator_agent = LlmAgent(tools=[sql_toolset, rag_toolset])
sql_toolset = McpToolset(SseConnectionParams(url="http://localhost:9014/sse"))
# Tools auto-discovered from MCP server at connection time
# Orchestrator calls tools like function calls, results returned as strings
```

### HITL Flow (renderAndWaitForResponse)

```
Orchestrator triggers action → CopilotKit pauses agent execution
  → React renders HITL card in chat
  → User interacts (form submit / select button)
  → respond(selection) called
  → CopilotKit sends result back to orchestrator
  → Orchestrator continues with next step
  → onSelectedXxxUpdate?.(data) called to update canvas state
```

**Critical:** `onXxxUpdate` callbacks must be called inside `respond()` (wrappedRespond), never during render — otherwise state updates during streaming cause infinite re-render loops.

---

## 10. Database Schema

### POS Tables

**`pos_orders`**
| Column | Type | Description |
|---|---|---|
| order_id | uuid | Primary key |
| total_amount | decimal | Order total in RM |
| outlet_id | string | outlet-1 / outlet-2 / outlet-3 |
| ordered_at | timestamp | Order datetime |

**`pos_order_items`**
| Column | Type | Description |
|---|---|---|
| order_id | uuid | Foreign key → pos_orders |
| item_name | string | Menu item name |
| qty | integer | Units sold |
| line_total | decimal | Line total in RM |

**`pos_orders_daily`**
| Column | Type | Description |
|---|---|---|
| business_date | date | Date |
| actual_orders | integer | Actual order count |
| predicted_orders | integer | ML-predicted order count |
| location_id | string | outlet-1 / outlet-2 / outlet-3 |

### Inventory Tables

**`inventory_stock`**
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| item_name | string | Item name |
| current_qty | integer | Current quantity |
| threshold_qty | integer | Reorder threshold |
| status | string | critical / warning / ok |
| unit | string | kg / pcs / L / etc. |
| location_id | string | outlet-1 / outlet-2 / outlet-3 |

**`inventory_expiry`**
| Column | Type | Description |
|---|---|---|
| item_name | string | Item name |
| quantity | integer | Units at this expiry |
| expiry_date | date | Expiry date |
| days_to_expiry | integer | Days remaining |
| location_id | string | outlet-1 / outlet-2 / outlet-3 |

### Location Table

**`locations`**
| Column | Type | Description |
|---|---|---|
| location_id | string | outlet-1 / outlet-2 / outlet-3 |
| location_name | string | e.g., Mid Valley Food Court |
| address | string | Full address |

### RAG Table

Supabase RPC function: `match_rag_documents(query_embedding, match_count, match_threshold)`
- Returns: `source_table`, `content` (matched text chunks)
- Embeddings stored as pgvector column

---

## 11. External APIs & Services

### Google APIs (Site Selection + Market Research)

| API | Used By | Purpose |
|---|---|---|
| Geocoding API | site_selection_agent | Address → lat/lng |
| Places Nearby Search | site_selection_agent | F&B competitors within 800m radius (max 15) |
| Distance Matrix API | site_selection_agent | Drive time from KLCC (3.1478, 101.6953) |
| Places Text Search | market_researcher_agent | 10 competitors, price level analysis |

**Key:** `GOOGLE_MAPS_API_KEY`

### Foursquare Places API

| Used By | Purpose | Formula |
|---|---|---|
| site_selection_agent | Venue density (foot traffic proxy) | foot_traffic = venue_count × 400 + 2000 |

**Category:** 13000 (Food & Beverage)
**Key:** `FOURSQUARE_API_KEY`

### Bank Negara Malaysia (BNM) API

| Endpoint | Used By | Purpose |
|---|---|---|
| `https://api.bnm.gov.my/public/opr` | expansion_feasibility_agent | Overnight Policy Rate for cost-of-capital |

Public API, no auth. Fallback: 3.0% if unavailable.

### Malaysian Government Open Data

| Endpoint | Used By | Purpose |
|---|---|---|
| `https://api.data.catalogue` (population_state) | market_researcher_agent | State population demographics |

Public API.

### Inventra ML Service (Google Cloud Run)

| Base URL | `https://kioskiq-ml-service-86519568652.us-central1.run.app` |
|---|---|
| Used By | forecast_agent.py |
| Endpoints | `/predict/orders`, `/predict/revenue`, `/predict/stockout`, `/predict/reorder`, `/predict/expiry-waste`, `/predict/top-items` |
| Auth | None (public Cloud Run) |

### OpenAI

| Service | Model | Used By |
|---|---|---|
| Embeddings | text-embedding-3-small | rag_mcp_server.py (query embedding) |

**Key:** `OPENAI_API_KEY`

### Google Gemini

| Model | Used By |
|---|---|
| gemini-2.5-flash | All agents (orchestrator + all 5 expansion agents + forecast agent) |

**Key:** `GOOGLE_API_KEY` or `GEMINI_API_KEY`

### Supabase

| Usage | Key Required |
|---|---|
| Frontend dashboard queries | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Agent SQL queries (elevated) | `SUPABASE_SERVICE_ROLE_KEY` |
| Vector match RPC | `SUPABASE_SERVICE_ROLE_KEY` |

---

## 12. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# LLM
GOOGLE_API_KEY=AIza...
OPENAI_API_KEY=sk-...

# External APIs
GOOGLE_MAPS_API_KEY=AIza...
FOURSQUARE_API_KEY=fsq...

# Agent Ports (optional — all have defaults)
ORCHESTRATOR_PORT=9000
RAG_MCP_PORT=9013
SQL_MCP_PORT=9014
SITE_SELECTION_PORT=9020
EXPANSION_FEASIBILITY_PORT=9021
MARKET_RESEARCHER_PORT=9022
RISK_MANAGER_PORT=9023
STRATEGIC_PLANNER_PORT=9024
FORECAST_AGENT_PORT=9025

# Agent URLs (used by route.ts — optional, defaults to localhost)
ORCHESTRATOR_URL=http://localhost:9000
SITE_SELECTION_AGENT_URL=http://localhost:9020
EXPANSION_FEASIBILITY_AGENT_URL=http://localhost:9021
MARKET_RESEARCHER_AGENT_URL=http://localhost:9022
RISK_MANAGER_AGENT_URL=http://localhost:9023
STRATEGIC_PLANNER_AGENT_URL=http://localhost:9024
FORECAST_AGENT_URL=http://localhost:9025

# Gemini model override (optional)
GEMINI_MODEL=gemini-2.5-flash

# RAG/SQL MCP URLs (optional — used by orchestrator)
RAG_MCP_URL=http://localhost:9013/sse
SQL_MCP_URL=http://localhost:9014/sse
```

---

## 13. Running the Project

### Prerequisites

- Node.js 18+
- Python 3.11+ with virtual environment at `agents/.venv`
- All Python dependencies installed in `.venv`

### Install Dependencies

```bash
# Frontend
npm install

# Python agents (Windows)
cd agents
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
```

### Start Everything

```bash
npm run dev
```

This runs 10 processes concurrently:

| Name | Command |
|---|---|
| UI | `next dev --turbopack` |
| RAG | `python agents/rag_mcp_server.py` |
| SQL | `python agents/sql_mcp_server.py` |
| Orch | `python agents/orchestrator.py` |
| Forecast | `python agents/forecast_agent.py` |
| Site | `python agents/site_selection_agent.py` |
| ExpFeas | `python agents/expansion_feasibility_agent.py` |
| Market | `python agents/market_researcher_agent.py` |
| Risk | `python agents/risk_manager_agent.py` |
| Strat | `python agents/strategic_planner_agent.py` |

### Start Individual Agents

```bash
npm run dev:orchestrator
npm run dev:forecast
npm run dev:site-selection
npm run dev:expansion-feasibility
npm run dev:market-researcher
npm run dev:risk-manager
npm run dev:strategic-planner
npm run dev:rag
npm run dev:sql
```

### Sync RAG Knowledge Base

Click **"Sync to AI"** in the dashboard header, or:

```bash
curl -X POST http://localhost:3000/api/rag/embed
```

---

## Appendix: Key Design Decisions

### Why Gemini 2.5-flash for all agents?
Fast inference is critical for a 5-agent sequential pipeline. Each agent in the expansion flow is a separate HTTP round-trip. Gemini 2.5-flash provides sub-5s response times while maintaining sufficient reasoning quality for JSON-structured financial outputs.

### Why MCP for SQL/RAG instead of direct A2A?
SQL and RAG are called as tools (in-context function calls) by the orchestrator, not as separate agents. MCP over SSE gives the orchestrator native tool-calling semantics — the LLM sees them as functions, not as messages to send to another system. A2A is reserved for agents that require their own LLM reasoning.

### Why A2AMiddlewareAgent fragility matters?
If any URL in `agentUrls` is unreachable at startup, the entire middleware fails — no cards render in the chat. Every agent listed in `route.ts` must be running when `npm run dev` starts.

### HITL state update timing
All canvas state updates (`onSelectedXxxUpdate`, `onRoadmapDataUpdate`) are called inside `wrappedRespond` (fires once on user click), never during the render pass of `renderAndWaitForResponse`. Calling setState during streaming render causes an infinite re-render loop.

### Auto-fallback for revenue data
The SQL MCP server's `get_revenue_summary` and `get_top_menu_items` automatically fall back to the most recent date with data when today has no orders. This prevents false "no data" responses on demo or development databases with historical seed data.
