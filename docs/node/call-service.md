# Call Service

Sends a request to home assistant for any domain and service available (`light/turn_on`, `input_select/select_option`, etc..)

::: tip Helpful Examples
[Call Service Tips and Tricks](/guide/call-service.html)
:::

## Configuration

### Domain <Badge text="required"/>

- Type: `string`
- Accepts [Mustache Templates](/guide/mustache-templates.md)

Service domain to call

### Service <Badge text="required"/>

- Type: `string`
- Accepts [Mustache Templates](/guide/mustache-templates.md)

Service service to call

### Entity Id

- Type: `string`
- Accepts [Mustache Templates](/guide/mustache-templates.md)

A comma-delimited list of entity ids.

::: tip NOTICE
If `entity_id` exists in the data property it will have precedence over this value.
:::

### Data

- Type: `JSONata | JSON`
- Accepts [Mustache Templates](/guide/mustache-templates.md) when data type is JSON

JSON object to pass along.

### Merge Context

- Type: `string`

If defined will attempt to merge the global and flow context variable into the config

### Alternative Template Tags

- Type: `boolean`

Will change the tags used for mustache template to `<%` and `%>`

### Queue

- Type: `none | first | all | last`

Will store the first, last or all messages received while disconnected from Home Assistant and send them once connected again

## Input

All properties need to be under `msg.payload`.

#### Merging

If the incoming message has a `payload` property with `domain`, `service` set it will override any config values if set.

If the incoming message has a `payload.data` that is an object or parsable into an object these properties will be <strong>merged</strong> with any config values set.

If the node has a property value in its config for `Merge Context` then the `flow` and `global` contexts will be checked for this property which should be an object that will also be merged into the data payload.

#### Merge Resolution

As seen above the `data` property has a lot going on in the way of data merging, in the end, all of these are optional and the rightmost will win if a property exists in multiple objects

Config Data, Global Data, Flow Data, Payload Data ( payload data property always
wins if provided

### domain

- Type: `string`

Service domain to call

### service

- Type: `string`

Service service to call

### data

- Type: `Object`

Service data to send with API call

## Output

Value types:

- `sent data`: data sent to Home Assistant
- `config`: config properties of the node
