# Webhook

Outputs the data received from the created webhook in Home Assistant

::: warning
_Needs [Custom Integration](https://github.com/zachowj/hass-node-red) installed
in Home Assistant for this node to function_
:::

## Configuration

### ID

- Type: `string`

A string to be used for the webhook URL in Home Assistant.

### Payload

- Type: `string`

Customizable location for the webhook payload. Defaults to msg.payload

### Headers

- Type: `number`

Customizable location for the webhook request headers.

## Outputs

Value types:

- `received data`: The parsed body from the webhook request
- `trigger id`: webhook id
- `headers`: entity state of the triggered entity
- `params`: Query string parameters
- `config`: config properties of the node
