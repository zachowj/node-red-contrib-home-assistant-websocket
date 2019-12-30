# Get Entities

Get Entities based on search criteria

## Configuration

### Search Criteria

All search criteria have to be true for an entity to be valid.

### Property

Has autocompleted with all properties currently set on all loaded entities.

## Inputs

### payload

- Type: `Object`

Override config values by passing in a property with a valid value.

- rules array
  - property string
  - logic string
  - value string
  - valueType string
- outputType string
- outputEmptyResults boolean
- outputLocationType string
- outputLocation string
- outputResultscount number

## Outputs

### Array

- Type: `Array`

Sends an array of state objects from search criteria to the Output Location.

### Count

- Type: `number`

Return the total count of valid entities.

### Random

- Type: `Object|Array`

Return a random object or array from the available state objects to the Output Location. When <code>One Max Results</code> is selected it will return an object and when more than one is selected will always return an array of state objects.

### Split

- Type: `msg` part

Sends a message for each state object. In the same format as if the split node was used.

## State Object Format

Sample output when the Output Type is an array:

```json
[
  {
    "entity_id": "light.kitchen",
    "state": "on",
    "attributes": {
      "brightness": 243,
      "friendly_name": "Kitchen Light",
      "supported_features": 33,
      "icon": "mdi:light-switch"
    },
    "last_changed": "2019-12-29T05:38:53.016984+00:00",
    "last_updated": "2019-12-29T05:38:53.016984+00:00",
    "context": {
      "id": "6c16e348494c42fb8c8e8bda92b20fb2",
      "parent_id": null,
      "user_id": null
    },
    "timeSinceChangedMs": 3466747
  }
]
```

### entity_id

- Type: `string`

The entity to which this state belongs

### state

- Type: `string`

Main attribute state value, examples: 'on', 'off', 'home', 'open', 'closed', etc...

### attributes

- Type: `Object`

Supported attributes of state set by Home Assistant

### last_changed

- Type: `string`

ISO Date string of last time entity state changed

### timeSinceChangedMs

- Type: `number`

Milliseconds since last time entity state changed

### last_updated

- Type: `string`

ISO Date string of last time entity state was updated

### context

- Type: `Object`

Information on who/what changed the state of this object last.

## References

- [Home Assistant State Objects](https://home-assistant.io/docs/configuration/state_object/)
