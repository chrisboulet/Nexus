"""
Notion integration client
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from notion_client import Client as NotionClient
from notion_client.errors import APIResponseError


class NotionCRMClient:
    """Client for interacting with Notion CRM"""
    
    def __init__(
        self,
        api_token: str,
        database_id: str,
        page_size: int = 100
    ):
        """
        Initialize Notion CRM client
        
        Args:
            api_token: Notion integration token
            database_id: Notion database ID for CRM
            page_size: Number of results per page
        """
        self.api_token = api_token
        self.database_id = database_id
        self.page_size = page_size
        self.logger = logging.getLogger("nexus.notion")
        
        self.client = NotionClient(auth=api_token)
    
    def get_database_entries(
        self,
        filter_params: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Get entries from Notion database
        
        Args:
            filter_params: Optional filter parameters
            
        Returns:
            List of database entries
        """
        try:
            query_params = {
                "database_id": self.database_id,
                "page_size": self.page_size
            }
            
            if filter_params:
                query_params["filter"] = filter_params
            
            response = self.client.databases.query(**query_params)
            
            entries = response.get('results', [])
            self.logger.info(f"Retrieved {len(entries)} entries from Notion database")
            return entries
            
        except APIResponseError as e:
            self.logger.error(f"Failed to query Notion database: {e}")
            return []
    
    def create_page(
        self,
        properties: Dict[str, Any],
        content: Optional[List[Dict[str, Any]]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Create a new page in Notion database
        
        Args:
            properties: Page properties
            content: Page content blocks (optional)
            
        Returns:
            Created page object or None on failure
        """
        try:
            page_data = {
                "parent": {"database_id": self.database_id},
                "properties": properties
            }
            
            if content:
                page_data["children"] = content
            
            page = self.client.pages.create(**page_data)
            self.logger.info(f"Created page in Notion: {page.get('id')}")
            return page
            
        except APIResponseError as e:
            self.logger.error(f"Failed to create Notion page: {e}")
            return None
    
    def update_page(
        self,
        page_id: str,
        properties: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Update an existing page in Notion
        
        Args:
            page_id: Page ID to update
            properties: Updated properties
            
        Returns:
            Updated page object or None on failure
        """
        try:
            page = self.client.pages.update(
                page_id=page_id,
                properties=properties
            )
            self.logger.info(f"Updated Notion page: {page_id}")
            return page
            
        except APIResponseError as e:
            self.logger.error(f"Failed to update Notion page: {e}")
            return None
    
    def search_pages(
        self,
        query: str,
        filter_type: str = "page"
    ) -> List[Dict[str, Any]]:
        """
        Search for pages in Notion
        
        Args:
            query: Search query
            filter_type: Type of objects to search (page or database)
            
        Returns:
            List of matching pages
        """
        try:
            response = self.client.search(
                query=query,
                filter={"property": "object", "value": filter_type}
            )
            
            results = response.get('results', [])
            self.logger.info(f"Found {len(results)} pages matching: {query}")
            return results
            
        except APIResponseError as e:
            self.logger.error(f"Failed to search Notion: {e}")
            return []
    
    def add_meeting_note(
        self,
        title: str,
        date: datetime,
        attendees: List[str],
        notes: str,
        action_items: Optional[List[str]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Add a meeting note to Notion CRM
        
        Args:
            title: Meeting title
            date: Meeting date
            attendees: List of attendees
            notes: Meeting notes
            action_items: List of action items (optional)
            
        Returns:
            Created page object or None on failure
        """
        try:
            properties = {
                "Name": {
                    "title": [{"text": {"content": title}}]
                },
                "Date": {
                    "date": {"start": date.isoformat()}
                },
                "Attendees": {
                    "multi_select": [{"name": attendee} for attendee in attendees]
                },
                "Type": {
                    "select": {"name": "Meeting"}
                }
            }
            
            # Build content blocks
            content = [
                {
                    "object": "block",
                    "type": "heading_2",
                    "heading_2": {
                        "rich_text": [{"text": {"content": "Notes"}}]
                    }
                },
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"text": {"content": notes}}]
                    }
                }
            ]
            
            if action_items:
                content.append({
                    "object": "block",
                    "type": "heading_2",
                    "heading_2": {
                        "rich_text": [{"text": {"content": "Action Items"}}]
                    }
                })
                
                for item in action_items:
                    content.append({
                        "object": "block",
                        "type": "to_do",
                        "to_do": {
                            "rich_text": [{"text": {"content": item}}],
                            "checked": False
                        }
                    })
            
            return self.create_page(properties, content)
            
        except Exception as e:
            self.logger.error(f"Failed to add meeting note: {e}")
            return None
    
    def is_connected(self) -> bool:
        """
        Check if connected to Notion
        
        Returns:
            True if connected, False otherwise
        """
        try:
            # Try to retrieve the database to verify connection
            self.client.databases.retrieve(database_id=self.database_id)
            return True
        except APIResponseError:
            return False
