"""
Nexus Coordinator - Main coordination logic
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

from ..integrations import LimitlessClient, GoogleCalendarClient, NotionCRMClient
from ..utils import Config


class NexusCoordinator:
    """Main coordinator for Nexus assistant"""
    
    def __init__(self, config: Config):
        """
        Initialize Nexus coordinator
        
        Args:
            config: Configuration object
        """
        self.config = config
        self.logger = logging.getLogger("nexus.coordinator")
        
        # Initialize clients
        self.limitless = None
        self.google_calendar = None
        self.notion = None
        
        self._initialize_clients()
    
    def _initialize_clients(self):
        """Initialize all integration clients"""
        # Limitless
        limitless_config = self.config.get_limitless_config()
        if limitless_config.get('api_key'):
            self.limitless = LimitlessClient(
                api_key=limitless_config['api_key'],
                endpoint=limitless_config.get('endpoint', 'https://api.limitless.ai/v1')
            )
            self.logger.info("Limitless client initialized")
        
        # Google Calendar
        gcal_config = self.config.get_google_calendar_config()
        if gcal_config.get('credentials_file'):
            self.google_calendar = GoogleCalendarClient(
                credentials_file=gcal_config['credentials_file'],
                token_file=gcal_config.get('token_file', 'token.json'),
                calendar_id=gcal_config.get('calendar_id', 'primary')
            )
            self.logger.info("Google Calendar client initialized")
        
        # Notion
        notion_config = self.config.get_notion_config()
        if notion_config.get('api_token') and notion_config.get('database_id'):
            self.notion = NotionCRMClient(
                api_token=notion_config['api_token'],
                database_id=notion_config['database_id'],
                page_size=notion_config.get('page_size', 100)
            )
            self.logger.info("Notion client initialized")
    
    async def connect_all(self) -> Dict[str, bool]:
        """
        Connect to all services
        
        Returns:
            Dictionary of service connection statuses
        """
        statuses = {}
        
        # Google Calendar (requires authentication)
        if self.google_calendar:
            statuses['google_calendar'] = self.google_calendar.authenticate()
        else:
            statuses['google_calendar'] = False
        
        # Limitless (check connection)
        if self.limitless:
            statuses['limitless'] = self.limitless.is_connected()
        else:
            statuses['limitless'] = False
        
        # Notion (check connection)
        if self.notion:
            statuses['notion'] = self.notion.is_connected()
        else:
            statuses['notion'] = False
        
        # Log connection status
        for service, connected in statuses.items():
            status = "connected" if connected else "not connected"
            self.logger.info(f"{service}: {status}")
        
        return statuses
    
    async def sync_calendar_to_notion(self) -> int:
        """
        Sync calendar events to Notion
        
        Returns:
            Number of events synced
        """
        if not self.google_calendar or not self.notion:
            self.logger.warning("Calendar or Notion not available for sync")
            return 0
        
        try:
            sync_config = self.config.get_sync_config()
            days_past = sync_config.get('sync_past_days', 7)
            days_future = sync_config.get('sync_future_days', 30)
            
            # Get calendar events
            events = self.google_calendar.get_events(
                days_past=days_past,
                days_future=days_future
            )
            
            synced = 0
            for event in events:
                # Extract event details
                title = event.get('summary', 'Untitled Event')
                start = event.get('start', {})
                start_time = start.get('dateTime', start.get('date'))
                
                if start_time:
                    event_date = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                    
                    # Create properties for Notion
                    properties = {
                        "Name": {
                            "title": [{"text": {"content": title}}]
                        },
                        "Date": {
                            "date": {"start": event_date.isoformat()}
                        },
                        "Type": {
                            "select": {"name": "Calendar Event"}
                        }
                    }
                    
                    # Add description if available
                    description = event.get('description', '')
                    if description:
                        properties["Notes"] = {
                            "rich_text": [{"text": {"content": description[:2000]}}]
                        }
                    
                    # Create page in Notion
                    result = self.notion.create_page(properties)
                    if result:
                        synced += 1
            
            self.logger.info(f"Synced {synced} calendar events to Notion")
            return synced
            
        except Exception as e:
            self.logger.error(f"Failed to sync calendar to Notion: {e}")
            return 0
    
    async def sync_limitless_to_notion(self) -> int:
        """
        Sync Limitless meeting notes to Notion
        
        Returns:
            Number of notes synced
        """
        if not self.limitless or not self.notion:
            self.logger.warning("Limitless or Notion not available for sync")
            return 0
        
        try:
            sync_config = self.config.get_sync_config()
            days = sync_config.get('sync_past_days', 7)
            
            # Get meeting notes from Limitless
            notes = await self.limitless.get_meeting_notes(days=days)
            
            synced = 0
            for note in notes:
                title = note.get('title', 'Meeting Note')
                date_str = note.get('date', datetime.now().isoformat())
                date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                attendees = note.get('attendees', [])
                content = note.get('content', '')
                action_items = note.get('action_items', [])
                
                # Add to Notion
                result = self.notion.add_meeting_note(
                    title=title,
                    date=date,
                    attendees=attendees,
                    notes=content,
                    action_items=action_items
                )
                
                if result:
                    synced += 1
            
            self.logger.info(f"Synced {synced} meeting notes from Limitless to Notion")
            return synced
            
        except Exception as e:
            self.logger.error(f"Failed to sync Limitless to Notion: {e}")
            return 0
    
    async def get_upcoming_context(self, days: int = 7) -> Dict[str, Any]:
        """
        Get upcoming context from all sources
        
        Args:
            days: Number of days to look ahead
            
        Returns:
            Dictionary with upcoming events and context
        """
        context = {
            'calendar_events': [],
            'notion_tasks': [],
            'relevant_memories': []
        }
        
        # Get calendar events
        if self.google_calendar:
            context['calendar_events'] = self.google_calendar.get_upcoming_events(days=days)
        
        # Get Notion tasks
        if self.notion:
            filter_params = {
                "property": "Type",
                "select": {
                    "equals": "Task"
                }
            }
            context['notion_tasks'] = self.notion.get_database_entries(filter_params)
        
        # Get recent memories from Limitless
        if self.limitless:
            context['relevant_memories'] = await self.limitless.get_recent_memories(days=days)
        
        return context
    
    async def run_sync_cycle(self) -> Dict[str, int]:
        """
        Run a complete sync cycle
        
        Returns:
            Dictionary with sync statistics
        """
        self.logger.info("Starting sync cycle...")
        
        stats = {
            'calendar_synced': 0,
            'limitless_synced': 0,
            'errors': 0
        }
        
        try:
            # Sync calendar to Notion
            stats['calendar_synced'] = await self.sync_calendar_to_notion()
            
            # Sync Limitless to Notion
            stats['limitless_synced'] = await self.sync_limitless_to_notion()
            
        except Exception as e:
            self.logger.error(f"Error during sync cycle: {e}")
            stats['errors'] += 1
        
        self.logger.info(f"Sync cycle complete: {stats}")
        return stats
    
    async def start_continuous_sync(self, interval_minutes: int = 15):
        """
        Start continuous synchronization
        
        Args:
            interval_minutes: Sync interval in minutes
        """
        self.logger.info(f"Starting continuous sync (interval: {interval_minutes} minutes)")
        
        while True:
            try:
                await self.run_sync_cycle()
                await asyncio.sleep(interval_minutes * 60)
            except KeyboardInterrupt:
                self.logger.info("Stopping continuous sync")
                break
            except Exception as e:
                self.logger.error(f"Error in continuous sync: {e}")
                await asyncio.sleep(60)  # Wait a minute before retrying
