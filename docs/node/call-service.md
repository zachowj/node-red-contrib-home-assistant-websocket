# Call Service

Sends a request to home assistant for any domain and service available (`light/turn_on`, `input_select/select_option`, etc..)

## Config

### Domain

- **Type:** string
- **Required**
- Accepts [Mustache Templates](/guide/mustache-templates.md)

Service domain to call

### Service

- **Type:** string
- **Required**
- Accepts [Mustache Templates](/guide/mustache-templates.md)

Service service to call

### Entity Id

- **Type:** string
- Accepts [Mustache Templates](/guide/mustache-templates.md)

A comma delimited list of entity ids

### Data

- **Type:** JSON
- Accepts [Mustache Templates](/guide/mustache-templates.md) when data type is JSON

JSON object to pass along.

### Merge Context

- **Type:** string

If defined will attempt to merge the global and flow context variable into the config

### Alternative template tags

- **Type:** boolean

Will change the tags used for mustache template to `<%` and `%>`

## Input

All properties need to be under `msg.payload`.

### domain

- **Type:** string

Service domain to call

### service

- **Type:** string

Service service to call

### data

- **Type:** object

Service data to send with api call

## Output

All properties will be under `msg.payload`.

### domain

- **Type:** string

Service `domain` service was called with

### service

- **Type:** string

Service `service` was called with

### data

- **Type:** object

Service `data` used in call, if one was used

#### Example of `msg.payload`:

```json
{
  "domain": "light",
  "service": "turn_on",
  "data": {
    "entity_id": "light.kitchen"
  }
}
```

**Also see:**

- [Mustache Templates](../guide/mustache-templates.md)

## Details

If the incoming message has a `payload` property with `domain`, `service` set it will override any config values if set.

If the incoming message has a `payload.data` that is an object or parsable into an object these properties will be <strong>merged</strong> with any config values set.

If the node has a property value in it's config for `Merge Context` then the `flow` and `global` contexts will be checked for this property which should be an object that will also be merged into the data payload.

#### Merge Resolution

As seen above the `data` property has a lot going on in the way of data merging, in the end all of these are optional and the right most will win in the event that a property exists in multiple objects

Config Data, Global Data, Flow Data, Payload Data ( payload data property always wins if provided )

## Changelog

### Version 1

- Entity ids are no longer merged with the data property on the front end
- The data field does not have to be valid JSON until after templates are rendered. This change will allow you to assign numbers to properties as an actual number and not a string using templates.
- `entity_id`  in the data property will supersede the entity id field
- Flows exported from version 0.14.0 will lose the entity id when imported into
  a previous version
