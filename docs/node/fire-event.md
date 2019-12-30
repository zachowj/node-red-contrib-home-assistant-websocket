# Fire Event

Fire an event to Home Assistants event bus

## Configuration

### Event <Badge text="required"/>

- Type: `string`

Event name to fire

### data

- Type: `Object`

JSON object to pass along

## Inputs

If the incoming message has a `payload` property with `event` set it will override any config values if set.
If the incoming message has a `payload.data` that is an object or parsable into an object these properties will be **merged** with any config values set.
If the node has a property value in it's config for `Merge Context` then the `flow` and `global` contexts will
be checked for this property which should be an object that will also be merged
into the data payload.

### payload.event

- Type: `string`

Event to fire

### payload.data

- Type: `Object`

Event data to send

## Outputs

### payload.event_type

- Type: `string`

Event Type that was fired

### payload.data

- Type: `Object`

The event `data` sent, if one was used

## References

[Home Assistant Events](https://developers.home-assistant.io/docs/en/dev_101_events.html#firing-events)
