# Nodes

## Call Service

Sends a request to home assistant for any domain and service available ( `light/turn_on`, `input_select/select_option`, etc..)

## Current State

Fetches the last known state for any entity on input

## Events: all

Listens for all types of events from home assistant with the ability to filter by event type

## Events: state

Listens for only `state_changed` events from home assistant

## Fire Event

Fire an event on the event bus

## Get Entities

Get entities based on search criteria with 3 different output options

## Get History

Fetches HomeAssistant history on input

## Get Template

Allows rendering of templates on input

## Poll State

Outputs the state of an entity at regular intervals, optionally also at startup
and every time the entity changes if desired

## Sensor

Creates a sensor or binary sensor in Home Assistant which can be updated
from this node

## Trigger: state

Much like the `State Changed Node` however provides some advanced functionality around common automation use cases.

## Wait Until

When an input is received the node will wait until the condition is met or the timeout occurs then will pass on the last received message

## Webhook

Outputs the data received from the created webhook in Home Assistant
