# Nodes

## [API](./API.md)

Access all points of the WebSocket and HTTP API.

## [Binary Sensor](./binary-sensor.md)

Creates a binary sensor entity in Home Assistant that is controlled from with Node-RED.

## [Button](./button.md)

Creates a button in Home Assistant that triggers a flow in Node-RED

## [Call Service](./call-service.md)

Sends a request to home assistant for any domain and service available ( `light/turn_on`, `input_select/select_option`, etc..)

## [Current State](./current-state.md)

Fetches the last known state for any entity on input

## [Device](./device.md)

Creates device automations and calls device actions

## [Device Config](./device-config.md)

Configuration node for devices added to Home Assistant

## [Entity](./entity.md)

Creates an entity in Home Assistant which can be manipulated from this node

## [Entity Config](./entity-config.md)

Configuration node for the different entity type nodes

## [Events: all](./events-all.md)

Listens for all types of events from home assistant with the ability to filter by event type

## [Events: state](events-state.md)

Listens for only `state_changed` events from home assistant

## [Fire Event](./fire-event.md)

Fire an event on the event bus

## [Get Entities](./get-entities.md)

Get entities based on search criteria with 3 different output options

## [Get History](./get-history.md)

Fetches HomeAssistant history on input

## [Poll State](./poll-state.md)

Outputs the state of an entity at regular intervals, optionally also at startup
and every time the entity changes if desired

## [Render Template](./render-template.md)

Allows rendering of templates on input

## [Sensor](./sensor.md)

Creates a sensor entity in Home Assistant that is controlled from with Node-RED.

## [Server Config](./config-server.md)

Home Assistant connection configuration

## [Switch](./swtich.md)

Creates a switch entity in Home Assistant that is controlled from with Node-RED. Also allows a flow to be started from a service call.

## [Tag](./tag.md)

Outputs when Home Assistant receives a tag scanned event for a configured tag id

## [Time](./time.md)

A node that can be scheduled to trigger at a future date and time from a Home Assistant entity

## [Trigger: state](./trigger-state.md)

Much like the `State Changed Node` however, provides some advanced functionality around common automation use cases

## [Update Config](./update-config.md)

Allows updating of entities configuration in Home Assistant

## [Wait Until](./wait-until.md)

When an input is received the node will wait until the condition is met or the timeout occurs then will pass on the last received message

## [Webhook](./webhook.md)

Outputs the data received from the created webhook in Home Assistant

## [Zone](./zone.md)

Outputs when one of the configured entities enter or leaves one of the defined zones
