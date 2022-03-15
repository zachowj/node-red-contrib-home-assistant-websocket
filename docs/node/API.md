---
sidebarDepth: 1
---

# API

## Config

### Protocol <Badge text="required"/>

- Type: `string`
- Values: `websocket|http`
- Default: `websocket`

Protocol to use to access Home Assistant API.

### Method

- Type: `string`
- Values: `get|post`

Type of method to use to access the HTTP endpoint.

### Path

- Type: `string`
- Accepts [Mustache Templates](/guide/mustache-templates.md)

URL of the API endpoint.

### Params

- Type: `Object`
- Accepts [Mustache Templates](/guide/mustache-templates.md)

A JSON object with key/value pairs that will be converted into URL parameters.

### Data

- Type: `Object`
- Accepts [Mustache Templates](/guide/mustache-templates.md) when the data type
  is JSON

JSON Object to send for WebSocket requests and HTTP posts.

### Results

- Type: `string`

  Location to save the API results.

## Input

All properties need to be under `msg.payload`.

### protocol

- Type: `string`
- Values: `websocket|http`

Overrides or sets the protocol property of the config.

### method

- Type: `string`
- Values: `get|post`

Overrides or sets the method property of the config.

### path

- Type: `string`

Overrides or sets the path property of the config.

### data

- Type: `Object|string`

Overrides or sets the data/params property of the config.

### location

- Type: `string`

Overrides or sets the results property of the config.

### locationType

- Type: `string`
- Values: `msg|flow|global`

Overrides or sets the results type property of the config.

## Output

Value types:

- `results`: results of the API request
- `config`: config properties of the node

## References

- [http api](https://developers.home-assistant.io/docs/api/rest)
- [websocket api](https://developers.home-assistant.io/docs/api/websocket)
