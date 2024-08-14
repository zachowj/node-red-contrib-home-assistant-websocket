# Events: all

This node listens for all types of events from Home Assistant, with the ability to filter by event type. It’s a powerful tool for triggering automations based on specific events occurring within Home Assistant, such as state changes, sensor readings, or user interactions.

## Configuration

### Name

- Type: `string`

the name of the node

### Event Type

- Type: `string`

filter by event type or leave blank for all events

::: danger
Leaving this empty will listen for all events from Home Assistant which may
overload the WebSocket message queue.

[GitHub Issue #153](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/153#issuecomment-539290950)
:::

### Event data

- Type: `json`

A JSON object that will be compared to the event data. If this JSON is a subset of the event data object, the event will be emitted.

### Output only after Home Assistant is running

- Type: `boolean`

What until Home Assistant has reported its state as `running` before outputting events. Client events will always output.

### Expose as

- Type: `entity config`

Creates a switch within Home Assistant to enable/disable this node. This feature
requires [Node-RED custom integration](https://github.com/zachowj/hass-node-red)
to be installed in Home Assistant

## Outputs

Value types:

- `event data`: event received from Home Assistant
- `config`: config properties of the node

## Client Events

Use `home_assistant_client` as the event type to receive events from the
Websocket client.

Events sent from the client:

- **connecting** - when trying to connect to HA
- **connected** - after the authorization has been accepted
- **disconnected** - when the socket stops attempting to connect or disconnected after having been connected
- **error** - when a disconnect happens of the WebSocket with an error
- **states_loaded** - the first time all states are loaded from HA
- **services_loaded** - the first time all services are loaded from HA
- **running** - when HA is in a running state and states have been loaded
