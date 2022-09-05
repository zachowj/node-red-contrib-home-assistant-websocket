# Get History

Fetches history from Home Assistant (all history for the past day by default)

## Configuration

### Entity ID

- Type: `string`

Exact entity_id to fetch history for must be an exact match as is passed directly to the Home Assistant.

### Entity ID Type

- Type: `string`
- Values: `is` | `includes`
- Default: `is`

`is` or `includes` depending on the match type.

::: warning
`includes` fetches all history for the time period then filters according to the value,
this will be less performant than exact `is` matching
:::

### Start Date

- Type: `string`
- Values: ISO Format Date
- Default: 24 hours prior

Date to start fetching history from. Will override the configuration if passed in

**Also See:**

- [https://en.wikipedia.org/wiki/ISO_8601](https://en.wikipedia.org/wiki/ISO_8601)

### End Date

- Type: `string`
- Values: ISO Format Date
- Default: 24 hours from start date

The end date to fetch history too. Will override the configuration if passed in

**Also See:**

- [https://en.wikipedia.org/wiki/ISO_8601](https://en.wikipedia.org/wiki/ISO_8601)

### Use Relative Time

- Type: `boolean`
- Default: `false`

A checkbox to use relative time or not.

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

## Inputs

All properties of `msg.payload`

### entity_id

- Type: `string`
- Alias: `msg.entityid` <Badge type="warning" text="deprecated" />

### startdate

- Type: `string`
- Values: ISO Format Date
- Alias: `msg.startdate` <Badge type="warning" text="deprecated" />

### enddate

- Type: `string`
- Values: ISO Format Date
- Alias: `msg.enddate` <Badge type="warning" text="deprecated" />

### relativetime

- Type: `string`
- Alias: `msg.relativetime` <Badge type="warning" text="deprecated" />

If `relativetime` exists `startdate` and `enddate` will be ignored.

### flatten

- Type: `boolean`
- Alias: `msg.flatten` <Badge type="warning" text="deprecated" />

## Outputs

### payload

- Type: `array`

The history returned by home-assistant, which is an array of arrays where each array entry contains history objects for one particular entity

### startdate

- Type: `string`

ISO date string used to fetch history

### enddate

- Type: `string`

ISO date string used to fetch history

### entity_id

- Type: `string`

The entity id string used during fetch history call

Example output of `msg`:

```json
{
  "startdate": "2020-01-11T16:41:31.086Z",
  "enddate": "2020-01-14T16:41:31.086Z",
  "entityid": "light.kitchen_light",
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

## References

- [Home Assistant History Component](https://www.home-assistant.io/integrations/history)
- [Home Assistant API: /api/history/period](https://developers.home-assistant.io/docs/en/external_api_rest.html#get-apihistoryperiodlttimestamp)
