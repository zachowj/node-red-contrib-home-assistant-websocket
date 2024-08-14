::: warning
_Needs [Custom Integration](https://github.com/zachowj/hass-node-red) installed
in Home Assistant for this node to function_
:::

# Number

The Number node creates a number entity in Home Assistant that can be manipulated from within Node-RED. This entity type is typically used to represent numeric values that can be adjusted, such as a thermostat setting or a brightness level for lights.

## Configuration

### Mode <Badge text="required"/>

- Type: 'listen' | 'get' | 'set'

The mode of the node

### Value <Badge text="required"/>

- Type: `number`

The value of the entity should be updated to

## Inputs

properties of `msg.payload`

### value

- Type: `number`

The value of the entity should be updated to

## Outputs

Value types:

- `value`: The value of the entity
- `previous value`: The previous value of the entity
- `config`: The config properties of the node

## Examples

<InfoPanelOnly>

[link](https://zachowj.github.io/node-red-contrib-home-assistant-websocket/node/number.html#examples)

</InfoPanelOnly>

<DocsOnly>

#### Usage example

![screenshot](./images/number_01.png)

@[code](@examples/node/number/number_usage.json)

</DocsOnly>
