# Wait Until

When an input is received the node will wait until the condition is met or the
timeout occurs then will pass on the last received message. Any new input will
reset the timeout timer.

## Configuration

### Entities <Badge text="required"/>

- Type: `string`
- Accepts [Mustache Templates](/guide/mustache-templates.md) only for entity type

A list of entities to wait for the condition to be met. The node will wait for any of the entities to meet the condition. If the entity is not found it will be ignored.

The types that can be used are: entity id, substring, and regex.

#### Examples

- `light.living_room` - Will wait for the entity with the id `light.living_room`
- `motion` - Will wait for any entity that has `motion` in the entity id
- `^light\..*` - Will wait for any entity that starts with `light.`

### Wait Until <Badge text="required"/>

- Type: `string`

The `property` field will be checked against the `value` field using the comparator.

### Timeout

- Type: `number`

The amount of time to wait for the condition to become true before deactivating the node and passing the message object to the second output. If the timeout is equal to zero the node will wait indefinitely for the condition to be met.

::: warning
If using a Node-RED global or flow context variable in the timeout field it will not update the timeout value if the context value changes after the node has been deployed.
:::

### Check against the current state

- Type: `boolean`

When an input is received it will check the comparator against the current state instead of waiting for a state change.

::: tip INFO
This is only available when there is only one entity selected
:::

## Input

### reset

If the received message has this property set to any value the node will be set to inactive and the timeout cleared.

### payload

- Type: `object`

### Example

```json
{
  "entities": {
    "entity": ["light.living_room", "light.bedroom"],
    "substring": ["light."],
    "regex": ["light.*"]
  },
  "property": "state",
  "comparator": "is",
  "value": "on",
  "valueType": "str",
  "timeout": 10,
  "timeoutUnits": "seconds",
  "checkCurrentState": false
}
```

## Output

Value types:

- `entity`: entity data of the triggered entity. Will be `undefined` if multiple entities are selected and the timeout occurs.
- `config`: config properties of the node
