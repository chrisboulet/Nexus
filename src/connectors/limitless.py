"""
Limitless API Connector
Fetch lifelogs, conversations, and meeting notes from Limitless
"""

import httpx
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta


class LimitlessConnector:
    """Wrapper for Limitless API"""

    def __init__(self, api_key: str, endpoint: str = "https://api.limitless.ai/v1"):
        """
        Initialize Limitless connector

        Args:
            api_key: Limitless API key
            endpoint: API endpoint URL
        """
        self.api_key = api_key
        self.endpoint = endpoint.rstrip('/')
        self.logger = logging.getLogger("nexus.limitless")

        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    async def get_lifelogs(
        self,
        date: Optional[str] = None,
        days: int = 1,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Fetch lifelogs from Limitless

        Args:
            date: Specific date (ISO format YYYY-MM-DD)
            days: Number of days to look back
            limit: Maximum number of lifelogs

        Returns:
            List of lifelog objects with transcripts
        """
        try:
            if date:
                # Specific date
                since = datetime.fromisoformat(date)
            else:
                # Last N days
                since = datetime.now() - timedelta(days=days)

            self.logger.info(f"Fetching lifelogs since {since.isoformat()}")

            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.endpoint}/lifelogs",
                    headers=self.headers,
                    params={
                        "since": since.isoformat(),
                        "limit": limit,
                        "include_transcripts": True
                    },
                    timeout=30.0
                )
                response.raise_for_status()

                data = response.json()
                lifelogs = data.get('lifelogs', [])
                self.logger.info(f"Retrieved {len(lifelogs)} lifelogs from Limitless")
                return lifelogs

        except httpx.HTTPError as e:
            self.logger.error(f"Failed to fetch lifelogs: {e}")
            return []

    async def search_with_transcripts(
        self,
        date: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search lifelogs with transcripts for a specific date

        Args:
            date: Date in YYYY-MM-DD format
            limit: Maximum number of results

        Returns:
            List of lifelog entries with full transcripts
        """
        return await self.get_lifelogs(date=date, days=1, limit=limit)

    async def get_conversations(self, days: int = 1) -> List[Dict[str, Any]]:
        """
        Get recent conversations

        Args:
            days: Number of days to look back

        Returns:
            List of conversation objects
        """
        try:
            since = datetime.now() - timedelta(days=days)

            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.endpoint}/conversations",
                    headers=self.headers,
                    params={
                        "since": since.isoformat()
                    },
                    timeout=30.0
                )
                response.raise_for_status()

                data = response.json()
                conversations = data.get('conversations', [])
                self.logger.info(f"Retrieved {len(conversations)} conversations")
                return conversations

        except httpx.HTTPError as e:
            self.logger.error(f"Failed to fetch conversations: {e}")
            return []

    def is_connected(self) -> bool:
        """Check if connector is configured"""
        return bool(self.api_key)
