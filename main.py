#!/usr/bin/env python3
"""
Nexus - Strategic Coordination & Unified Tracking
Main entry point
"""

import asyncio
import argparse
import sys
from pathlib import Path

from src.utils import Config, setup_logger
from src.coordinators import NexusCoordinator


async def main():
    """Main entry point"""
    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description="Nexus - Strategic Coordination & Unified Tracking"
    )
    parser.add_argument(
        '--config',
        default='config.json',
        help='Path to configuration file (default: config.json)'
    )
    parser.add_argument(
        '--sync-once',
        action='store_true',
        help='Run sync once and exit'
    )
    parser.add_argument(
        '--interval',
        type=int,
        default=15,
        help='Sync interval in minutes (default: 15)'
    )
    parser.add_argument(
        '--context',
        action='store_true',
        help='Get upcoming context and exit'
    )
    parser.add_argument(
        '--days',
        type=int,
        default=7,
        help='Number of days for context lookup (default: 7)'
    )
    
    args = parser.parse_args()
    
    # Load configuration
    try:
        config = Config(args.config)
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return 1
    
    # Setup logging
    log_config = config.get_logging_config()
    logger = setup_logger(
        name="nexus",
        level=log_config.get('level', 'INFO'),
        log_file=log_config.get('file'),
        console=log_config.get('console', True)
    )
    
    logger.info("Starting Nexus...")
    logger.info(f"Configuration loaded from: {args.config}")
    
    # Initialize coordinator
    coordinator = NexusCoordinator(config)
    
    # Connect to services
    logger.info("Connecting to services...")
    statuses = await coordinator.connect_all()
    
    # Check if any service is connected
    if not any(statuses.values()):
        logger.error("No services connected. Please check your configuration.")
        return 1
    
    # Execute based on mode
    if args.context:
        # Get and display upcoming context
        logger.info(f"Fetching upcoming context for {args.days} days...")
        context = await coordinator.get_upcoming_context(days=args.days)
        
        print("\n=== Upcoming Context ===")
        print(f"\nCalendar Events: {len(context['calendar_events'])}")
        for event in context['calendar_events'][:5]:
            print(f"  - {event.get('summary', 'Untitled')}")
        
        print(f"\nNotion Tasks: {len(context['notion_tasks'])}")
        for task in context['notion_tasks'][:5]:
            props = task.get('properties', {})
            name = props.get('Name', {}).get('title', [{}])[0].get('text', {}).get('content', 'Untitled')
            print(f"  - {name}")
        
        print(f"\nRelevant Memories: {len(context['relevant_memories'])}")
        
    elif args.sync_once:
        # Run single sync cycle
        logger.info("Running single sync cycle...")
        stats = await coordinator.run_sync_cycle()
        
        print("\n=== Sync Results ===")
        print(f"Calendar events synced: {stats['calendar_synced']}")
        print(f"Limitless notes synced: {stats['limitless_synced']}")
        print(f"Errors: {stats['errors']}")
        
    else:
        # Start continuous sync
        sync_config = config.get_sync_config()
        interval = args.interval or sync_config.get('interval_minutes', 15)
        
        logger.info(f"Starting continuous sync (interval: {interval} minutes)")
        logger.info("Press Ctrl+C to stop")
        
        try:
            await coordinator.start_continuous_sync(interval_minutes=interval)
        except KeyboardInterrupt:
            logger.info("Shutting down Nexus...")
    
    logger.info("Nexus stopped")
    return 0


if __name__ == '__main__':
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\nInterrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"Fatal error: {e}", file=sys.stderr)
        sys.exit(1)
