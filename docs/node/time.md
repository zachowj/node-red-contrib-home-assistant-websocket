# Time

A node that can be scheduled to trigger at a future date and time from a Home Assistant entity.

## Configuration

### Entity Id

- Type: `string`

A Home Assistant entity to be used when scheduling the node.

### Property

- Type: `string`

Which property of the entity object to use to schedule the node.

example properties:

- <code>entity_id</code>
- <code>state</code>
- <code>attributes.date</code>
- <code>last_updated</code>

example values for the property:

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

## Outputs

### topic

- Type: `string`

The entity id in the configuration.

### payload

- Type: `string | number | boolean | object`

### data

- Type: `object`

The entity object of the entity in the configuration.
