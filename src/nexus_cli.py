#!/usr/bin/env python3
"""
NEXUS CLI - AI-Powered Priority Assistant
Strategic Coordination & Unified Tracking for Boulet Stratégies TI

Usage:
    nexus priorities today      # Priorités du jour
    nexus priorities week       # Priorités de la semaine
    nexus priorities today --dry-run  # Test sans créer dans Notion
"""

import asyncio
import argparse
import logging
import sys
from pathlib import Path
from datetime import datetime

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.utils import Config
from src.connectors import LimitlessConnector, NotionConnector, ClaudeConnector
from skills.priority_detector.scripts import analyze_priorities, format_priorities_markdown


def setup_logging(level: str = "INFO"):
    """Setup logging configuration"""
    log_level = getattr(logging, level.upper(), logging.INFO)

    # Create formatters
    console_format = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%H:%M:%S'
    )

    file_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_handler.setFormatter(console_format)

    # File handler
    file_handler = logging.FileHandler('nexus.log')
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(file_format)

    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)


async def run_priority_detector(period: str, dry_run: bool = False):
    """
    Run priority detector workflow

    Args:
        period: Time period (today/week)
        dry_run: If True, don't create Notion TODOs
    """
    logger = logging.getLogger("nexus.cli")

    print("\n🚀 NEXUS - AI-Powered Priority Assistant")
    print("=" * 50)
    print(f"📅 Période : {period}")
    print(f"🔬 Mode : {'DRY-RUN (test)' if dry_run else 'PRODUCTION'}")
    print("=" * 50)
    print()

    # Load configuration
    try:
        config = Config("config/config.yaml")
        logger.info("Configuration loaded successfully")
    except FileNotFoundError as e:
        print(f"\n❌ Erreur : {e}")
        print("\n💡 Conseil : Copiez config/config.example.yaml vers config/config.yaml")
        print("   et remplissez vos clés API.")
        return 1

    # Initialize connectors
    print("🔌 Connexion aux services...")

    try:
        # Limitless
        limitless_config = config.get_limitless_config()
        limitless = LimitlessConnector(
            api_key=limitless_config.get('api_key'),
            endpoint=limitless_config.get('endpoint', 'https://api.limitless.ai/v1')
        )
        print("  ✅ Limitless")

        # Claude (Anthropic)
        anthropic_config = config.get_anthropic_config()
        claude = ClaudeConnector(
            api_key=anthropic_config.get('api_key'),
            model=anthropic_config.get('model', 'claude-sonnet-4-5-20250929')
        )
        print("  ✅ Claude (Anthropic)")

        # Notion
        notion_config = config.get_notion_config()
        notion = NotionConnector(
            api_token=notion_config.get('token'),
            database_id=notion_config.get('todo_database_id')
        )
        print("  ✅ Notion")

    except Exception as e:
        logger.error(f"Failed to initialize connectors: {e}")
        print(f"\n❌ Erreur d'initialisation : {e}")
        return 1

    print()

    # Run priority detection
    start_time = datetime.now()

    print("🔍 Analyse en cours...")
    print()

    try:
        results = await analyze_priorities(
            limitless_connector=limitless,
            claude_connector=claude,
            notion_connector=notion,
            period=period,
            dry_run=dry_run
        )

        # Format and display results
        markdown_output = format_priorities_markdown(results, period)
        print(markdown_output)

        # Display execution time
        elapsed = (datetime.now() - start_time).total_seconds()
        print()
        print(f"⏱️  Temps d'exécution : {elapsed:.1f}s")

        # Success message
        if results.get("success"):
            print("\n✨ Analyse terminée avec succès !")
            return 0
        else:
            print(f"\n⚠️  Avertissement : {results.get('message')}")
            return 0

    except Exception as e:
        logger.error(f"Priority detection failed: {e}", exc_info=True)
        print(f"\n❌ Erreur lors de l'analyse : {e}")
        print("\n💡 Consultez nexus.log pour plus de détails")
        return 1


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="NEXUS - AI-Powered Priority Assistant",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  nexus priorities today           # Priorités du jour
  nexus priorities week            # Priorités de la semaine
  nexus priorities today --dry-run # Test sans créer dans Notion

Documentation: https://github.com/chrisboulet/Nexus
        """
    )

    # Subcommands
    subparsers = parser.add_subparsers(dest='command', required=True, help='Commande à exécuter')

    # priorities command
    priorities_parser = subparsers.add_parser(
        'priorities',
        help='Détecter les priorités depuis Limitless'
    )
    priorities_parser.add_argument(
        'period',
        choices=['today', 'week'],
        help='Période à analyser (today ou week)'
    )
    priorities_parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Mode test : ne crée pas les TODOs dans Notion'
    )
    priorities_parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Mode verbeux (plus de logs)'
    )

    # Parse arguments
    args = parser.parse_args()

    # Setup logging
    log_level = "DEBUG" if args.verbose else "INFO"
    setup_logging(log_level)

    # Execute command
    if args.command == 'priorities':
        exit_code = asyncio.run(run_priority_detector(
            period=args.period,
            dry_run=args.dry_run
        ))
        sys.exit(exit_code)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrompu par l'utilisateur")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ Erreur fatale : {e}")
        logging.getLogger("nexus").error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)
