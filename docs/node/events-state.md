# Events: state

Outputs state_changed event types sent from Home Assistant

The autocomplete will open to allow easier selection in the case you want a specific entity however the actual match is a substring match so no validation is done

## Configuration:

### Entity ID <Badge text="required"/>

- Type: `string|regex`

matches for entity_id field

Custom ids can be inserted into the list by adding a `#` at the end of the id

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

::: warning
Output on Connect state changes will not start a timer.
:::

### State Type

- Type: `string`
- Values: `string|number|boolean`
- Default: `string`

Convert the state of the entity to the selected type. Boolean will be converted to true based on if the string is equal by default to (`y|yes|true|on|home|open`). Original value stored in msg.data.original_state

### Ignore state change event

- Type: `boolean`

A list of possible states that will be ignored.

### Output on Connect

- Type: `boolean`

Output once on startup/deploy

### Expose to Home Assistant

- Type: `boolean`

Creates a switch within Home Assistant to enable/disable this node. This feature requires [Node-RED custom integration](https://github.com/zachowj/hass-node-red) to be installed in Home Assistant

## Outputs

Value types:

- `event data`: full event object
- `entity id`: entity id of the triggered entity
- `entity state`: entity state of the triggered entity
- `config`: config properties of the node
