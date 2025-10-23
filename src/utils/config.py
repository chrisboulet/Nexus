"""
Configuration management for NEXUS
Handles loading and accessing YAML configuration
"""

import yaml
import os
from pathlib import Path
from typing import Dict, Any, Optional


class Config:
    """Configuration manager for NEXUS"""

    def __init__(self, config_path: str = "config/config.yaml"):
        """
        Initialize configuration

        Args:
            config_path: Path to YAML config file
        """
        self.config_path = Path(config_path)
        self._config: Dict[str, Any] = {}
        self._load()

    def _load(self):
        """Load configuration from YAML file"""
        if not self.config_path.exists():
            raise FileNotFoundError(
                f"Configuration file not found: {self.config_path}\n"
                f"Please copy config/config.example.yaml to config/config.yaml "
                f"and fill in your API keys."
            )

        with open(self.config_path, 'r') as f:
            self._config = yaml.safe_load(f) or {}

    def get(self, key: str, default: Any = None) -> Any:
        """
        Get configuration value with dot notation support

        Args:
            key: Configuration key (supports dot notation: "limitless.api_key")
            default: Default value if key not found

        Returns:
            Configuration value
        """
        keys = key.split('.')
        value = self._config

        for k in keys:
            if isinstance(value, dict):
                value = value.get(k)
                if value is None:
                    return default
            else:
                return default

        return value

    def get_limitless_config(self) -> Dict[str, Any]:
        """Get Limitless API configuration"""
        return self._config.get('limitless', {})

    def get_notion_config(self) -> Dict[str, Any]:
        """Get Notion API configuration"""
        return self._config.get('notion', {})

    def get_anthropic_config(self) -> Dict[str, Any]:
        """Get Anthropic API configuration"""
        return self._config.get('anthropic', {})

    def get_priority_detector_config(self) -> Dict[str, Any]:
        """Get Priority Detector configuration"""
        return self._config.get('priority_detector', {})

    def get_logging_config(self) -> Dict[str, Any]:
        """Get logging configuration"""
        return self._config.get('logging', {})
