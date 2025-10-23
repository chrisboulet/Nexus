# Quick Start Guide

Get up and running with Nexus in 5 minutes!

## Prerequisites
- Python 3.9+ installed
- pip installed
- Git installed

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/chrisboulet/Nexus.git
cd Nexus

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run setup
python setup.py
```

## Configuration

1. **Edit config.json** with your API credentials:
   - Limitless API key
   - Google Calendar credentials file path
   - Notion API token and database ID

2. **For detailed setup instructions**, see [GUIDE.md](GUIDE.md)

## First Run

```bash
# Get help
python main.py --help

# Run a single sync to test
python main.py --sync-once

# View upcoming context
python main.py --context

# Start continuous sync
python main.py
```

## What's Next?

- Read the full [User Guide](GUIDE.md) for detailed configuration
- Check out the [README](README.md) for project overview
- Review logs in `logs/nexus.log` if you encounter issues

## Quick Reference

### Common Commands

```bash
# Continuous sync (default: every 15 min)
python main.py

# Custom interval (every 30 min)
python main.py --interval 30

# One-time sync
python main.py --sync-once

# View context
python main.py --context --days 7
```

### Configuration Files

- `config.json` - Your credentials (keep private!)
- `config.example.json` - Template
- `credentials.json` - Google OAuth credentials
- `token.json` - Google OAuth token (auto-generated)

## Need Help?

1. Check `logs/nexus.log` for errors
2. Read [GUIDE.md](GUIDE.md) for detailed troubleshooting
3. Verify all API credentials are correct
4. Open an issue on GitHub

## Status

🚧 **En développement** - Active development in progress

---

For more information, see the complete [User Guide](GUIDE.md).
