"""
Limitless integration client
"""

import httpx
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta


class LimitlessClient:
    """Client for interacting with Limitless API"""
    
    def __init__(self, api_key: str, endpoint: str = "https://api.limitless.ai/v1"):
        """
        Initialize Limitless client
        
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
    
    async def get_recent_memories(
        self,
        days: int = 7,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get recent memories from Limitless
        
        Args:
            days: Number of days to look back
            limit: Maximum number of memories to retrieve
            
        Returns:
            List of memory objects
        """
        try:
            since = datetime.now() - timedelta(days=days)
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.endpoint}/memories",
                    headers=self.headers,
                    params={
                        "since": since.isoformat(),
                        "limit": limit
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                
                data = response.json()
                self.logger.info(f"Retrieved {len(data.get('memories', []))} memories from Limitless")
                return data.get('memories', [])
                
        except httpx.HTTPError as e:
            self.logger.error(f"Failed to fetch memories from Limitless: {e}")
            return []
    
    async def get_meeting_notes(
        self,
        meeting_id: Optional[str] = None,
        days: int = 7
    ) -> List[Dict[str, Any]]:
        """
        Get meeting notes from Limitless
        
        Args:
            meeting_id: Specific meeting ID (optional)
            days: Number of days to look back
            
        Returns:
            List of meeting note objects
        """
        try:
            params = {"days": days}
            
            endpoint = f"{self.endpoint}/meetings"
            if meeting_id:
                endpoint = f"{endpoint}/{meeting_id}/notes"
            else:
                endpoint = f"{endpoint}/notes"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    endpoint,
                    headers=self.headers,
                    params=params,
                    timeout=30.0
                )
                response.raise_for_status()
                
                data = response.json()
                notes = data.get('notes', [])
                self.logger.info(f"Retrieved {len(notes)} meeting notes from Limitless")
                return notes
                
        except httpx.HTTPError as e:
            self.logger.error(f"Failed to fetch meeting notes from Limitless: {e}")
            return []
    
    async def search_context(
        self,
        query: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search for context in Limitless
        
        Args:
            query: Search query
            limit: Maximum number of results
            
        Returns:
            List of search results
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.endpoint}/search",
                    headers=self.headers,
                    json={
                        "query": query,
                        "limit": limit
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                
                data = response.json()
                results = data.get('results', [])
                self.logger.info(f"Found {len(results)} results for query: {query}")
                return results
                
        except httpx.HTTPError as e:
            self.logger.error(f"Failed to search Limitless: {e}")
            return []
    
    def is_connected(self) -> bool:
        """
        Check if connected to Limitless
        
        Returns:
            True if connected, False otherwise
        """
        return bool(self.api_key)
