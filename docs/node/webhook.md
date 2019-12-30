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

### topic

- Type: `string`

webhook ID

### payload

- Type: `object | number | string`

The parsed body from the webhook request.

<!-- TODO: add headers info -->
