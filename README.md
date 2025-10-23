# Nexus
Strategic Coordination & Unified Tracking

Assistant personnel pour Boulet Stratégies TI - Connecte Limitless, Google Calendar et Notion CRM.

## Overview

Nexus is an intelligent coordination assistant that seamlessly integrates:
- **Limitless**: AI-powered memory and context management
- **Google Calendar**: Schedule and time management
- **Notion CRM**: Customer relationship and project tracking

## Features

- 🔄 Unified data synchronization across platforms
- 📅 Automatic calendar event tracking
- 📝 Meeting notes and context capture from Limitless
- 🗂️ CRM updates and project management in Notion
- 🤖 AI-powered coordination and task management

## Stack

- **Language**: Python 3.9+
- **Integration**: MCP (Model Context Protocol) Connectors
- **Platforms**: 
  - Limitless MCP Server
  - Google Calendar API
  - Notion API

## Prerequisites

- Python 3.9 or higher
- Active accounts for:
  - Limitless (with API access)
  - Google Calendar (with API credentials)
  - Notion (with integration token)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/chrisboulet/Nexus.git
cd Nexus
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure your credentials:
```bash
cp config.example.json config.json
# Edit config.json with your API credentials
```

4. Run the setup script:
```bash
python setup.py
```

## Configuration

Create a `config.json` file with your credentials:

```json
{
  "limitless": {
    "api_key": "your-limitless-api-key"
  },
  "google_calendar": {
    "credentials_file": "path/to/credentials.json",
    "token_file": "token.json"
  },
  "notion": {
    "api_token": "your-notion-integration-token",
    "database_id": "your-database-id"
  }
}
```

## Usage

Start the Nexus assistant:

```bash
python main.py
```

The assistant will:
1. Connect to all configured services
2. Monitor for new events and updates
3. Synchronize data across platforms
4. Provide unified tracking and coordination

## Project Structure

```
Nexus/
├── README.md
├── requirements.txt
├── config.example.json
├── .gitignore
├── main.py                 # Main coordination script
├── setup.py               # Setup and initialization
├── src/
│   ├── __init__.py
│   ├── coordinators/
│   │   ├── __init__.py
│   │   └── nexus_coordinator.py
│   ├── integrations/
│   │   ├── __init__.py
│   │   ├── limitless_client.py
│   │   ├── google_calendar_client.py
│   │   └── notion_client.py
│   └── utils/
│       ├── __init__.py
│       ├── config.py
│       └── logger.py
└── tests/
    ├── __init__.py
    └── test_integrations.py
```

## Development Status

🚧 **En développement** - Active development in progress

## Contributing

This is a private project for Boulet Stratégies TI. For questions or contributions, please contact the team.

## License

Private - All rights reserved

## Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get started in 5 minutes
- **[User Guide](GUIDE.md)** - Complete documentation and troubleshooting
- **[Notion Setup](NOTION_SETUP.md)** - Setting up your Notion database
- **[Contributing](CONTRIBUTING.md)** - Developer guide for contributors

## Support

For issues or questions, please open an issue in the repository or contact the development team.

## Roadmap

### Planned Features
- [ ] Bidirectional sync between platforms
- [ ] Advanced filtering and rules engine
- [ ] Web dashboard for monitoring
- [ ] Mobile app integration
- [ ] AI-powered insights and suggestions
- [ ] Slack/Teams notifications
- [ ] Custom webhook support

### Future Integrations
- [ ] Microsoft Teams
- [ ] Slack
- [ ] Trello/Asana
- [ ] Zoom
- [ ] Email (Gmail, Outlook)
