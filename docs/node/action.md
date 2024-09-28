# Action

This node allows you to send a request to Home Assistant to perform specific actions. These actions could include tasks such as turning on a light (`light.turn_on`), selecting an option from a dropdown menu (`input_select.select_option`), or any other service call supported by Home Assistant. It serves as a bridge between Node-RED and Home Assistant, enabling automation flows to directly control devices or entities in your smart home setup.

::: tip Helpful Examples
[Action Tips and Tricks](../guide/action.html)
:::

## Configuration

### Action <Badge text="required"/>

- Type: `string`
- Accepts [Mustache Templates](../guide/mustache-templates.md)

Action to perform

### Floor

- Type: `an array of floor ids`
- Accepts [Mustache Templates](../guide/mustache-templates.md) for ids

A list of floor ids that will be used as targets for the action

### Area

- Type: `an array of area ids`
- Accepts [Mustache Templates](../guide/mustache-templates.md) for ids

A list of area ids that will be used as targets for the action

Custom ids can be inserted into the list by adding a `#` at the end of the id

### Device

- Type: `an array of device ids`
- Accepts [Mustache Templates](../guide/mustache-templates.md) for ids

A list of device ids that will be used as targets for the action

Custom ids can be inserted into the list by adding a `#` at the end of the id

### Entity

- Type: `an array of entity ids`
- Accepts [Mustache Templates](../guide/mustache-templates.md) for ids

A list of entity ids that will be used as targets for the action

### Label

- Type: `an array of label ids`
- Accepts [Mustache Templates](../guide/mustache-templates.md) for ids

A list of label ids that will be used as targets for the action

### Data

- Type: `JSONata | JSON`
- Accepts [Mustache Templates](../guide/mustache-templates.md) when data type is JSON

JSON object to pass along.

### Merge Context

- Type: `string`

If defined will attempt to merge the global and flow context variable into the config

### Alternative Template Tags

- Type: `boolean`

Will change the tags used for the mustache template to `<%` and `%>`

### Queue

- Type: `none | first | all | last`

Will store the first, last, or all messages received while disconnected from Home Assistant and send them once connected again

### Block Input Overrides

- Type: `boolean`
- Default: `true`

Stop `msg.payload` values from overriding local config

## Input

All properties need to be under `msg.payload`.

Sample input

```JSON
{
    "action": "homeassistant.turn_on",
    "target": {
        "floor_id": ["first_floor"],
        "area_id": ["kitchen"],
        "device_id": ["8932894082930482903"],
        "entity_id": ["light.kitchen", "switch.garage_light"],
        "label_id": ["outdoor_lights"]
    }
    "data": {
        "brightness_pct": 50
    }
}
```

#### Merging

If the incoming message has a `payload` property with `action` set it will override any config values if set.

If the incoming message has a `payload.data` that is an object these properties will be <strong>merged</strong> with any config values set.

If the node has a property value in its config for `Merge Context` then the `flow` and `global` contexts will be checked for this property which should be an object that will also be merged into the data payload.

#### Merge Resolution

As seen above the `data` property has a lot going on in the way of data merging, in the end, all of these are optional and the rightmost will win if a property exists in multiple objects

Config Data, Global Data, Flow Data, Payload Data ( payload data property always wins if provided )

### action

- Type: `string`

Action to call

### data

- Type: `JSON Object`

Data to send with the action

### target

- Type: `JSON Object with floor_id, area_id, device_id, entity_id, and label_id as array properties`

Targets of the action

## Output

Value types:

- `config`: config properties of the node
- `results`: response from Home Assistant
- `sent data`: data sent to Home Assistant

## References

<info-panel-only>

[External Docs](/node/action.md)

</info-panel-only>
