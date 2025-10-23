"""
Priority analysis script
Main logic for priority detection workflow
"""

import logging
from typing import Dict, List, Any
from datetime import datetime


async def analyze_priorities(
    limitless_connector,
    claude_connector,
    notion_connector,
    period: str = "today",
    dry_run: bool = False
) -> Dict[str, Any]:
    """
    Main priority detection workflow

    Args:
        limitless_connector: Limitless API connector
        claude_connector: Claude API connector
        notion_connector: Notion API connector
        period: Time period (today/week)
        dry_run: If True, don't create Notion TODOs

    Returns:
        Dictionary with results and statistics
    """
    logger = logging.getLogger("nexus.priority_detector")

    # Step 1: Fetch lifelogs from Limitless
    logger.info(f"Fetching lifelogs for period: {period}")

    days = 1 if period == "today" else 7
    lifelogs = await limitless_connector.get_lifelogs(days=days)

    if not lifelogs:
        logger.warning("No lifelogs found")
        return {
            "success": False,
            "message": "No lifelogs found for this period",
            "priorities": {"engagements": [], "demandes": [], "deadlines": []},
            "stats": {}
        }

    logger.info(f"Retrieved {len(lifelogs)} lifelogs")

    # Step 2: Analyze with Claude
    logger.info("Analyzing lifelogs with Claude...")
    priorities = await claude_connector.analyze_priorities(lifelogs, period)

    total_priorities = (
        len(priorities.get("engagements", [])) +
        len(priorities.get("demandes", [])) +
        len(priorities.get("deadlines", []))
    )

    logger.info(f"Detected {total_priorities} priorities")

    if total_priorities == 0:
        return {
            "success": True,
            "message": "No priorities detected in lifelogs",
            "priorities": priorities,
            "stats": {
                "lifelogs_analyzed": len(lifelogs),
                "priorities_detected": 0,
                "todos_created": 0
            }
        }

    # Step 3: Create TODOs in Notion
    todos_created = 0
    notion_url = ""

    if not dry_run:
        logger.info("Creating TODOs in Notion...")
        creation_stats = notion_connector.create_todos_batch(priorities)
        todos_created = creation_stats.get("total", 0)
        notion_url = notion_connector.get_database_url()
        logger.info(f"Created {todos_created} TODOs in Notion")
    else:
        logger.info("DRY-RUN mode: Skipping Notion TODO creation")

    # Step 4: Return results
    return {
        "success": True,
        "message": f"Analyzed {len(lifelogs)} lifelogs, detected {total_priorities} priorities",
        "priorities": priorities,
        "stats": {
            "lifelogs_analyzed": len(lifelogs),
            "priorities_detected": total_priorities,
            "todos_created": todos_created,
            "engagements": len(priorities.get("engagements", [])),
            "demandes": len(priorities.get("demandes", [])),
            "deadlines": len(priorities.get("deadlines", []))
        },
        "notion_url": notion_url,
        "dry_run": dry_run
    }
