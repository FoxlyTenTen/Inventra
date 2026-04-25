"""
Fast Orchestrator Agent (ADK + AG-UI Protocol)
Using ILMU GLM-5.1 through Anthropic-compatible endpoint.

This version is optimized for speed:
- shorter system prompt
- streaming enabled
- lower retry count
- Anthropic-compatible ILMU endpoint
- less token bloat
"""

from __future__ import annotations

import os
from datetime import datetime

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI

from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint
from google.adk.agents import LlmAgent
from google.adk.apps import App
from google.adk.models.lite_llm import LiteLlm
from google.adk.plugins import ReflectAndRetryToolPlugin
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset, SseConnectionParams


load_dotenv()

# Makes the UI feel faster because output can stream progressively
os.environ["GOOGLE_ADK_PROGRESSIVE_SSE_STREAMING"] = "1"

ILMU_API_KEY = os.getenv("ILMU_API_KEY")
ILMU_MODEL = os.getenv("ILMU_MODEL", "ilmu-glm-5.1")

if not ILMU_API_KEY:
    raise ValueError("Missing ILMU_API_KEY in .env file")

# ILMU Anthropic-compatible endpoint
os.environ["ANTHROPIC_API_KEY"] = ILMU_API_KEY
os.environ["ANTHROPIC_BASE_URL"] = os.getenv(
    "ANTHROPIC_BASE_URL",
    "https://api.ilmu.ai/anthropic"
)

current_date = datetime.now().strftime("%Y-%m-%d")


ORCHESTRATOR_INSTRUCTION = f"""
You are a fast Financial Planning Orchestrator.

Current date: {current_date}

Your job:
Route the user to the correct financial workflow using the fewest required steps.

Available agents:
- Coach Agent: budget advice, spending analysis, monthly budget advice
- Database Agent: add/list/delete transactions
- Product Research Agent: real-time product price search
- Investment Agent: investment strategy and portfolio suggestion
- Feasibility Agent: affordability, savings gap, savings rate
- Financial Planner Agent: final financial roadmap
- Summary Agent: dashboard summary of user input

Routing rules:

1. Deep financial plan
Trigger only if user asks for:
financial plan, budget plan, savings roadmap, or "can I afford X" with detailed analysis.

Workflow:
- gather_financial_planning_details
- Summary Agent
- Feasibility Agent
- Investment Agent
- Product Research Agent only if current product price is needed
- Financial Planner Agent

2. Quick product or buying advice
Examples:
"find cheap shoes", "price of iPhone", "should I buy this for RM200"

Workflow:
- If user gives price, skip Product Research Agent
- If user does not give price, call Product Research Agent
- Then call Coach Agent

3. Transactions
Examples:
"I spent RM50", "add income", "show expenses"

Workflow:
- Add transaction: gather_transaction_details then Database Agent
- View transaction: Database Agent

4. Business data queries (inventory / sales / stock)
Examples:
"what stock is low?", "what expires soon?", "what sold the most?", "show today's sales", "any expiry alerts?"

Workflow:
- Call search_business_data with the user's question as the query
- Summarize the retrieved context clearly for the user
- Do NOT call any A2A agent for this workflow

Speed rules:
- Do not call unnecessary agents.
- Do not repeat the same agent for the same information.
- Keep progress messages short.
- Do not explain internal reasoning.
- Use deterministic calculation results directly.
- If independent calls are supported, they may run in parallel.
"""


RAG_MCP_URL = os.getenv("RAG_MCP_URL", "http://localhost:9013/sse")

rag_toolset = McpToolset(
    connection_params=SseConnectionParams(url=RAG_MCP_URL)
)

orchestrator_agent = LlmAgent(
    name="OrchestratorAgent",
    model=LiteLlm(model=f"anthropic/{ILMU_MODEL}"),
    tools=[rag_toolset],
    instruction=ORCHESTRATOR_INSTRUCTION,
)

orchestrator_app = App(
    name="orchestrator_app",
    root_agent=orchestrator_agent,
    plugins=[
        # Faster than 3 retries. Use plugins=[] if you want maximum speed.
        ReflectAndRetryToolPlugin(max_retries=1),
    ],
)

adk_orchestrator_agent = ADKAgent.from_app(
    app=orchestrator_app,
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True,
)

app = FastAPI(title="Fast Financial Planning Orchestrator")
add_adk_fastapi_endpoint(app, adk_orchestrator_agent, path="/")


if __name__ == "__main__":
    port = int(os.getenv("ORCHESTRATOR_PORT", 9000))

    print(f"Starting Fast Orchestrator Agent on http://0.0.0.0:{port}")
    print(f"Using model: {ILMU_MODEL}")
    print(f"Using Anthropic base URL: {os.environ['ANTHROPIC_BASE_URL']}")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="warning",
    )