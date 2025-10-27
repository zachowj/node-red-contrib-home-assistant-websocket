# Current State

This node is used to fetch the last known state of any entity within Home Assistant when it receives an input. It’s useful for making decisions based on the current status of entities, such as checking if a light is already on before turning it off, or determining the temperature reading before adjusting the thermostat.

## Configuration

### Entity ID <Badge text="required"/>

- Type: `string`
- Accepts [Mustache Templates](/guide/mustache-templates.md)

The id of the entity to return.

### If State

- Type: `string`

If the conditional statement is evaluated as true send the message to the first
output otherwise send it to the second output. If blank there will only be one
output.

**Also see:**

- [Conditionals](/guide/conditionals.md)

### For

- Type: `number`

The amount of time the entity state needs to have been constant for the "If state" to be `true`

### State Type

::: warning DEPRECATED
This feature is being phased out and will be removed in version **1.0.0**.  
Use the **output properties** for state conversion moving forward.
:::

- Type: `string`
- Values: `string|number|boolean`
- Default: `string`

Convert the state of the entity to the selected type. Boolean will be converted to true based on if the string is equal by default to (`y|yes|true|on|home|open`). Original value stored in `msg.data.original_state`

### Block Input Overrides

- Type: `boolean`
- Default: `false`

Stop `msg.payload` values from overriding local config

## Inputs

### payload.entityId

- Type : `string`

  Overrides or sets the entity id for which the current state is being fetched

## Outputs

Value types:

- `entity`: full entity object
- `entity id`: entity id of the triggered entity
- `entity state`: entity state of the triggered entity
- `config`: config properties of the node

## References

- [Home Assistant State Objects](https://home-assistant.io/docs/configuration/state_object/)
