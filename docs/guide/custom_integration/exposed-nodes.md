# Exposed Nodes

## Available to all event nodes

[Events: all](../../node/events-all.md), [events:
state](../../node/events-state.md), [trigger:
state](../../node/trigger-state.md), and [poll state](../../node/poll-state.md) nodes
will have the option to be exposed to Home Assistant, and when enabled, it will
show up in Home Assistant as a switch. Turning on and off these switches will
disable/enable the nodes in Node-RED. This should help people who find
themselves having to make input_booleans in HA to enable/disable flows.

## Trigger an exposed event node from a service call `nodered.trigger`

Event nodes that are triggered by a service call will have their status color
blue when `skip_condition` is `true` and when `false` it will stay green with
the text _(triggered)_ appended after the state in the status text.

Data properties of the service call:

**entity_id**

The only data property of the service call that is required is an `entity_id` of
the switch that is associated with a node in NR.

**trigger_entity_id**

Will be the entity that triggers the node. It is optional and only required if
the node entity filter is not set to `exact`.

**skip_condition**

It can be used when you don't want the conditionals of the node to be check and
just have it pass the entity through. Defaults to `false`

For the trigger: state node custom output will not be evaluated.

**output_path**

When `skip_condition` is `true` this allows you to choose which output to send
the message through. Defaults to `true` the top output
