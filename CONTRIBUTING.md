# Contributing to Nexus

This guide is for developers who want to contribute to or extend Nexus.

## Development Setup

### Prerequisites
- Python 3.9 or higher
- Git
- Virtualenv (recommended)

### Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/chrisboulet/Nexus.git
cd Nexus

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install development dependencies
pip install pytest pytest-cov pytest-asyncio black flake8 mypy

# Run tests
python -m unittest discover -s tests
```

## Project Structure

```
Nexus/
├── main.py                        # Entry point
├── setup.py                       # Setup script
├── requirements.txt               # Dependencies
├── src/
│   ├── __init__.py
│   ├── coordinators/
│   │   ├── __init__.py
│   │   └── nexus_coordinator.py  # Main coordination logic
│   ├── integrations/              # API clients
│   │   ├── __init__.py
│   │   ├── limitless_client.py   # Limitless API client
│   │   ├── google_calendar_client.py  # Google Calendar client
│   │   └── notion_client.py      # Notion API client
│   └── utils/                     # Utilities
│       ├── __init__.py
│       ├── config.py              # Configuration management
│       └── logger.py              # Logging utilities
└── tests/
    ├── __init__.py
    └── test_integrations.py       # Integration tests
```

## Architecture

### Core Components

1. **Coordinators** (`src/coordinators/`)
   - Main orchestration logic
   - Manages sync cycles
   - Coordinates between integrations

2. **Integrations** (`src/integrations/`)
   - API clients for external services
   - Each client is self-contained
   - Handles authentication and error handling

3. **Utils** (`src/utils/`)
   - Configuration management
   - Logging setup
   - Shared utilities

### Data Flow

```
main.py
  └── NexusCoordinator
      ├── LimitlessClient → fetch data → transform
      ├── GoogleCalendarClient → fetch data → transform
      └── NotionCRMClient → create/update entries
```

## Adding a New Integration

### Step 1: Create the Client

Create a new file in `src/integrations/`:

```python
# src/integrations/new_service_client.py

import logging
from typing import Dict, List, Any


