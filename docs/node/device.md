# Device

The Device node enables you to create device automations and call device actions within Home Assistant. This node interacts with devices connected to your Home Assistant instance, allowing you to perform tasks such as turning devices on or off, changing settings, or triggering specific device-related actions.

## Configuration

### Type

- Type: `string`
- Values: `trigger | action`

### Device

- Type: `string`

Id of the device

### Trigger

- Type: `object`

Home Assistant object of the trigger

### Action

- Type: `object`

Home Assistant object of the action

### Capabilities

- Type: `object`

### Expose as

- Type: `string`

When an entity is selected a switch entity will be created in Home Assistant. Turning on and off this switch will disable/enable the nodes in Node-RED.

## Outputs

Value types:

- `config`: config properties of the node
- `device id`: device id that triggered the node
- `event data`: event data received from Home Assistant
- `sent data`: data sent to Home Assistant
