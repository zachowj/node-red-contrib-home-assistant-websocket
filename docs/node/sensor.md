::: warning
_Needs [Custom Integration](https://github.com/zachowj/hass-node-red) installed
in Home Assistant for this node to function_
:::

# Sensor

The Sensor node creates a sensor entity within Home Assistant that is controlled from Node-RED. Sensors are entities that report data from various sources, such as temperature, humidity, or motion detection. This node allows you to create and manage such sensors directly from your Node-RED flows.

## Configuration

### State <Badge text="required"/>

- Type: `string | number | boolean`

The state the entity should be updated to

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

### Resend state, attributes, and available

- Type: `boolean`

When creating the entity in Home Assistant this will also send the last updated state, attributes, and available value the node sent to Home Assistant

## Partial updates

State, available, and the attribute map are updated independently. Home Assistant keeps the last value for anything omitted.

For example, you can send a new state without changing attributes, flip availability without a state, or update the attribute map alone. A message that resolves nothing for all three parts is ignored (no update is sent).

## Inputs

properties of `msg.payload`

### state

- Type: `string | number | boolean`

The state the entity should be updated to

### available

- Type: `boolean`

Optional. Sets entity availability for this update. Omit to leave availability unchanged.

### attributes

- Type: `Object`

Key/Value pair of attributes to update. The key should be a string and the value can be a `[string | number | boolean | object]`
