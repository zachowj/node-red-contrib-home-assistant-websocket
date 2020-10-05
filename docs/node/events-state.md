# Events: state

Outputs state_changed event types sent from Home Assistant

The autocomplete will open to allow easier selection in the case you want a specific entity however the actual match is a substring match so no validation is done

## Configuration:

### Entity ID <Badge text="required"/>

- Type: `string|regex`

matches for entity_id field

### Entity ID Filter Types <Badge text="required"/>

- Type: `string`
- Values: `exact|substring|regex`
- Default: `exact`

Substring can be a comma-delimited list.

### If State

- Type: `string`

If the conditional is evaluated as true send the message to the first output otherwise send it to the second output. If blank there will only be one output.

**Also see:**

- [Conditionals](/guide/conditionals.md)

### For

- Type: `number`

An amount of time an entity's state needs to be in that state before triggering.

::: tip
Output on Connect state changes will not start a timer.
:::

### State Type

- Type: `string`
- Values: `string|number|boolean`
- Default: `string`

Convert the state of the entity to the selected type. Boolean will be converted to true based on if the string is equal by default to (`y|yes|true|on|home|open`). Original value stored in msg.data.original_state

### Output only on state change

- Type: `boolean`

Output only when the state has changed and not on startup/deploy

### Output on Connect

- Type: `boolean`

Output once on startup/deploy

### Expose to Home Assistant

- Type: `boolean`

Creates a switch within Home Assistant to enable/disable this node. This feature requires [Node-RED custom integration](https://github.com/zachowj/hass-node-red) to be installed in Home Assistant

## Output

### topic

- Type: `string`

The entity ID that triggered the event.

### payload

- Type: `string|number|boolean`

The current state of the entity that triggered the event.

### data

- Type `Object`

original event object from Home Assistant

Example output of the data property:

```json
{
  "entity_id": "light.kitchen",
  "old_state": {
    "entity_id": "light.kitchen",
    "state": "off",
    "attributes": {
      "friendly_name": "Kitchen Light",
      "icon": "mdi:light-switch"
    },
    "last_changed": "2019-12-29T04:49:50.230660+00:00",
    "last_updated": "2019-12-29T04:49:50.230660+00:00",
    "context": {
      "id": "3a639379992d430595e3e9c73fb349e1",
      "parent_id": null,
      "user_id": null
    }
  },
  "new_state": {
    "entity_id": "light.kitchen",
    "state": "on",
    "attributes": {
      "brightness": 118,
      "friendly_name": "Kitchen Light",
      "icon": "mdi:light-switch"
    },
    "last_changed": "2019-12-29T05:28:44.238349+00:00",
    "last_updated": "2019-12-29T05:28:44.238349+00:00",
    "context": {
      "id": "8a147f61a375489284ef7a7715a6a8f2",
      "parent_id": null,
      "user_id": null
    },
    "timeSinceChangedMs": 12
  }
}
```

## Changelog

#### Version 1

- "if state"/"halt if" will now send the message to the first output if true and
  to the second if not. The old behavior, sending the message to the second
  output if true will continue to be in place until you edit one of the
  existing nodes via the UI and at that time the outputs will automatically be
  switched.
