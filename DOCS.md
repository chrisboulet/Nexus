# Nexus Documentation Index

Welcome to the Nexus documentation! This index will help you find the information you need.

## Quick Navigation

### 🚀 Getting Started
- **[README.md](README.md)** - Project overview, features, and status
- **[QUICKSTART.md](QUICKSTART.md)** - Get up and running in 5 minutes

### 📚 User Guides
- **[GUIDE.md](GUIDE.md)** - Complete user guide
  - Installation instructions
  - Configuration setup for all services
  - Usage examples and CLI reference
  - Troubleshooting guide
  - Best practices

- **[NOTION_SETUP.md](NOTION_SETUP.md)** - Notion database setup
  - Creating the database
  - Required properties and schema
  - Getting database ID
  - Sharing with integration
  - Sample templates

### 👨‍💻 Developer Resources
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Developer guide
  - Development setup
  - Project architecture
  - Adding new integrations
  - Coding standards
  - Testing guidelines

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
  - High-level overview diagrams
  - Data flow diagrams
  - Component interactions
  - Security architecture
  - Technology stack

### 📋 Reference
- **[SUMMARY.md](SUMMARY.md)** - Implementation summary
  - Complete feature list
  - Code statistics
  - Architecture overview
  - Usage examples

- **[CHANGELOG.md](CHANGELOG.md)** - Version history
  - Release notes
  - Feature additions
  - Bug fixes
  - Breaking changes

- **[LICENSE](LICENSE)** - MIT License

## Documentation Structure

```
Documentation/
├── Getting Started
│   ├── README.md          (Project overview)
│   └── QUICKSTART.md      (5-minute setup)
│
├── User Documentation
│   ├── GUIDE.md           (Complete guide)
│   └── NOTION_SETUP.md    (Database setup)
│
├── Developer Documentation
│   ├── CONTRIBUTING.md    (Dev guide)
│   └── ARCHITECTURE.md    (System design)
│
└── Reference
    ├── SUMMARY.md         (Implementation details)
    ├── CHANGELOG.md       (Version history)
    └── LICENSE            (MIT License)
```

## Common Tasks

### I want to...

#### ...get started quickly
→ Read [QUICKSTART.md](QUICKSTART.md)

#### ...understand what Nexus does
→ Read [README.md](README.md)

#### ...install and configure Nexus
→ Read [GUIDE.md](GUIDE.md) sections 1-2

#### ...set up my Notion database
→ Read [NOTION_SETUP.md](NOTION_SETUP.md)

#### ...use Nexus
→ Read [GUIDE.md](GUIDE.md) section 3 (Usage)

#### ...troubleshoot issues
→ Read [GUIDE.md](GUIDE.md) section 5 (Troubleshooting)

#### ...contribute to the project
→ Read [CONTRIBUTING.md](CONTRIBUTING.md)

#### ...understand the architecture
→ Read [ARCHITECTURE.md](ARCHITECTURE.md)

#### ...see what's been implemented
→ Read [SUMMARY.md](SUMMARY.md)

#### ...check version history
→ Read [CHANGELOG.md](CHANGELOG.md)

## Key Concepts

### Services
- **Limitless**: AI-powered memory and context management
- **Google Calendar**: Schedule and time management
- **Notion CRM**: Customer relationship and project tracking

### Operation Modes
- **Continuous Sync**: Runs indefinitely, syncing at intervals
- **Single Sync**: Runs once and exits
- **Context View**: Shows upcoming events/tasks

### Synchronization
- Calendar events → Notion pages
- Meeting notes → Notion pages with action items
- Configurable time ranges and intervals

### Configuration
- JSON-based configuration file
- Service-specific credentials
- Sync parameters
- Logging settings

## Support

### Getting Help
1. Check the relevant documentation above
2. Review logs in `nexus.log`
3. Verify configuration in `config.json`
4. Open an issue on GitHub

### Reporting Issues
When reporting issues, include:
- Error messages from logs
- Steps to reproduce
- Configuration (without credentials!)
- Python version

## Version Information

**Current Version**: 0.1.0  
**Status**: 🚧 En développement  
**Last Updated**: October 2024

## Quick Links

- [GitHub Repository](https://github.com/chrisboulet/Nexus)
- [Limitless API](https://limitless.ai)
- [Google Calendar API](https://developers.google.com/calendar)
- [Notion API](https://developers.notion.com)

---

**Need help?** Start with the [Quick Start Guide](QUICKSTART.md) or [User Guide](GUIDE.md).

**Want to contribute?** Read the [Contributing Guide](CONTRIBUTING.md).

**Looking for technical details?** Check the [Architecture](ARCHITECTURE.md) and [Implementation Summary](SUMMARY.md).
