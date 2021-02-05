# Tag

Sends an output when Home Assistant receives a tag scanned event for a configured tag id.

## Configuration

### Tags

- Type: `array`

An array of tag ids to monitor for tag scanned events.

### Devices

- Type: `array`

An array of device ids to check when a configured tag is scanned.

## Outputs

### topic

- Type: `string`

The tag id of the tag that was scanned.

### payload

- Type: `object`

| Field     | Description                                           |
| --------- | ----------------------------------------------------- |
| device_id | ID of the device that scanned the tag                 |
| tag_id    | ID of the tag that was scanned                        |
| tag_name  | Home Assistant name of the tag that was scanned       |
| user_id   | Home Assistant user ID on device that scanned the tag |
