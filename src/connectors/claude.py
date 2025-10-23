"""
Claude API Connector
Analyze lifelogs using Anthropic Claude
"""

import logging
import json
from typing import Dict, List, Any
from anthropic import Anthropic


class ClaudeConnector:
    """Wrapper for Anthropic Claude API"""

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-5-20250929"):
        """
        Initialize Claude connector

        Args:
            api_key: Anthropic API key
            model: Claude model to use
        """
        self.api_key = api_key
        self.model = model
        self.logger = logging.getLogger("nexus.claude")

        self.client = Anthropic(api_key=api_key)

    async def analyze_priorities(
        self,
        lifelogs: List[Dict[str, Any]],
        period: str = "today"
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Analyze lifelogs and extract priorities

        Args:
            lifelogs: List of lifelog objects with transcripts
            period: Time period (today/week)

        Returns:
            Dictionary with engagements, demandes, deadlines
        """
        try:
            # Prepare transcript text
            transcripts = self._format_lifelogs(lifelogs)

            if not transcripts:
                self.logger.warning("No transcripts to analyze")
                return {"engagements": [], "demandes": [], "deadlines": []}

            # Build prompt
            prompt = self._build_analysis_prompt(transcripts, period)

            self.logger.info(f"Analyzing {len(lifelogs)} lifelogs with Claude")

            # Call Claude API
            message = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            # Parse response
            response_text = message.content[0].text
            priorities = self._parse_response(response_text)

            self.logger.info(
                f"Extracted {len(priorities.get('engagements', []))} engagements, "
                f"{len(priorities.get('demandes', []))} demandes, "
                f"{len(priorities.get('deadlines', []))} deadlines"
            )

            return priorities

        except Exception as e:
            self.logger.error(f"Failed to analyze priorities: {e}")
            return {"engagements": [], "demandes": [], "deadlines": []}

    def _format_lifelogs(self, lifelogs: List[Dict[str, Any]]) -> str:
        """Format lifelogs for analysis"""
        formatted = []

        for log in lifelogs:
            date = log.get("date", "Unknown date")
            title = log.get("title", "Untitled")
            transcript = log.get("transcript", "")

            if transcript:
                formatted.append(f"""
--- Lifelog: {title} ({date}) ---
{transcript}
""")

        return "\n".join(formatted)

    def _build_analysis_prompt(self, transcripts: str, period: str) -> str:
        """Build prompt for priority detection"""
        return f"""Tu es un assistant IA spécialisé dans l'analyse de conversations et notes vocales pour Christian Boulet, fractional CTO.

Ta mission : Analyser les transcripts ci-dessous et identifier les priorités d'action.

Critères de détection :

1. **ENGAGEMENTS PRIS** - Actions que Christian a promis de faire
   - Phrases comme "je vais...", "je te reviens avec...", "je m'engage à..."
   - Promesses faites à des clients/prospects
   - Actions spécifiques mentionnées

2. **DEMANDES REÇUES** - Requêtes nécessitant une action de Christian
   - Questions directes : "Peux-tu...", "J'aurais besoin de...", "Pourrais-tu..."
   - Requêtes clients à traiter
   - Informations demandées

3. **DEADLINES** - Urgences temporelles
   - Dates explicites mentionnées
   - "Avant [date]", "Pour [jour]", "D'ici [deadline]"
   - Échéances importantes

Période analysée : {period}

Transcripts :
{transcripts}

Retourne un objet JSON structuré comme ceci (et UNIQUEMENT du JSON valide, rien d'autre) :

{{
  "engagements": [
    {{
      "title": "Description courte de l'engagement",
      "description": "Détails supplémentaires",
      "confidence": 0.95,
      "source": "Conversation avec [nom] - [date]"
    }}
  ],
  "demandes": [
    {{
      "title": "Description de la demande",
      "description": "Contexte et détails",
      "confidence": 0.90,
      "source": "Conversation avec [nom] - [date]"
    }}
  ],
  "deadlines": [
    {{
      "title": "Action avec deadline",
      "description": "Détails",
      "date": "YYYY-MM-DD",
      "confidence": 0.85,
      "source": "Conversation avec [nom] - [date]"
    }}
  ]
}}

IMPORTANT : Retourne UNIQUEMENT le JSON, pas de texte avant ou après."""

    def _parse_response(self, response: str) -> Dict[str, List[Dict[str, Any]]]:
        """Parse Claude's JSON response"""
        try:
            # Extract JSON from response (in case there's surrounding text)
            start = response.find('{')
            end = response.rfind('}') + 1

            if start >= 0 and end > start:
                json_str = response[start:end]
                priorities = json.loads(json_str)
                return priorities
            else:
                self.logger.error("No JSON found in Claude response")
                return {"engagements": [], "demandes": [], "deadlines": []}

        except json.JSONDecodeError as e:
            self.logger.error(f"Failed to parse Claude response as JSON: {e}")
            self.logger.debug(f"Response was: {response}")
            return {"engagements": [], "demandes": [], "deadlines": []}

    def is_connected(self) -> bool:
        """Check if connector is configured"""
        return bool(self.api_key)
