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

### Attributes

- Type: `Object`

Key/Value pair of attributes to update. The key should be a string and the value can be a [string | number | boolean | object]

### Input Override

- Type: `string`
- Values: `accept | merge | block`

Determine how input values will be handled. When merge is selected the message object values will override the configuration values.

## Inputs

properties of `msg.payload`

### state

- Type: `string | number | boolean`

The value of the entity state will be updated.

### attributes

- Type: `Object`

Key/Value pair of attributes to update. The key should be a string and the value can be a `[string | number | boolean | object]`
