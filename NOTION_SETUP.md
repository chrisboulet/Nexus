# Notion Database Setup Guide

This guide helps you set up the Notion database structure for optimal use with Nexus.

## Creating the Database

1. Open Notion
2. Create a new page or navigate to an existing workspace
3. Type `/database` and select "Database - Full page"
4. Name your database (e.g., "Nexus CRM")

## Required Properties

Nexus expects the following properties in your Notion database:

### 1. Name (Title)
- **Type**: Title
- **Description**: The title/name of the entry
- **Created by default**

### 2. Type (Select)
- **Type**: Select
- **Description**: Type of entry (Meeting, Calendar Event, Task, etc.)
- **Options**:
  - Meeting
  - Calendar Event
  - Task
  - Note
  - Contact

To create:
1. Click "+" or the last column header
2. Select "Select"
3. Name it "Type"
4. Add the options above

### 3. Date (Date)
- **Type**: Date
- **Description**: Date and time of the entry

To create:
1. Click "+"
2. Select "Date"
3. Name it "Date"

### 4. Attendees (Multi-select)
- **Type**: Multi-select
- **Description**: People involved (for meetings)

To create:
1. Click "+"
2. Select "Multi-select"
3. Name it "Attendees"

### 5. Notes (Rich Text) - Optional
- **Type**: Text
- **Description**: Additional notes or description

To create:
1. Click "+"
2. Select "Text"
3. Name it "Notes"

### 6. Status (Select) - Optional
- **Type**: Select
- **Description**: Status of the item
- **Options**:
  - Pending
  - In Progress
  - Completed
  - Cancelled

### 7. Priority (Select) - Optional
- **Type**: Select
- **Description**: Priority level
- **Options**:
  - High
  - Medium
  - Low

## Complete Database Schema

Here's the recommended complete schema:

| Property Name | Type         | Required | Description                    |
|--------------|--------------|----------|--------------------------------|
| Name         | Title        | Yes      | Title/name of the entry       |
| Type         | Select       | Yes      | Entry type                    |
| Date         | Date         | Yes      | Date and time                 |
| Attendees    | Multi-select | Yes      | People involved               |
| Notes        | Text         | No       | Additional notes              |
| Status       | Select       | No       | Current status                |
| Priority     | Select       | No       | Priority level                |
| Source       | Select       | No       | Where the entry came from     |
| Tags         | Multi-select | No       | Custom tags                   |

## Getting the Database ID

After creating your database:

1. Open the database in Notion
2. Look at the URL in your browser
3. The URL format is: `https://www.notion.so/workspace/DATABASE_ID?v=VIEW_ID`
4. Copy the `DATABASE_ID` portion (32 characters, alphanumeric with hyphens)
5. Paste it into your `config.json` file

Example:
```
URL: https://www.notion.so/myworkspace/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6?v=...
Database ID: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## Sharing with Integration

1. Open your database in Notion
2. Click the "..." menu in the top-right corner
3. Scroll down and click "Add connections"
4. Find your Nexus integration and click it
5. Confirm the connection

The integration now has access to read and write to this database.

## Sample Database Setup

### Quick Setup Template

Copy this template to get started quickly:

**Properties:**
1. Name (Title) - Default
2. Type (Select) - Options: Meeting, Calendar Event, Task, Note
3. Date (Date) - Enable time
4. Attendees (Multi-select) - Add names as needed
5. Notes (Text) - For descriptions

### Views

Create different views for different purposes:

#### 1. Meetings View
- Filter: Type = Meeting
- Sort: Date (Descending)
- Show: Name, Date, Attendees

#### 2. Calendar Events View
- Filter: Type = Calendar Event
- Sort: Date (Ascending)
- Show: Name, Date, Notes

#### 3. Tasks View
- Filter: Type = Task
- Sort: Priority, Date
- Show: Name, Status, Priority, Date

#### 4. Timeline View
- Display as: Timeline
- Date property: Date
- Show: All types

## Database Templates

You can create templates within your database for common entry types:

### Meeting Template
```
Name: [Meeting Title]
Type: Meeting
Date: [Select date/time]
Attendees: [Select attendees]

Page content:
- Agenda
  - 
- Notes
  - 
- Action Items
  - [ ] 
```

### Task Template
```
Name: [Task name]
Type: Task
Status: Pending
Priority: Medium
Date: [Due date]

Page content:
- Description
  - 
- Acceptance Criteria
  - [ ] 
```

## Automation Ideas

Once your database is set up, you can add Notion automations:

### 1. Auto-assign Status
When Date is in the past and Status is "Pending", change to "Completed"

### 2. Notification
When new entry is added, notify in Slack/Email

### 3. Recurring Items
Create recurring meeting entries automatically

## Customization

Feel free to customize the database to fit your needs:

- Add custom properties for your workflow
- Create additional views
- Set up automations
- Add filters and sorts
- Customize colors and icons

## Important Notes

1. **Property Names**: If you change property names, you'll need to update the Nexus code in `src/integrations/notion_client.py`

2. **Required Fields**: Nexus expects at least Name, Type, and Date properties

3. **Permissions**: Make sure the integration has permission to read AND write

4. **Multiple Databases**: You can use multiple databases by running multiple Nexus instances with different configs

## Testing the Setup

After setting up your database:

1. Manually create a test entry in Notion
2. Run `python main.py --sync-once` to test the connection
3. Check the logs for any errors
4. Verify that Nexus can read from your database

## Troubleshooting

### "Database not found"
- Verify the database ID is correct
- Ensure the database is shared with your integration

### "Invalid properties"
- Check that required properties exist
- Verify property types match expectations

### "Permission denied"
- Re-share the database with your integration
- Check integration permissions in Notion settings

## Examples

### Example Database Entry Created by Nexus

```
Name: Team Sync - Weekly Planning
Type: Meeting
Date: October 23, 2024 2:00 PM
Attendees: John, Sarah, Mike
Status: Completed

Notes:
- Discussed Q4 goals
- Reviewed current projects
- Assigned action items

Action Items:
- [ ] John: Complete proposal by Friday
- [ ] Sarah: Review designs
- [ ] Mike: Update timeline
```

### Example Calendar Event

```
Name: Client Presentation
Type: Calendar Event
Date: October 25, 2024 10:00 AM
Notes: Present new features to ABC Corp
Status: Pending
Priority: High
```

## Advanced Setup

### Relational Properties

You can link entries to other databases:

1. Create a "Contacts" database
2. Add a "Related Contact" property (Relation type)
3. Link meeting entries to contacts

### Formulas

Add calculated properties:

```
Days Until: dateBetween(prop("Date"), now(), "days")
Is Overdue: and(prop("Date") < now(), prop("Status") != "Completed")
```

### Roll-ups

Aggregate data from related entries:

1. Link to related database
2. Add roll-up property
3. Calculate sums, averages, etc.

## Resources

- [Notion API Documentation](https://developers.notion.com/)
- [Notion Database Guide](https://www.notion.so/help/guides/creating-a-database)
- [Notion Integrations](https://www.notion.so/my-integrations)

---

For questions about Notion setup, refer to [Notion's documentation](https://www.notion.so/help) or contact support.
