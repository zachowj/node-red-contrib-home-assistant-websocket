# Wait Until

When an input is received the node will wait until the condition is met or the timeout occurs then will pass on the last received message

## Configuration

### Entity ID <Badge text="required"/>

- Type: `string`

The id of an entity to use for the comparison.

### Wait Until <Badge text="required"/>

- Type: `string`

The `property` field will be checked against the `value` field using the comparator.

### Timeout

- Type: `number`

The amount of time to wait for the condition to become true before deactivating the node and passing the message object to the second output. If the timeout is equal to zero the node will wait indefinitely for the condition to be met.

### Entity Location

- Type: `string`

The entity object can also be pass with the message object.

### Check against the current state

- Type: `boolean`

When an input is received it will check the comparator against the current state instead of waiting for a state change.

## Input

### reset

If the received message has this property set to any value the node will be set to inactive and the timeout cleared.

### payload

- Type: `object`

Override config values by passing in a property with a valid value.

- entityId
- property
- comparator
- value
- valueType
- timeout
- timeoutUnits
- entityLocation
- entityLocationType
- checkCurrentState

## Output

Will output the last received message when the condition is true or the timeout
occurs. If the condition becomes true the message will be pass to the first
output. If the timeout passes the message will be sent to the second output.
