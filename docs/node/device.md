# Device

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

## Outputs

Value types:

- `config`: config properties of the node
- `device id`: device id that triggered the node
- `event data`: event data received from Home Assistant
- `sent data`: data sent to Home Assistant
