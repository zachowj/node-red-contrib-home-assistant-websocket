# Nodes

## [API](./API.md)

Access all points of the WebSocket and HTTP API.

## [Call Service](./call-service.md)

Sends a request to home assistant for any domain and service available ( `light/turn_on`, `input_select/select_option`, etc..)

## [Current State](./current-state.md)

Fetches the last known state for any entity on input

## [Events: all](./events-all.md)

Listens for all types of events from home assistant with the ability to filter by event type

## [Events: state](event-state.md)

Listens for only `state_changed` events from home assistant

## [Fire Event](./fire-event.md)

Fire an event on the event bus

## [Get Entities](./get-entities.md)

Get entities based on search criteria with 3 different output options

## [Get History](./get-history.md)

Fetches HomeAssistant history on input

## [Get Template](./get-template.md)

Allows rendering of templates on input

## [Poll State](./poll-state.md)

Outputs the state of an entity at regular intervals, optionally also at startup
and every time the entity changes if desired

## [Sensor](./sensor.md)

Creates a sensor or binary sensor in Home Assistant which can be updated
from this node

## [Server Config](./config-server.md)

Home Assistant connection configuration

## [Trigger: state](./trigger-state.md)

Much like the `State Changed Node` however, provides some advanced functionality around common automation use cases.

## [Wait Until](./wait-until.md)

When an input is received the node will wait until the condition is met or the timeout occurs then will pass on the last received message

## [Webhook](./webhook.md)

Outputs the data received from the created webhook in Home Assistant
