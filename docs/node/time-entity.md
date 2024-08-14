::: warning
_Needs [Custom Integration](https://github.com/zachowj/hass-node-red) installed
in Home Assistant for this node to function_
:::

# Time

The Time Entity node creates a time entity within Home Assistant that can be controlled from Node-RED. This entity type is used to represent time values, such as a specific time of day or a duration, and can be used to trigger automations based on time-related conditions.

## Configuration

### Mode <Badge text="required"/>

- Type: 'listen' | 'get' | 'set'

The mode of the node

### Value <Badge text="required"/>

- Type: `string`
- Format: `HH:mm:ss` | `HH:mm`

The value of the entity should be updated to

## Inputs

properties of `msg.payload`

### value

- Type: `string`
- Format: `HH:mm:ss` | `HH:mm`

The value of the entity should be updated to

## Outputs

Value types:

- `value`: The value of the entity
- `previous value`: The previous value of the entity
- `config`: The config properties of the node

## Examples

<InfoPanelOnly>

[link](https://zachowj.github.io/node-red-contrib-home-assistant-websocket/node/time-entity.html#examples)

</InfoPanelOnly>

<DocsOnly>

#### Usage example

![screenshot](./images/time_entity_01.png)

@[code](@examples/node/time-entity/time_usage.json)

</DocsOnly>
