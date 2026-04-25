"""
Site Selection Expert Agent (ADK + A2A Protocol)

First agent in the expansion strategy pipeline.
When a user wants to expand their business location, this agent
generates 3 distinct candidate site options with pros/cons/scores.
"""
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

# A2A Imports
from a2a.server.apps import A2AStarletteApplication
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from a2a.types import AgentCapabilities, AgentCard, AgentSkill
from a2a.server.agent_execution import AgentExecutor, RequestContext
from a2a.server.events import EventQueue
from a2a.utils import new_agent_text_message

# ADK Imports
from google.adk.agents.llm_agent import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.memory.in_memory_memory_service import InMemoryMemoryService
from google.adk.artifacts import InMemoryArtifactService
from google.genai import types


SITE_SELECTION_INSTRUCTION = """
You are the SITE SELECTION EXPERT AGENT for KioskIQ.

KioskIQ is used by F&B kiosk owners operating in Malaysian shopping malls.
The user wants to expand and open a NEW kiosk outlet.

YOUR TASK:
Generate exactly 3 candidate site options for their new F&B kiosk.
Each option must be distinctly different in trade-offs — do NOT make one option obviously best.

IMPORTANT RULES:
- All monetary values in Malaysian Ringgit (RM)
- Locations must be realistic Malaysian shopping malls or commercial areas
- If the user specifies a city or area, base options in that area
- If no area specified, suggest options across Klang Valley (KL/Selangor)
- Think like an F&B consultant: foot traffic, anchor tenants, competitor density, rent PSF are key

THE 3 OPTION TYPES:
1. HIGH-TRAFFIC PREMIUM — e.g. major mall like Pavilion, KLCC, Mid Valley. High rent, high traffic.
2. GROWING SUBURBAN — e.g. upcoming area like Bangsar South, Damansara, Puchong. Lower rent, growing demographic.
3. MIXED-USE / COMMUNITY — e.g. neighbourhood mall, transit hub, university area. Moderate rent, loyal regulars.

For each option, fill this data:
- name: the mall/area name
- type: one of "High-Traffic Premium" / "Growing Suburban" / "Community Hub"
- summary: 1-sentence description
- metrics:
  - footTrafficDaily: estimated daily visitors (integer)
  - rentMonthlyRM: estimated monthly rent in RM (integer)
  - competitorCount: estimated number of F&B competitors in same mall/area (integer)
  - populationNearby: estimated population within 3km (integer)
  - driveTimeFromCityCentre: e.g. "5 min" or "25 min"
- scores (all out of 10):
  - footTrafficScore
  - affordabilityScore (10 = cheapest)
  - competitionScore (10 = least competition)
  - growthScore (10 = fastest growing area)
  - overallScore: average of all 4 × 10
- pros: list of 3-4 specific benefits
- cons: list of 2-3 specific drawbacks

Return ONLY valid JSON in this exact format:
{
  "agentName": "Site Selection Expert",
  "actionType": "SITE_SELECTION_OPTIONS",
  "targetArea": "<area the user mentioned or 'Klang Valley'>",
  "userPrompt": "Here are 3 location options for your new F&B kiosk. Review the trade-offs and select the one that best fits your expansion strategy.",
  "options": [
    {
      "optionId": "option-1",
      "name": "<mall or area name>",
      "type": "High-Traffic Premium",
      "summary": "<one sentence>",
      "metrics": {
        "footTrafficDaily": 0,
        "rentMonthlyRM": 0,
        "competitorCount": 0,
        "populationNearby": 0,
        "driveTimeFromCityCentre": ""
      },
      "scores": {
        "footTrafficScore": 0,
        "affordabilityScore": 0,
        "competitionScore": 0,
        "growthScore": 0,
        "overallScore": 0
      },
      "pros": [],
      "cons": []
    },
    { "optionId": "option-2", "type": "Growing Suburban", ... },
    { "optionId": "option-3", "type": "Community Hub", ... }
  ],
  "nextStep": "Select a location to proceed to financial scenario analysis."
}

No extra text. No markdown. Just the JSON object.
"""


class SiteSelectionAgent:
    def __init__(self):
        self._agent = self._build_agent()
        self._user_id = "remote_agent"
        self._runner = Runner(
            app_name=self._agent.name,
            agent=self._agent,
            artifact_service=InMemoryArtifactService(),
            session_service=InMemorySessionService(),
            memory_service=InMemoryMemoryService(),
        )

    def _build_agent(self) -> LlmAgent:
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        return LlmAgent(
            model=model_name,
            name="site_selection_agent",
            description=(
                "Site Selection Expert for F&B kiosk expansion in Malaysia. "
                "Generates 3 candidate mall/location options with metrics, scores, pros and cons."
            ),
            instruction=SITE_SELECTION_INSTRUCTION,
            tools=[],
        )

    async def invoke(self, query: str, session_id: str) -> str:
        session = await self._runner.session_service.get_session(
            app_name=self._agent.name, user_id=self._user_id, session_id=session_id
        )
        if not session:
            session = await self._runner.session_service.create_session(
                app_name=self._agent.name,
                user_id=self._user_id,
                state={},
                session_id=session_id,
            )

        content = types.Content(
            role="user", parts=[types.Part.from_text(text=query)]
        )

        response_text = ""
        async for event in self._runner.run_async(
            user_id=self._user_id, session_id=session.id, new_message=content
        ):
            if event.is_final_response() and event.content:
                response_text = getattr(event.content.parts[0], "text", "")
                break

        # Strip markdown code fences if present
        cleaned = response_text.strip()
        if "```json" in cleaned:
            cleaned = cleaned.split("```json")[1].split("```")[0].strip()
        elif "```" in cleaned:
            cleaned = cleaned.split("```")[1].split("```")[0].strip()

        return cleaned


# --- Server Setup ---
port = int(os.getenv("SITE_SELECTION_PORT", 9020))

skill = AgentSkill(
    id="site_selection_agent",
    name="Site Selection Expert",
    description=(
        "Analyses Malaysian mall locations for F&B kiosk expansion. "
        "Returns 3 candidate sites with foot traffic, rent, competition scores, pros and cons."
    ),
    tags=["expansion", "location", "site", "kiosk", "mall"],
    examples=[
        "I want to expand my business location",
        "Help me find a new outlet location in KL",
        "I want to open a second kiosk",
    ],
)

public_agent_card = AgentCard(
    name="Site Selection Expert Agent",
    description="F&B kiosk site selection specialist for Malaysian malls.",
    url=f"http://localhost:{port}/",
    version="1.0.0",
    defaultInputModes=["text"],
    defaultOutputModes=["text"],
    capabilities=AgentCapabilities(streaming=True),
    skills=[skill],
)


class SiteSelectionExecutor(AgentExecutor):
    def __init__(self):
        self.agent = SiteSelectionAgent()

    async def execute(self, context: RequestContext, event_queue: EventQueue) -> None:
        result = await self.agent.invoke(
            context.get_user_input(),
            getattr(context, "context_id", "default"),
        )
        await event_queue.enqueue_event(new_agent_text_message(result))

    async def cancel(self, context, event_queue):
        pass


def main():
    server = A2AStarletteApplication(
        agent_card=public_agent_card,
        http_handler=DefaultRequestHandler(SiteSelectionExecutor(), InMemoryTaskStore()),
        extended_agent_card=public_agent_card,
    )
    print(f"Starting Site Selection Expert Agent on port {port}")
    uvicorn.run(server.build(), host="0.0.0.0", port=port)


if __name__ == "__main__":
    main()
