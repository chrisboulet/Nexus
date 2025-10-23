"""
Google Calendar integration client
"""

import logging
import pickle
import os.path
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


# Scopes required for calendar access
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']


class GoogleCalendarClient:
    """Client for interacting with Google Calendar API"""
    
    def __init__(
        self,
        credentials_file: str,
        token_file: str = "token.json",
        calendar_id: str = "primary"
    ):
        """
        Initialize Google Calendar client
        
        Args:
            credentials_file: Path to OAuth2 credentials file
            token_file: Path to store/load OAuth2 token
            calendar_id: Calendar ID to use (default: primary)
        """
        self.credentials_file = credentials_file
        self.token_file = token_file
        self.calendar_id = calendar_id
        self.logger = logging.getLogger("nexus.google_calendar")
        
        self.creds = None
        self.service = None
    
    def authenticate(self) -> bool:
        """
        Authenticate with Google Calendar
        
        Returns:
            True if authentication successful, False otherwise
        """
        try:
            # Load token if it exists
            if os.path.exists(self.token_file):
                self.creds = Credentials.from_authorized_user_file(self.token_file, SCOPES)
            
            # Refresh or get new credentials
            if not self.creds or not self.creds.valid:
                if self.creds and self.creds.expired and self.creds.refresh_token:
                    self.creds.refresh(Request())
                else:
                    if not os.path.exists(self.credentials_file):
                        self.logger.error(f"Credentials file not found: {self.credentials_file}")
                        return False
                    
                    flow = InstalledAppFlow.from_client_secrets_file(
                        self.credentials_file, SCOPES
                    )
                    self.creds = flow.run_local_server(port=0)
                
                # Save credentials for next run
                with open(self.token_file, 'w') as token:
                    token.write(self.creds.to_json())
            
            # Build service
            self.service = build('calendar', 'v3', credentials=self.creds)
            self.logger.info("Successfully authenticated with Google Calendar")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to authenticate with Google Calendar: {e}")
            return False
    
    def get_events(
        self,
        days_past: int = 7,
        days_future: int = 30,
        max_results: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get calendar events
        
        Args:
            days_past: Number of days in the past to fetch
            days_future: Number of days in the future to fetch
            max_results: Maximum number of events to return
            
        Returns:
            List of event objects
        """
        if not self.service:
            self.logger.error("Not authenticated. Call authenticate() first.")
            return []
        
        try:
            # Calculate time range
            time_min = (datetime.utcnow() - timedelta(days=days_past)).isoformat() + 'Z'
            time_max = (datetime.utcnow() + timedelta(days=days_future)).isoformat() + 'Z'
            
            # Fetch events
            events_result = self.service.events().list(
                calendarId=self.calendar_id,
                timeMin=time_min,
                timeMax=time_max,
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            self.logger.info(f"Retrieved {len(events)} events from Google Calendar")
            return events
            
        except HttpError as e:
            self.logger.error(f"Failed to fetch events from Google Calendar: {e}")
            return []
    
    def get_upcoming_events(
        self,
        days: int = 7,
        max_results: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get upcoming calendar events
        
        Args:
            days: Number of days to look ahead
            max_results: Maximum number of events to return
            
        Returns:
            List of event objects
        """
        if not self.service:
            self.logger.error("Not authenticated. Call authenticate() first.")
            return []
        
        try:
            now = datetime.utcnow().isoformat() + 'Z'
            time_max = (datetime.utcnow() + timedelta(days=days)).isoformat() + 'Z'
            
            events_result = self.service.events().list(
                calendarId=self.calendar_id,
                timeMin=now,
                timeMax=time_max,
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            self.logger.info(f"Retrieved {len(events)} upcoming events")
            return events
            
        except HttpError as e:
            self.logger.error(f"Failed to fetch upcoming events: {e}")
            return []
    
    def is_connected(self) -> bool:
        """
        Check if connected to Google Calendar
        
        Returns:
            True if connected, False otherwise
        """
        return self.service is not None
