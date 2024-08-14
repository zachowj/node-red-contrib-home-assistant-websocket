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

### Attributes

- Type: `Object`

Key/Value pair of attributes to update. The key should be a string and the value can be a [string | number | boolean | object]

### Input Override

- Type: `string`
- Values: `accept | merge | block`

Determine how input values will be handled. When merge is selected the message object values will override the configuration values.

### Resend state and attributes

- Type: `boolean`

When creating the entity in Home Assistant this will also send the last updated state and attributes then node sent to Home Assistant

## Inputs

properties of `msg.payload`

### state

- Type: `string | number | boolean`

The state the entity should be updated to

### attributes

- Type: `Object`

Key/Value pair of attributes to update. The key should be a string and the value can be a `[string | number | boolean | object]`
