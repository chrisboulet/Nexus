"""
Notion API Connector
Create and manage TODOs in Notion database
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from notion_client import Client


class NotionConnector:
    """Wrapper for Notion API"""

    def __init__(self, api_token: str, database_id: str):
        """
        Initialize Notion connector

        Args:
            api_token: Notion integration token
            database_id: Database ID for TODOs
        """
        self.api_token = api_token
        self.database_id = database_id
        self.logger = logging.getLogger("nexus.notion")

        self.client = Client(auth=api_token)

    def create_todo(
        self,
        title: str,
        todo_type: str,
        description: str = "",
        date: Optional[datetime] = None,
        confidence: float = 1.0,
        source: str = ""
    ) -> Optional[Dict[str, Any]]:
        """
        Create a TODO in Notion database

        Args:
            title: TODO title
            todo_type: Type (engagement, demande, deadline)
            description: Description details
            date: Associated date
            confidence: Confidence score (0-1)
            source: Source of the TODO (e.g., "Conversation with X")

        Returns:
            Created page object or None if failed
        """
        try:
            properties = {
                "Titre": {
                    "title": [{"text": {"content": title}}]
                },
                "Type": {
                    "select": {"name": todo_type.capitalize()}
                },
                "Statut": {
                    "select": {"name": "À faire"}
                }
            }

            # Add description if provided
            if description:
                properties["Description"] = {
                    "rich_text": [{"text": {"content": description[:2000]}}]
                }

            # Add date if provided
            if date:
                properties["Date"] = {
                    "date": {"start": date.isoformat()}
                }

            # Add confidence score
            properties["Confiance"] = {
                "number": confidence
            }

            # Add source
            if source:
                properties["Source"] = {
                    "rich_text": [{"text": {"content": source[:1000]}}]
                }

            # Create page
            page = self.client.pages.create(
                parent={"database_id": self.database_id},
                properties=properties
            )

            self.logger.info(f"Created TODO: {title} (type: {todo_type})")
            return page

        except Exception as e:
            self.logger.error(f"Failed to create TODO '{title}': {e}")
            return None

    def create_todos_batch(
        self,
        priorities: Dict[str, List[Dict[str, Any]]]
    ) -> Dict[str, int]:
        """
        Create multiple TODOs from priorities

        Args:
            priorities: Dictionary with keys: engagements, demandes, deadlines

        Returns:
            Dictionary with counts of created TODOs per type
        """
        stats = {
            "engagements": 0,
            "demandes": 0,
            "deadlines": 0,
            "total": 0
        }

        # Create engagements
        for item in priorities.get("engagements", []):
            result = self.create_todo(
                title=item.get("title", "Sans titre"),
                todo_type="engagement",
                description=item.get("description", ""),
                confidence=item.get("confidence", 1.0),
                source=item.get("source", "")
            )
            if result:
                stats["engagements"] += 1
                stats["total"] += 1

        # Create demandes
        for item in priorities.get("demandes", []):
            result = self.create_todo(
                title=item.get("title", "Sans titre"),
                todo_type="demande",
                description=item.get("description", ""),
                confidence=item.get("confidence", 1.0),
                source=item.get("source", "")
            )
            if result:
                stats["demandes"] += 1
                stats["total"] += 1

        # Create deadlines
        for item in priorities.get("deadlines", []):
            result = self.create_todo(
                title=item.get("title", "Sans titre"),
                todo_type="deadline",
                description=item.get("description", ""),
                date=item.get("date"),
                confidence=item.get("confidence", 1.0),
                source=item.get("source", "")
            )
            if result:
                stats["deadlines"] += 1
                stats["total"] += 1

        self.logger.info(f"Created {stats['total']} TODOs in Notion")
        return stats

    def get_database_url(self) -> str:
        """Get Notion database URL"""
        return f"https://notion.so/{self.database_id.replace('-', '')}"

    def is_connected(self) -> bool:
        """Check if connector is configured"""
        return bool(self.api_token and self.database_id)
