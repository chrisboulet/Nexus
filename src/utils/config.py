"""
Configuration management for Nexus
"""

import json
import os
from pathlib import Path
from typing import Dict, Any


class Config:
    """Configuration loader and manager"""
    
    def __init__(self, config_path: str = "config.json"):
        """
        Initialize configuration
        
        Args:
            config_path: Path to configuration file
        """
        self.config_path = config_path
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """
        Load configuration from file
        
        Returns:
            Configuration dictionary
        """
        if not os.path.exists(self.config_path):
            raise FileNotFoundError(
                f"Configuration file not found: {self.config_path}\n"
                f"Please copy config.example.json to config.json and update with your credentials."
            )
        
        with open(self.config_path, 'r') as f:
            return json.load(f)
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Get configuration value
        
        Args:
            key: Configuration key (supports dot notation, e.g., 'google_calendar.calendar_id')
            default: Default value if key not found
            
        Returns:
            Configuration value
        """
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def get_limitless_config(self) -> Dict[str, Any]:
        """Get Limitless configuration"""
        return self.config.get('limitless', {})
    
    def get_google_calendar_config(self) -> Dict[str, Any]:
        """Get Google Calendar configuration"""
        return self.config.get('google_calendar', {})
    
    def get_notion_config(self) -> Dict[str, Any]:
        """Get Notion configuration"""
        return self.config.get('notion', {})
    
    def get_sync_config(self) -> Dict[str, Any]:
        """Get sync configuration"""
        return self.config.get('sync', {})
    
    def get_logging_config(self) -> Dict[str, Any]:
        """Get logging configuration"""
        return self.config.get('logging', {})
