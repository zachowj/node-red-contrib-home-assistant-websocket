# Events: all

Listens for all types of events from Home Assistant with the ability to filter
by event type.

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

### Output only after Home Assistant is running

- Type: `boolean`

What until Home Assistant has reported its state as `running` before outputing events. Client events will always output.

### Expose to Home Assistant

- Type: `boolean`

Creates a switch within Home Assistant to enable/disable this node. This feature
requires [Node-RED custom integration](https://github.com/zachowj/hass-node-red)
to be installed in Home Assistant

## Outputs

### topic

- Type: `string`

Will contain the event type.

### event_type

- Type: `string`

Event type of the event.

### payload

- Type: `object`

original event object

### origin

- Type: `string`

### time_fired

- Type: `DateTime`

### context

- Type: `object`

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
