::: warning
_Needs [Custom Integration](https://github.com/zachowj/hass-node-red) installed
in Home Assistant for this node to function_
:::

# Binary Sensor

Creates a binary sensor in Home Assistant which can be manipulated from this node.

## Configuration

### State <Badge text="required"/>

- Type: `boolean`

The state of the entity should be updated to

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
