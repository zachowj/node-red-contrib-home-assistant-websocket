---
sidebarDepth: 1
---

# Entity

Creates an entity in Home Assistant which can be manipulated from this node.

`binary sensor`, `sensor`, and `switch`

::: warning
_Needs [Custom Integration](https://github.com/zachowj/hass-node-red) installed
in Home Assistant for this node to function_
:::

## Configuration

### Type <Badge text="required"/>

- Type: `string`
- Values `binary_sensor|sensor|switch`
- Default: `sensor`

The state the entity should be updated to

### Home Assistant Config

- Type: `Object`

Configuration options available for the selected entity

::: danger WARNING
Entity nodes will not work in a subflow due to the way they register themselves
with Home Assistant. After a Node-RED restart, a new entity will be created in
Home Assistant.
:::

## Sensor Configuration

### State <Badge text="required"/>

- Type: `string | number | boolean`

The state the entity should be updated to

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

## Switch Configuration

### Output on state change

- Type: `boolean`

When the state of the switch changes it will output to the top if the switch is on or to the bottom if it is in the off position.

### Payload

- Type: `str | num | bool | JSONata | timestamp`

Customizable output set to `msg.payload` if `Output on state change` is enabled.

## Sensors Inputs

properties of `msg.payload`

### state

- Type: `string | number | boolean`

The state the entity should be updated to

### attributes

- Type: `Object`

Key/Value pair of attributes to update. The key should be a string and the value can be a `[string | number | boolean | object]`

## Switch Inputs

### msg.enable

- Type: `boolean`

Set to `true` to turn on the switch and `false` to turn off. If the message has a property `enable` set to the type `boolean` the node will not have any output.

## Outputs

**Status Color**

- Green/Red: output from the node was due to input to the node
- Blue: output from the node was due to the state of the node changing
- Yellow: state of node changed but no output
