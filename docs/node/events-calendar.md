# Events: calendar

The Calendar node listens for events from Home Assistant's calendar integration. It triggers a flow in Node-RED when a calendar event starts or ends, allowing you to automate actions based on your calendar schedule.
This node polls the configured calendar at roughly 15‑minute intervals to discover upcoming items. When a calendar item matches the configured filter it is queued and the node schedules the flow to fire at the selected moment (start or end) adjusted by the configured Offset. Behavior notes:

The node polls calendars roughly every 15 minutes to discover events, then schedules an exact trigger at the event start or end adjusted by the configured offset. Events are tracked by unique ID to prevent duplicates, recurring and overlapping occurrences are handled independently, and a Node‑RED restart rescans and recovers pending occurrences — but very last‑minute changes between polls may be missed.

## Configuration:

### Entity ID <Badge text="required"/>

- Type: `string`

The entity_id for the calendar that contains triggerable calendar items.

### Relative To <Badge text="required"/>

- Type: `start | end`
- Default: `start`

Whether to trigger an event at the start or end of each matching calendar item.

### Offset <Badge text="required"/>

- Type: `number`
- Default: 0 seconds

A negative or positive amount of time to allow the event to be triggered before or after the calendar item's start/end time.

### Filter

- Type: `string`

A string to filter calendar items. If set, only calendar items whose summary contains this string will trigger events.

### Expose to Home Assistant

- Type: `boolean`

Creates a switch within Home Assistant to enable/disable this node. This feature requires [Node-RED custom integration](https://github.com/zachowj/hass-node-red) to be installed in Home Assistant

## Outputs

Value types:

- `calendar item`: the calendar item object as provided by the Home Assistant API

```json
{
  "start": "2023-10-01T09:00:00-07:00", // ISO 8601 format with timezone offset
  "end": "2023-10-01T10:00:00-07:00", // ISO 8601 format with timezone offset
  "summary": "Team Meeting", // Event summary
  "description": "Weekly sync with the team", // Event description
  "location": "Conference Room A", // Event location
  "uid": "12345-abcde-67890-fghij", // Unique identifier for the event
  "recurrence_id": null, // Recurrence ID if applicable
  "rrule": null, // Recurrence rule if applicable
  "all_day": false // Boolean indicating if it's an all-day event
}
```
