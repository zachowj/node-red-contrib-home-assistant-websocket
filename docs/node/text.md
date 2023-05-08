::: warning
_Needs [Custom Integration](https://github.com/zachowj/hass-node-red) installed
in Home Assistant for this node to function_
:::

# Text

Creates a text entity in Home Assistant which can be manipulated from this node.

## Configuration

### State <Badge text="required"/>

- Type: `text`

The state of the entity should be updated to

## Inputs

properties of `msg.payload`

### state

- Type: `text`

The state of the text entity should be updated to

## Outputs

Value types:

- `entity state`: entity state of the text entity
- `config`: config properties of the node
