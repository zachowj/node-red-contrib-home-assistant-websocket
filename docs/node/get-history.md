# Get History

Fetches history from Home Assistant (all history for the past day by default)

## Configuration

### Entity ID

- Type: `string`

The entity id to fetch history for. Can be a single entity id or a comma separated list of entity ids.

### Entity ID Type

- Type: `string`
- Values: `==` | `regex`

The type of entity id matching to use. `==` will do an exact match, `regex` will use a regular expression to match the entity ids.

### Start Date

- Type: `string`
- Values: ISO Formattted Date
- Default: 24 hours prior

Date to start fetching history from. Will override the configuration if passed in. If `relativetime` is used this will be ignored.

**Also See:**

- [https://en.wikipedia.org/wiki/ISO_8601](https://en.wikipedia.org/wiki/ISO_8601)

### End Date

- Type: `string`
- Values: ISO Formattted Date
- Default: 24 hours from start date

The end date to fetch history too. Will override the configuration if passed in. If `relativetime` is used this will be ignored.

**Also See:**

- [https://en.wikipedia.org/wiki/ISO_8601](https://en.wikipedia.org/wiki/ISO_8601)

### Use Relative Time

- Type: `boolean`

A checkbox to use relative time or not. If checked the `startdate` and `enddate` will be ignored and the `relativetime` will be used instead.

### In the Last

- Type: `string`

A time string that will be parsed the following keywords into time values.

Example: `4h 30m` = The last 4 hours and 30 minutes

```
ms, milli, millisecond, milliseconds - will parse to milliseconds
s, sec, secs, second, seconds - will parse to seconds
m, min, mins, minute, minutes - will parse to minutes
h, hr, hrs, hour, hours - will parse to hours
d, day, days - will parse to days
w, week, weeks - will parse to weeks
mon, mth, mths, month, months - will parse to months
y, yr, yrs, year, years - will parse to years
```

### Flatten Results

Instead of returning the data from home assistant ( array for each entity_id ) return one flattened array of one item per history entry

### Output Types

- Type: `string`
- Values: `array` | `split`
- Default: `array`

The type of output to return. `array` will return an array of history objects. `split` will return an array of history objects for each entity id.

## Inputs

All properties of `msg.payload`

### entityId

- Type: `string`

### entityIdType

- Type: `equal` | `regex`

### startDate

- Type: `string`
- Values: ISO Formattted Date

### endDate

- Type: `string`
- Values: ISO Formattted Date

### relativeTime

- Type: `string`

### flatten

- Type: `boolean`

## Outputs

### payload

- Type: `array`

The history returned by home-assistant, which is an array of arrays where each array entry contains history objects for one particular entity

Example output of `msg`:

```json
{
  "payload": [
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
}
```

## Examples

[Check if an entity was a certain state in the last 24 hours](../cookbook/check-if-an-entity-was-turned-on-in-the-last-24-hours.md)

## References

- [Home Assistant History Component](https://www.home-assistant.io/integrations/history)
- [Home Assistant API: /api/history/period](https://developers.home-assistant.io/docs/en/external_api_rest.html#get-apihistoryperiodlttimestamp)
