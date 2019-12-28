# API

## Config

### Protocol

- **Type**: `websocket|http`
- **Default**: `websocket`

Protocol to use to access Home Assistant API.

### Method

- **Type**: `get|post`

Type of method to use to access the HTTP endpoint.

### Path

- **Type**: `string`

URL of the API endpoint.

### Params

- **Type**: `JSON`

A JSON object with key/value pairs that will be converted into URL parameters.

### Data

- **Type**: `JSON`

JSON Object to send for WebSocket requests and HTTP posts.

### Results

- **Type**: `string`

  Location to save the API results.

## Input

All properties need to be under `msg.payload`.

### protocol

- **Type**: `websocket|http`

Overrides or sets the protocol property of the config.

### method

- **Type**: `get|post`

Overrides or sets the method property of the config.

### path

- **Type**: `string`

Overrides or sets the path property of the config.

### data

- **Type**: `JSON|string`

Overrides or sets the data/params property of the config.

### location

- **Type**: `string`

Overrides or sets the results property of the config.

### locationType

- **Type**: `msg|flow|global`

Overrides or sets the results type property of the config.

## Output

Will output the results received from the API call to the location defined in the config.

## Templates

Templates can be used in path, params and data fields. When using templates the
top level is a property of the message object: `msg.payload` would be <code v-pre>{{payload}}</code>. Templates will only work in the data field when the data type is
JSON.

**Also see:**

- [Mustache Templates](../guide/mustache-templates.md)

## References

- [http api](https://developers.home-assistant.io/docs/en/external_api_rest.html)
- [websocket api](https://developers.home-assistant.io/docs/en/external_api_websocket.html)
