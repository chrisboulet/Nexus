"""
Output formatting for priorities
Generate markdown reports
"""

from typing import Dict, List, Any
from datetime import datetime


def format_priorities_markdown(
    results: Dict[str, Any],
    period: str = "today"
) -> str:
    """
    Format priorities as markdown

    Args:
        results: Results from analyze_priorities
        period: Time period (today/week)

    Returns:
        Formatted markdown string
    """
    priorities = results.get("priorities", {})
    stats = results.get("stats", {})
    notion_url = results.get("notion_url", "")
    dry_run = results.get("dry_run", False)

    # Determine date range for title
    if period == "today":
        date_str = datetime.now().strftime("%d %B %Y")
        title = f"Priorités du jour - {date_str}"
    else:
        date_str = datetime.now().strftime("%d %B %Y")
        title = f"Priorités de la semaine - {date_str}"

    # Build markdown
    lines = [
        f"## 🎯 {title}",
        ""
    ]

    # Engagements
    engagements = priorities.get("engagements", [])
    if engagements:
        lines.append("### Engagements pris")
        for item in engagements:
            title_text = item.get("title", "Sans titre")
            source = item.get("source", "")
            confidence = item.get("confidence", 1.0)

            line = f"- [ ] {title_text}"
            if source:
                line += f" ({source})"
            if confidence < 0.9:
                line += f" [confiance: {confidence:.0%}]"

            lines.append(line)
        lines.append("")

    # Demandes
    demandes = priorities.get("demandes", [])
    if demandes:
        lines.append("### Demandes reçues")
        for item in demandes:
            title_text = item.get("title", "Sans titre")
            source = item.get("source", "")
            confidence = item.get("confidence", 1.0)

            line = f"- [ ] {title_text}"
            if source:
                line += f" ({source})"
            if confidence < 0.9:
                line += f" [confiance: {confidence:.0%}]"

            lines.append(line)
        lines.append("")

    # Deadlines
    deadlines = priorities.get("deadlines", [])
    if deadlines:
        lines.append("### Deadlines")
        for item in deadlines:
            title_text = item.get("title", "Sans titre")
            date_str = item.get("date", "")
            source = item.get("source", "")
            confidence = item.get("confidence", 1.0)

            line = f"- [ ] {title_text}"
            if date_str:
                line += f" (deadline: {date_str})"
            if source:
                line += f" [{source}]"
            if confidence < 0.9:
                line += f" [confiance: {confidence:.0%}]"

            lines.append(line)
        lines.append("")

    # Stats
    lines.append("---")
    lines.append("")

    total = stats.get("priorities_detected", 0)
    if total == 0:
        lines.append("✅ Aucune priorité détectée pour cette période")
    else:
        if dry_run:
            lines.append(f"🔍 DRY-RUN : {total} priorités détectées (non créées dans Notion)")
        else:
            created = stats.get("todos_created", 0)
            lines.append(f"✅ {created} TODOs créés dans Notion")

            if notion_url:
                lines.append(f"🔗 Voir dans Notion : {notion_url}")

    lines.append("")

    # Debug stats
    lifelogs = stats.get("lifelogs_analyzed", 0)
    lines.append(f"📊 Statistiques : {lifelogs} lifelogs analysés")

    return "\n".join(lines)


def format_simple_list(priorities: Dict[str, List[Dict[str, Any]]]) -> str:
    """
    Format priorities as simple list (for debugging)

    Args:
        priorities: Priorities dictionary

    Returns:
        Simple formatted string
    """
    lines = []

    total = (
        len(priorities.get("engagements", [])) +
        len(priorities.get("demandes", [])) +
        len(priorities.get("deadlines", []))
    )

    lines.append(f"Total priorities: {total}")
    lines.append(f"  - Engagements: {len(priorities.get('engagements', []))}")
    lines.append(f"  - Demandes: {len(priorities.get('demandes', []))}")
    lines.append(f"  - Deadlines: {len(priorities.get('deadlines', []))}")

    return "\n".join(lines)
