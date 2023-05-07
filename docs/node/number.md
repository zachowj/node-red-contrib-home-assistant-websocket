::: warning
_Needs [Custom Integration](https://github.com/zachowj/hass-node-red) installed
in Home Assistant for this node to function_
:::

# Number

Creates a number in Home Assistant which can be manipulated from this node.

## Configuration

### State <Badge text="required"/>

- Type: `number`

The state of the entity should be updated to

## Inputs

properties of `msg.payload`

### state

- Type: `number`

The state of the entity should be updated to

## Outputs

Value types:

- `entity state`: entity state of the pressed button
- `config`: config properties of the node
