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

### State <Badge text="required"/>

- Type: `string | number | boolean`

The state the entity should be updated to

### Attributes

- Type: `Object`

Key/Value pair of attributes to update. The key should be a string and value can be a [string | number | boolean | object]

### Home Assistant Config

- Type: `Object`

Configuration options available for the selected entity

### Input Override

- Type: `string`
- Values: `accept | merge | block`

Determine how input values will be handled. When merge is selected the message object values will override the configuration values.

### Resend state and attributes

- Type: `boolean`

When creating the entity in Home Assistant this will also send the last updated state and attributes then node sent to Home Assistant

::: danger WARNING
Entity nodes will not work in a subflow due to the way they register themselves
with Home Assistant. After a Node-RED restart a new entity will be created in
Home Assistant.
:::

## Inputs

properties of `msg.payload`

### state

- Type: `string | number | boolean`

The state the entity should be updated to

### attributes

- Type: `Object`

Key/Value pair of attributes to update. The key should be a string and value can be a `[string | number | boolean | object]`

<!-- TODO: outputs -->
