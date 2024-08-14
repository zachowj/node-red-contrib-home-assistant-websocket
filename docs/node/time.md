# Time

The Time node can be scheduled to trigger at a specific future date and time, based on a Home Assistant entity. This node is useful for creating time-based automations, such as triggering a notification or alarm at a specific hour.

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
