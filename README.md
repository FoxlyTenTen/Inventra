# Inventra

> AI-Powered F&B Kiosk Operations Intelligence for Malaysian Mall Operators

Inventra is a full-stack AI platform that helps F&B kiosk owners manage daily operations and plan business expansion — all from a single dashboard.

---

## What It Does

- **Real-time dashboard** — monitor revenue, orders, stock levels, and expiry alerts across 3 outlets simultaneously
- **AI expansion pipeline** — 5-agent system that guides you from "I want to expand" to a full multi-phase strategic roadmap, with human-in-the-loop checkpoints at every stage
- **ML demand forecasting** — predict tomorrow's orders, stockout risk, reorder quantities, and top-selling items
- **3D inventory management** — visualize your kiosk's stock in a Three.js interface with live Supabase sync
- **Natural language analytics** — ask "What's today's revenue?" or "Which items are expiring this week?" and get instant answers

---

## Architecture

```
Browser (Next.js)
    │ AG-UI Protocol
    ▼
CopilotKit Runtime + A2A Middleware
    │ HTTP
    ▼
Orchestrator Agent (Gemini 2.5-flash, Port 9000)
    ├── SQL MCP Server (Port 9014) → Supabase
    ├── RAG MCP Server (Port 9013) → Vector DB
    └── A2A Expansion Agents
        ├── Site Selection      (Port 9020)
        ├── Expansion Feasibility (Port 9021)
        ├── Market Researcher   (Port 9022)
        ├── Risk Manager        (Port 9023)
        ├── Strategic Planner   (Port 9024)
        └── Forecast Agent      (Port 9025) → Google Cloud Run ML
```

**Protocol stack:**

| Layer | Protocol |
|---|---|
| Browser ↔ CopilotKit | HTTP/SSE |
| CopilotKit ↔ Orchestrator | AG-UI |
| Orchestrator ↔ SQL/RAG | MCP over SSE |
| Orchestrator ↔ Agents | A2A (HTTP) |

---

## Expansion Pipeline

When a user says "I want to expand my business":

1. **HITL Form** — collect target area, budget, business type
2. **Site Selection Agent** — scores 3 candidate locations using Foursquare foot traffic, Google Places competitors, and drive time
3. **User picks a location**
4. **Feasibility Agent** — financial projections: monthly revenue/cost, break-even, ROI, using live BNM OPR rate
5. **Market Researcher Agent** — 3 market positioning strategies with TAM/SAM, pricing, and customer profiles
6. **User picks a strategy**
7. **Risk Manager Agent** — 3 risk profiles (Conservative / Balanced / Aggressive) with mitigations and financial buffers
8. **User picks a risk profile**
9. **Strategic Planner Agent** — 3 expansion roadmaps with phased investment schedules and an AI recommendation
10. **Planning Canvas** — all 5 results rendered as a navigable slideshow

---

## Tech Stack

**Frontend:** Next.js 16, React 19, TypeScript, TailwindCSS, CopilotKit, Recharts, Three.js, React Leaflet, Supabase JS

**Backend:** Google ADK, A2A SDK, FastMCP, FastAPI, Uvicorn, Supabase Python

**Infrastructure:** Supabase (PostgreSQL + pgvector), Google Cloud Run (ML service), Gemini 2.5-flash, OpenAI text-embedding-3-small

**External APIs:** Google Maps (Geocoding, Places, Distance Matrix), Foursquare Places, Bank Negara Malaysia OPR, data.gov.my

---

## Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- API keys: `GOOGLE_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_MAPS_API_KEY`, `FOURSQUARE_API_KEY`
- Supabase project with the schema from `supabase_multi_location.sql`

### Install

```bash
# Frontend
npm install

# Python agents (Windows)
cd agents
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
```

### Configure

```bash
cp .env.example .env
# Fill in your keys in .env
```

### Run

```bash
npm run dev
```

This starts all 10 services concurrently: the Next.js UI and all 9 Python agents.

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GOOGLE_API_KEY=
OPENAI_API_KEY=
GOOGLE_MAPS_API_KEY=
FOURSQUARE_API_KEY=
```

---

## Key Pages

| Route | Description |
|---|---|
| `/` | Dashboard — KPIs, charts, multi-outlet comparison |
| `/planning` | Business Intelligence Canvas — expansion pipeline results |
| `/location` | Per-outlet cards with predicted orders and stock status |
| `/inventory` | 3D kiosk visualization with live stock management |

---

## Sync AI Knowledge Base

After seeding data, click **"Sync to AI"** in the header (or `POST /api/rag/embed`) to embed the latest Supabase data into the RAG vector store.
