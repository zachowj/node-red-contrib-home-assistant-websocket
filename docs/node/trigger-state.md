# Trigger: state

Much like the `State Changed Node` however, provides some advanced functionality
around common automation use cases.

An advanced version of the `server:state-changed` node

<!-- TODO: Needs a total rework -->

## Configuration

### Entity ID <Badge text="required"/>

- Type: `string`

The id of an entity to use for the comparison.

Custom ids can be inserted into the list by adding a `#` at the end of the id

### Entity ID Filter Types <Badge text="required"/>

- Type: `string`
- Values: `exact|list|substring|regex`
- Default: `exact`

### State Type

- Type: `string`
- Values: `string|number|boolean`
- Default: `string`

Convert the state of the entity to the selected type. Boolean will be converted to true based on if the string is equal by default to (`y|yes|true|on|home|open`). Original value stored in msg.data.original_state

### Conditions

This node has two default outputs "allowed" and "blocked". If all the
conditions are true the default message will be sent to the "allowed" output
otherwise, it will be sent to the "blocked" output.

**See Also:**

- [Conditionals](/guide/conditionals.md)

### Custom Outputs

All the above conditions need to be true for any custom outputs to be sent,
having zero conditions is a valid option. Each custom output can send the
default message or a custom message. Also, each one can have its constraint
on whether or not to be sent.

### Output on connect

- Type: `boolean`

Output once on startup/deployment.

### Enable input

- Type: `boolean`

Enable the input to be used to send a message to the node.

### Output debug information

- Type: `boolean`

Output debug information to the debug tab.

### Expose to Home Assistant

- Type: `boolean`

Expose the node to Home Assistant.

## Input

Input is disabled by default. It can be enabled using the `Enable Input` option. Input can be used to [enable/disable](#enable-disable) the node or for [testing](#testing).

### Enable / Disable

- Type: `string`

If the incoming payload or message is a string and equal to `enable` or `disable` then set the node accordingly.
Saves over restarts.

## Output

### topic

- Type: `string`

The entity_id that triggered the node

### payload

- Type: `string`

The state as sent by home assistant

### data

- Type: `object`

The original home assistant event containing `entity_id` `new_state` and `old_state` properties

## Testing

To test automation without having to manually change the state in home assistant send an input `payload` as an object which contains `entity_id`, `new_state`, and `old_state` properties. This will trigger the node as if the event came from Home Assistant.

```json
{
  "entity_id": "test_entity",
  "old_state": {
    "state": "on"
  },
  "new_state": {
    "state": "off"
  }
}
```

## References

- [HA State Object](https://home-assistant.io/docs/configuration/state_object)
