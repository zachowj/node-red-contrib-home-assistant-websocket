::: warning
_Needs [Custom Integration](https://github.com/zachowj/hass-node-red) installed
in Home Assistant for this node to function_
:::

# Binary Sensor

This node allows you to create a binary sensor entity within Home Assistant that can be controlled directly from Node-RED. A binary sensor is a type of entity that has only two possible states: typically "on" or "off". It can represent various real-world conditions, such as whether a door is open or closed, or if motion is detected.

## Configuration

### State <Badge text="required"/>

- Type: `boolean`

The state of the entity should be updated to

To set the Home Assistant state to `Unknown`, send a state with a js expression `null`.

### Available

- Type: `boolean`
- Default: `true`

Whether the Home Assistant entity is available. By default, every update sends available as true. On creation, or after a Home Assistant restart without Resend, the entity starts unavailable until availability is set again.

If availability comes from a message, flow, global, or expression, and that value is missing, it is not sent and Home Assistant leaves availability unchanged. In that case, set availability again after a Home Assistant or Node-RED restart or the entity will remain unavailable.

### Attributes

- Type: `Object`

Key/Value pair of attributes to update. The key should be a string and the value can be a [string | number | boolean | object]

### Input Override

- Type: `string`
- Values: `accept | merge | block`

Determine how input values will be handled. When merge is selected the message object values will override the configuration values.

## Partial updates

State, available, and the attribute map are updated independently. Home Assistant keeps the last value for anything omitted.

For example, you can send a new state without changing attributes, flip availability without a state, or update the attribute map alone. A message that resolves nothing for all three parts is ignored (no update is sent).

## Inputs

properties of `msg.payload`

### state

- Type: `string | number | boolean`

The value of the entity state will be updated.

### available

- Type: `boolean`

Optional. Sets entity availability for this update. Omit to leave availability unchanged.

### attributes

- Type: `Object`

Key/Value pair of attributes to update. The key should be a string and the value can be a `[string | number | boolean | object]`
