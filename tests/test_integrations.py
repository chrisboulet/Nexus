"""
Integration tests for Nexus clients
"""

import unittest
from unittest.mock import Mock, patch, AsyncMock
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.integrations import LimitlessClient, GoogleCalendarClient, NotionCRMClient
from src.utils import Config


class TestLimitlessClient(unittest.TestCase):
    """Test Limitless client"""
    
    def setUp(self):
        self.client = LimitlessClient(
            api_key="test_key",
            endpoint="https://api.test.com"
        )
    
    def test_initialization(self):
        """Test client initialization"""
        self.assertEqual(self.client.api_key, "test_key")
        self.assertEqual(self.client.endpoint, "https://api.test.com")
        self.assertTrue(self.client.is_connected())
    
    def test_is_connected(self):
        """Test connection check"""
        self.assertTrue(self.client.is_connected())
        
        empty_client = LimitlessClient(api_key="")
        self.assertFalse(empty_client.is_connected())


class TestGoogleCalendarClient(unittest.TestCase):
    """Test Google Calendar client"""
    
    def setUp(self):
        self.client = GoogleCalendarClient(
            credentials_file="test_creds.json",
            token_file="test_token.json",
            calendar_id="primary"
        )
    
    def test_initialization(self):
        """Test client initialization"""
        self.assertEqual(self.client.credentials_file, "test_creds.json")
        self.assertEqual(self.client.token_file, "test_token.json")
        self.assertEqual(self.client.calendar_id, "primary")
    
    def test_is_connected(self):
        """Test connection check"""
        self.assertFalse(self.client.is_connected())
        
        # Mock service
        self.client.service = Mock()
        self.assertTrue(self.client.is_connected())


class TestNotionCRMClient(unittest.TestCase):
    """Test Notion CRM client"""
    
    def setUp(self):
        self.client = NotionCRMClient(
            api_token="test_token",
            database_id="test_db_id"
        )
    
    def test_initialization(self):
        """Test client initialization"""
        self.assertEqual(self.client.api_token, "test_token")
        self.assertEqual(self.client.database_id, "test_db_id")
        self.assertIsNotNone(self.client.client)


class TestConfig(unittest.TestCase):
    """Test configuration management"""
    
    def test_config_file_not_found(self):
        """Test handling of missing config file"""
        with self.assertRaises(FileNotFoundError):
            Config("nonexistent.json")
    
    @patch('builtins.open', unittest.mock.mock_open(read_data='{"test": "value"}'))
    @patch('os.path.exists', return_value=True)
    def test_config_loading(self, mock_exists):
        """Test configuration loading"""
        config = Config("test.json")
        self.assertIsNotNone(config.config)
    
    @patch('builtins.open', unittest.mock.mock_open(
        read_data='{"nested": {"key": "value"}, "simple": "test"}'
    ))
    @patch('os.path.exists', return_value=True)
    def test_config_get(self, mock_exists):
        """Test configuration retrieval"""
        config = Config("test.json")
        
        # Test simple key
        self.assertEqual(config.get('simple'), 'test')
        
        # Test nested key
        self.assertEqual(config.get('nested.key'), 'value')
        
        # Test default value
        self.assertEqual(config.get('missing', 'default'), 'default')


if __name__ == '__main__':
    unittest.main()
