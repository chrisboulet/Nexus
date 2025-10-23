# Nexus User Guide

## Table of Contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Usage](#usage)
4. [Features](#features)
5. [Troubleshooting](#troubleshooting)

## Installation

### Prerequisites
- Python 3.9 or higher
- pip (Python package manager)
- Git

### Step-by-Step Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/chrisboulet/Nexus.git
   cd Nexus
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the setup script**:
   ```bash
   python setup.py
   ```

4. **Configure your credentials** (see Configuration section below)

## Configuration

### Setting Up API Credentials

The configuration is managed through a `config.json` file in the root directory. A template file `config.example.json` is provided.

#### 1. Limitless Configuration

```json
"limitless": {
  "api_key": "your-limitless-api-key-here",
  "endpoint": "https://api.limitless.ai/v1"
}
```

To get your Limitless API key:
1. Log in to your Limitless account
2. Navigate to Settings > API
3. Generate a new API key
4. Copy and paste it into `config.json`

#### 2. Google Calendar Configuration

```json
"google_calendar": {
  "credentials_file": "credentials.json",
  "token_file": "token.json",
  "calendar_id": "primary"
}
```

To set up Google Calendar:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials (Desktop app)
5. Download the credentials file and save it as `credentials.json` in the Nexus directory
6. The first time you run Nexus, it will open a browser window for authorization
7. After authorization, a `token.json` file will be created automatically

#### 3. Notion Configuration

```json
"notion": {
  "api_token": "secret_your-notion-integration-token-here",
  "database_id": "your-notion-database-id-here",
  "page_size": 100
}
```

To set up Notion:
1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Give it a name (e.g., "Nexus")
4. Copy the "Internal Integration Token"
5. Paste it into `config.json` as the `api_token`
6. Create or select a database in Notion to use as your CRM
7. Share the database with your integration:
   - Open the database in Notion
   - Click "..." menu in the top right
   - Select "Add connections"
   - Find and select your integration
8. Copy the database ID from the URL:
   - The URL looks like: `https://www.notion.so/workspace/DATABASE_ID?v=...`
   - Copy the DATABASE_ID part (32 characters)
   - Paste it into `config.json` as the `database_id`

#### 4. Sync Configuration

```json
"sync": {
  "interval_minutes": 15,
  "auto_sync": true,
  "sync_past_days": 7,
  "sync_future_days": 30
}
```

- `interval_minutes`: How often to sync (in minutes)
- `auto_sync`: Enable automatic synchronization
- `sync_past_days`: How many days in the past to sync
- `sync_future_days`: How many days in the future to sync

## Usage

### Running Nexus

#### Continuous Sync Mode (Default)
Run Nexus continuously with automatic synchronization:

```bash
python main.py
```

This will:
- Connect to all configured services
- Start syncing data every 15 minutes (or your configured interval)
- Run until you stop it with Ctrl+C

#### Custom Sync Interval
Specify a custom sync interval:

```bash
python main.py --interval 30  # Sync every 30 minutes
```

#### Single Sync
Run a single sync cycle and exit:

```bash
python main.py --sync-once
```

#### Get Upcoming Context
Get a summary of upcoming events and tasks:

```bash
python main.py --context --days 7
```

This displays:
- Upcoming calendar events
- Active Notion tasks
- Relevant memories from Limitless

### Command Line Options

```
usage: main.py [-h] [--config CONFIG] [--sync-once] [--interval INTERVAL]
               [--context] [--days DAYS]

optional arguments:
  -h, --help           Show this help message and exit
  --config CONFIG      Path to configuration file (default: config.json)
  --sync-once          Run sync once and exit
  --interval INTERVAL  Sync interval in minutes (default: 15)
  --context            Get upcoming context and exit
  --days DAYS          Number of days for context lookup (default: 7)
```

## Features

### Data Synchronization

#### Calendar to Notion
Nexus automatically syncs your Google Calendar events to your Notion CRM:
- Creates new pages for each calendar event
- Includes event title, date, and description
- Tags events as "Calendar Event" type

#### Limitless to Notion
Nexus syncs meeting notes from Limitless to Notion:
- Creates structured meeting note pages
- Includes attendees, date, and meeting content
- Extracts and adds action items as to-do lists

### Context Awareness

Nexus provides unified context across all platforms:
- View upcoming calendar events
- See active tasks in Notion
- Access relevant memories from Limitless

### Logging

All operations are logged for debugging and monitoring:
- Console output for real-time monitoring
- Log files in the `logs/` directory
- Configurable log levels (DEBUG, INFO, WARNING, ERROR)

## Troubleshooting

### Common Issues

#### "Configuration file not found"
**Solution**: Run `python setup.py` to create a config.json file from the template.

#### "ModuleNotFoundError: No module named 'httpx'"
**Solution**: Install dependencies with `pip install -r requirements.txt`

#### "Failed to authenticate with Google Calendar"
**Solution**: 
1. Verify that `credentials.json` exists and is valid
2. Delete `token.json` if it exists and re-run to re-authenticate
3. Make sure the Google Calendar API is enabled in your Google Cloud project

#### "Failed to connect to Notion"
**Solution**:
1. Verify your Notion API token is correct
2. Ensure the database is shared with your integration
3. Check that the database ID is correct

#### "Failed to fetch from Limitless"
**Solution**:
1. Verify your Limitless API key is correct
2. Check your internet connection
3. Ensure the Limitless API endpoint is accessible

### Debug Mode

For detailed debugging, edit `config.json` and set the logging level to DEBUG:

```json
"logging": {
  "level": "DEBUG",
  "file": "nexus.log",
  "console": true
}
```

Then check the log file `nexus.log` for detailed information.

### Getting Help

If you encounter issues:
1. Check the logs in `nexus.log`
2. Verify all credentials are correct in `config.json`
3. Ensure all required APIs are enabled
4. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Relevant log entries

## Architecture

### Project Structure

```
Nexus/
├── main.py                    # Main entry point
├── setup.py                   # Setup script
├── config.json                # Your configuration (not in git)
├── config.example.json        # Configuration template
├── requirements.txt           # Python dependencies
├── .gitignore                # Git ignore rules
├── README.md                 # Project overview
├── GUIDE.md                  # This user guide
├── src/
│   ├── coordinators/         # Coordination logic
│   │   └── nexus_coordinator.py
│   ├── integrations/         # API clients
│   │   ├── limitless_client.py
│   │   ├── google_calendar_client.py
│   │   └── notion_client.py
│   └── utils/                # Utilities
│       ├── config.py         # Configuration management
│       └── logger.py         # Logging utilities
└── tests/                    # Unit tests
    └── test_integrations.py
```

### How It Works

1. **Initialization**: 
   - Loads configuration from `config.json`
   - Initializes clients for each service
   - Sets up logging

2. **Authentication**:
   - Connects to Google Calendar (OAuth2)
   - Validates Limitless API key
   - Validates Notion API token and database access

3. **Synchronization**:
   - Fetches data from each service
   - Transforms data to appropriate formats
   - Creates/updates entries in Notion

4. **Coordination**:
   - Runs sync cycles at configured intervals
   - Handles errors gracefully
   - Logs all operations

## Best Practices

1. **Security**:
   - Never commit `config.json` to version control
   - Keep API keys secure
   - Regularly rotate credentials

2. **Sync Frequency**:
   - Start with a 15-minute interval
   - Adjust based on your needs and API rate limits
   - Use `--sync-once` for manual control

3. **Data Management**:
   - Regularly review synced data in Notion
   - Archive old calendar events
   - Keep meeting notes organized

4. **Monitoring**:
   - Check logs regularly
   - Monitor sync statistics
   - Watch for error patterns

## Advanced Usage

### Running as a Service

On Linux systems, you can run Nexus as a systemd service:

1. Create a service file `/etc/systemd/system/nexus.service`:

```ini
[Unit]
Description=Nexus Strategic Coordination Assistant
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/Nexus
ExecStart=/usr/bin/python3 /path/to/Nexus/main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

2. Enable and start the service:

```bash
sudo systemctl enable nexus
sudo systemctl start nexus
```

### Custom Integrations

The modular architecture allows for easy extension:

1. Create a new client in `src/integrations/`
2. Add initialization in `NexusCoordinator`
3. Implement sync methods
4. Update configuration schema

## License

Private - All rights reserved by Boulet Stratégies TI
