# Trigger: state

Much like the `State Changed Node` however, provides some advanced functionality
around common automation use cases.

An advanced version of `server:state-changed` node

<!-- TODO: Needs a total rework -->

## Configuration

### Conditions

This node has two default outputs "allowed" and "blocked". If all the
conditions are true the default message will be sent to the "allowed" output
otherwise it will be sent to the "blocked" output.

**See Also:**

- [Conditionals](/guide/conditionals.md)

### Custom Outputs

All the above conditions need to be true for any custom outputs to be sent,
having zero conditions is a valid option. Each custom output can send the
default message or a custom message. Also, each one can have its constraint
on whether or not to be sent.

## Input

Input is disabled by defualt it can be enabled using the `Enable Input` option.

### Enable / Disable

- Type: `string`

If incoming payload or message is a string and equal to `enable` or `disable` then set the node accordingly.
Saves over restarts.

### Output Initially

- Type: `boolean`

Output once on startup/deploy.

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

To test automation without having to manually change state in-home assistant send an input `payload` as an object which contains `entity_id`, `new_state`, and `old_state` properties. This will trigger the node as if the event came from Home Assistant.

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
