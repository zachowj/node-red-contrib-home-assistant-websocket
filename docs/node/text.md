::: warning
_Needs [Custom Integration](https://github.com/zachowj/hass-node-red) installed
in Home Assistant for this node to function_
:::

# Text

Creates a text entity in Home Assistant which can be manipulated from this node.

## Configuration

### Mode <Badge text="required"/>

- Type: 'listen' | 'get' | 'set'

The mode of the node

### Text <Badge text="required"/>

- Type: `string`

The string of the entity should be updated to

## Inputs

properties of `msg.payload`

### Text

- Type: `string`

The string of the text entity should be updated to

## Outputs

Value types:

- `value`: The text string of the entity
- `previous value`: The previous text string of the entity
- `config`: The config properties of the node

## Examples

<InfoPanelOnly>

[link](https://zachowj.github.io/node-red-contrib-home-assistant-websocket/node/text.html#examples)

</InfoPanelOnly>

<DocsOnly>

#### Usage example

![screenshot](./images/text_01.png)

@[code](@examples/node/text/text_usage.json)

</DocsOnly>
