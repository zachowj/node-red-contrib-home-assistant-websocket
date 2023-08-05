# Time

A node that can be scheduled to trigger at a future date and time from a Home Assistant entity.

## Configuration

### Entity Id

- Type: `string`

A Home Assistant entity to be used when scheduling the node.

### Property

- Type: `string`

Which property of the entity to use to schedule the node.

The node will accept any date string that the javascript object accepts as a valid date. It will also accept a 24-hour time format with the seconds place optional.

examples:

- <code>2020-12-31T02:47:54.837Z</code>
- <code>1609382842709</code>
- <code>13:40</code>
- <code>23:59:02</code>

### Offset

- Type: `number`

A negative or positive number that will be added to the scheduled time.

### Randomize time within the offset

- Type: `boolean`

When selected the time to trigger will be random selected from the scheduled time to the +/- offset.

### Payload

- Type: `string | number | boolean | object`

The payload is fully customizable. The default will be a JSONata expression that outputs the entity state.

### Repeat Daily

- Type: `boolean`

If selected the node will only use the time portion of the date string to schedule the node and will trigger at that time each day. Otherwise, the node will only trigger once at the given day and time.

### Expose as

- Type: `string`

When an entity is selected a switch entity will be created in Home Assistant. Turning on and off this switch will disable/enable the nodes in Node-RED.

## Outputs

### topic

- Type: `string`

The entity id in the configuration.

### payload

- Type: `string | number | boolean | object`

### data

- Type: `object`

The entity object of the entity in the configuration.
