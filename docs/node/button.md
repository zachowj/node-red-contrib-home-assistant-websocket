::: warning
_Needs [Custom Integration](https://github.com/zachowj/hass-node-red) installed
in Home Assistant for this node to function_
:::

# Button

The Button node creates a button entity within Home Assistant that, when pressed, triggers a flow in Node-RED. This is useful for manual triggers within automations, allowing users to start an automation sequence directly from the Home Assistant interface with a simple click.

## Outputs

Value types:

- `entity`: complete entity object
- `entity id`: entity id of the pressed button
- `entity state`: entity state of the pressed button
- `config`: config properties of the node
