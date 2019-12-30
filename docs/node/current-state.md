# Current State

Returns the current state of an entity. Useful for using conditional logic to automation flows.

## Configuration

### Entity ID <Badge text="required"/>

- Type: `string`

Match for entity_id field

### If State

- Type: `string`

If the conditional statement is evaluated as true send the message to the first
output otherwise send it to the second output. If blank there will only be one
output.

**Also see:**

- [Conditionals](/guide/conditionals.md)

### State Type

- Type: `string`
- Values: `string|number|boolean`
- Default: `string`

Convert the state of the entity to the selected type. Boolean will be converted to true based on if the string is equal by default to (`y|yes|true|on|home|open`). Original value stored in `msg.data.original_state`

### State Location

- Type : `string`
- Default: `msg.payload`

Customizable location for the entity’s state.

### Entity Location

- Type : `string`
- Default: `msg.data`

Customizable location for the entity object. Defaults to

### Override Topic

- Type: `boolean`
- Default: `false`

Write entity id to msg.topic

### Block Input Overrides

- Type: `boolean`
- Default: `false`

Stop msg.payload values from overriding local config

## Inputs

### payload.entity_id

- Type : `string`

  Overrides or sets the entity_id for which the current state is being fetched

## Outputs

### topic

- Type: `string`

Latest current state object received from home assistant

### payload

- Type: `string`
  Latest current state object received from home assistant

### data

- Type: `object`

Latest current state object received from home assistant

Example output of the data property:

```json
{
  "entity_id": "light.kitchen",
  "state": "on",
  "attributes": {
    "brightness": 255,
    "friendly_name": "Kitchen Light",
    "icon": "mdi:light-switch"
  },
  "last_changed": "2019-12-29T05:38:53.016984+00:00",
  "last_updated": "2019-12-29T05:38:53.016984+00:00",
  "context": {
    "id": "6c16e348494c42fb8c8e8bda92b20fb2",
    "parent_id": null,
    "user_id": null
  },
  "timeSinceChangedMs": 712192
}
```

### data.state

- Type: `string`

Main attribute state value, examples: 'on', 'off', 'home', 'open', 'closed', etc...

### data.entity_id

- Type: `string`

The entity to which this state belongs

### data.attributes

- Type: `object`

Supported attributes of state set by Home Assistant

### data.last_changed

- Type: `string`

ISO Date string of last time entity state changed

### data.last_updated

- Type: `string`

  ISO Date string of last time entity state was updated

### data.timeSinceChangedMs

- Type: Number

Milliseconds of last time entity state changed

## References

- [Home Assistant State Objects](https://home-assistant.io/docs/configuration/state_object/)

## Changelog

### Version 1

- "if state"/"halt if" will now send the message to the first output if true and to the second if not. The old behavior, sending the message to the second output if true, will continue to be in place until you edit one of the existing nodes via the UI and at that time the outputs will automatically be switched.
