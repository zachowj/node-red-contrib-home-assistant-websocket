# Poll State

The Poll State node outputs the state of an entity at regular intervals. It can also be configured to trigger at startup and whenever the entity changes state, if desired. This node is useful for regularly checking the status of an entity, ensuring your automations stay up to date with the latest information.

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

::: warning DEPRECATED
This feature is being phased out and will be removed in version **1.0.0**.  
Use the **output properties** for state conversion moving forward.
:::

- Type: `string`

Convert the state of the entity to the selected type. Boolean will be converted to true based on if the string is equal by default to (y|yes|true|on|home|open). Original value stored in msg.data.original_state

### Output Initially

- Type: `boolean`

Output once on startup/deploy then on each interval

<!-- @include: @snippets/node/expose-as.md -->

## Outputs

### topic

- Type: `string`

entity_id of changed entity

### payload

- Type: `object`

The last known state of the entity

### data.timeSinceChanged

- Type: `string`

Human readable format string of time since last updated, example "1 hour ago"

### data.timeSinceChangedMs

- Type: `number`

Number of milliseconds since last changed

## References

- [Home Assistant State Objects](https://home-assistant.io/docs/configuration/state_object/)
