# Poll State

Polls for the state at regular intervals, optionally also outputting at the start and when the state changes. Useful for either alert for non-communicating devices (time since change > 1 day for example) or dashboard graphs with consistent interval charts

## Configuration

### Entity ID <Badge text="required"/>

The entity id of the entity to poll for.

### Update Interval

- Type: `number`

The amount of time between checking/sending updates.

### If State

- Type: `string`

If the conditional statement is evaluated as true send the message to the first output otherwise send it to the second output. If blank there will only be one output.

**Also see:**

- [Conditionals](/guide/conditionals.md)

### State Type

- Type: `string`

Convert the state of the entity to the selected type. Boolean will be converted to true based on if the string is equal by default to (y|yes|true|on|home|open). Original value stored in msg.data.original_state

### Output Initially

- Type: `boolean`

Output once on startup/deploy then on each interval

### Expose to Home Assistant

- Type: `boolean`

Creates a switch within Home Assistant to enable/disable this node. This feature requires [Node-RED custom integration](https://github.com/zachowj/hass-node-red) to be installed in Home Assistant

## Outputs

### topic

- Type: `string`

entity_id of changed entity

### payload.data

- Type: `object`

The last known state of the entity

### payload.data.timeSinceChanged

- Type: `string`

Human readable format string of time since last updated, example "1 hour ago"

### payload.data.timeSinceChangedMs

- Type: `number`

Number of milliseconds since last changed

## References

- [Home Assistant State Objects](https://home-assistant.io/docs/configuration/state_object/)

## Changelog

#### Version 1

- "if state"/"halt if" will now send the message to the first output if true and to the second if not. The old behavior, sending the message to the second output if true, will continue to be in place until you edit one of the existing nodes via the UI and at that time the outputs will automatically be switched.
