# Zone

Outputs when one of the configured entities enter or leaves one of the defined zones.

## Configuration

### Entities

- Type: `array`

An array of entity ids to monitor for zone changes.

### Event

- Type: `string`

Set when to check an entity. Either entering or leaving a zone.

### Zones

- Type: `array`

An array of zone ids to check when a configured entity updates.

## Outputs

### topic

- Type: `string`

The entity id of the device/person that triggered the update.

### payload

- Type: `string`

The state of the device/person entity that triggered the update.

### data

- Type: `object`

The entity object of the device/person that triggered the update.

### zones

- Type: `array`

An array of zone entities where the device/person entity entered/left after an update of location.
