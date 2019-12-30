# Get History

Fetches history from Home Assistant (all history for the past day by default)

## Configuration

<!-- TODO: Needs to be added -->

## Inputs

### entityid

- Type: `string`

Exact entity_id to fetch history for must be an exact match as is passed directly to the Home Assistant API

### startdate

- Type: `string | date`

Date to start fetching history from. Will override the node's configuration if passed in

### enddate

- Type: `string | date`

Date to fetch history to. Will override the node's configuration if passed in

### relativetime

- Type: `string`

A time string to be parsed into datetime string

### Flatten

Instead of returning the data from home assistant ( array for each entity_id ) return one flattened array of one item per history entry

## Outputs

### payload

- Type: `array`

The history returned by home-assistant, which is an array of arrays where each array entry contains history objects for one particular entity

Example output of payload:

```json
[
  ...,
  {
    "attributes": {
      "friendly_name": "Kitchen Light",
      "icon": "mdi:light-switch",
    },
    "context": {
      "id": "850e510e36fb494c9abc79e01e897d54",
      "parent_id": null,
      "user_id": null
    },
    "entity_id": "light.kitchen_light",
    "last_changed": "2019-12-28T06:47:28.618000+00:00",
    "last_updated": "2019-12-28T06:47:28.618000+00:00",
    "state": "off"
  },
  {
    "attributes": {
      "brightness": 28,
      "friendly_name": "Kitchen Light",
      "icon": "mdi:light-switch",
    },
    "context": {
      "id": "4d4abe29f2bc43dab39101193f1fefe4",
      "parent_id": null,
      "user_id": null
    },
    "entity_id": "light.kitchen_light",
    "last_changed": "2019-12-28T07:48:11.514137+00:00",
    "last_updated": "2019-12-28T07:48:11.514137+00:00",
    "state": "on"
  },
  ...
]
```

### startdate

- Type: `string`

ISO date string used to fetch history

### enddate

- Type: `string`

ISO date string used to fetch history

### relativetime

- Type: `string`

The time string parsed into the start date

### entityid

- Type: `string`

The entity id string used during fetch history call

### entityidtype

- Type: `string`

  `is` or `includes` depending on the match type. NOTE: `includes` fetches all history for time period then filters according to value, this will be less performant than exact (`is`) matching

## Details

Will return past day history for all entities by default, pass in `msg.startdate`

## References

- [Home Assistant History Component](https://home-assistant.io/components/history)
- [Home Assistant API: /api/history/period](https://developers.home-assistant.io/docs/en/external_api_rest.html#get-api-history-period-lt-timestamp)