class NewServiceClient:
    """Client for interacting with New Service API"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.logger = logging.getLogger("nexus.new_service")
    
    def fetch_data(self) -> List[Dict[str, Any]]:
        """Fetch data from New Service"""
        # Implementation
        pass
    
    def is_connected(self) -> bool:
        """Check if connected to New Service"""
        return bool(self.api_key)
```

### Step 2: Update Integration Package

Add to `src/integrations/__init__.py`:

```python
from .new_service_client import NewServiceClient

__all__ = [..., 'NewServiceClient']
```

### Step 3: Add Configuration

Update `config.example.json`:

```json
{
  "new_service": {
    "api_key": "your-api-key-here"
  }
}
```

Add getter in `src/utils/config.py`:

```python
def get_new_service_config(self) -> Dict[str, Any]:
    """Get New Service configuration"""
    return self.config.get('new_service', {})
```

### Step 4: Integrate into Coordinator

Update `src/coordinators/nexus_coordinator.py`:

```python
def _initialize_clients(self):
    # ... existing code ...
    
    # New Service
    new_service_config = self.config.get_new_service_config()
    if new_service_config.get('api_key'):
        self.new_service = NewServiceClient(
            api_key=new_service_config['api_key']
        )
        self.logger.info("New Service client initialized")
```

### Step 5: Add Sync Method

Add sync logic in `NexusCoordinator`:

```python
async def sync_new_service_to_notion(self) -> int:
    """Sync New Service data to Notion"""
    if not self.new_service or not self.notion:
        return 0
    
    data = self.new_service.fetch_data()
    
    # Transform and sync to Notion
    # ...
    
    return synced_count
```

### Step 6: Add Tests

Create tests in `tests/test_integrations.py`:

```python
class TestNewServiceClient(unittest.TestCase):
    def setUp(self):
        self.client = NewServiceClient(api_key="test_key")
    
    def test_initialization(self):
        self.assertEqual(self.client.api_key, "test_key")
```

## Coding Standards

### Style Guide

- Follow PEP 8
- Use type hints
- Write docstrings for all public methods
- Keep functions focused and small

### Example Code Style

```python
def fetch_events(
    self,
    days_past: int = 7,
    days_future: int = 30
) -> List[Dict[str, Any]]:
    """
    Fetch calendar events
    
    Args:
        days_past: Number of days in the past to fetch
        days_future: Number of days in the future to fetch
        
    Returns:
        List of event objects
    """
    try:
        # Implementation
        events = self._api_call()
        self.logger.info(f"Fetched {len(events)} events")
        return events
    except Exception as e:
        self.logger.error(f"Failed to fetch events: {e}")
        return []
```

### Logging

Use the logger consistently:

```python
self.logger.debug("Detailed debug information")
self.logger.info("Normal operation information")
self.logger.warning("Warning messages")
self.logger.error("Error messages")
```

### Error Handling

Always handle exceptions gracefully:

```python
try:
    result = risky_operation()
except SpecificException as e:
    self.logger.error(f"Specific error: {e}")
    return default_value
except Exception as e:
    self.logger.error(f"Unexpected error: {e}")
    raise
```

## Testing

### Running Tests

```bash
# Run all tests
python -m unittest discover -s tests

# Run with coverage
pytest --cov=src tests/

# Run specific test
python -m unittest tests.test_integrations.TestLimitlessClient
```

### Writing Tests

```python
import unittest
from unittest.mock import Mock, patch


class TestMyFeature(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures"""
        self.client = MyClient()
    
    def test_feature(self):
        """Test a specific feature"""
        result = self.client.do_something()
        self.assertEqual(result, expected_value)
    
    @patch('module.external_call')
    def test_with_mock(self, mock_call):
        """Test with mocked dependencies"""
        mock_call.return_value = "mocked"
        result = self.client.method_using_external_call()
        self.assertEqual(result, "mocked")
```

## Debugging

### Enable Debug Logging

Edit `config.json`:

```json
"logging": {
  "level": "DEBUG",
  "file": "nexus.log",
  "console": true
}
```

### Using Python Debugger

```python
import pdb

def problematic_function():
    # ... code ...
    pdb.set_trace()  # Debugger will stop here
    # ... more code ...
```

### Async Debugging

```python
import asyncio

async def debug_async():
    result = await some_async_function()
    print(f"Debug: {result}")
```

## Performance Considerations

### API Rate Limits

- Respect API rate limits
- Implement exponential backoff
- Cache responses when appropriate

### Async Operations

Use async/await for I/O operations:

```python
async def fetch_multiple_sources(self):
    """Fetch from multiple sources concurrently"""
    results = await asyncio.gather(
        self.fetch_limitless(),
        self.fetch_calendar(),
        self.fetch_notion()
    )
    return results
```

## Documentation

### Code Documentation

- All public classes and methods must have docstrings
- Use Google-style docstrings
- Include type hints

### User Documentation

- Update README.md for major changes
- Update GUIDE.md for configuration changes
- Keep QUICKSTART.md concise

## Git Workflow

### Branching

```bash
# Create feature branch
git checkout -b feature/new-integration

# Make changes
git add .
git commit -m "Add new integration"

# Push to remote
git push origin feature/new-integration
```

### Commit Messages

Use clear, descriptive commit messages:

```
Add Trello integration

- Create TrelloClient class
- Add configuration support
- Implement sync to Notion
- Add tests
```

## Release Process

1. Update version in `src/__init__.py`
2. Update CHANGELOG.md
3. Run all tests
4. Tag release: `git tag v0.2.0`
5. Push tag: `git push --tags`

## Getting Help

- Check existing issues on GitHub
- Review code comments and docstrings
- Ask questions in discussions

## License

Private - All rights reserved by Boulet Stratégies TI
