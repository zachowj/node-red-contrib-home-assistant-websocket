# Exposed Nodes

## Available to all event nodes

[Events: all](../../node/events-all.md), [events:
state](../../node/events-state.md), [trigger:
state](../../node/trigger-state.md), and [poll state](../../node/poll-state.md) nodes
will have the option to be exposed to Home Assistant, and when enabled, it will
show up in Home Assistant as a switch. Turning on and off these switches will
disable/enable the nodes in Node-RED. This should help people who find
themselves having to make input_booleans in HA to enable/disable flows. This is a much cleaner way to do it.

## Trigger an exposed event node from a service call `nodered.trigger`

Exposed nodes can be triggered from a service call. The service call is
`nodered.trigger` and it takes the following data properties:

### entity_id

- Required

The entity_id of the exposed node to trigger. This is the entity_id of the node in Home Assistant. For example, if the entity_id of the node in Home Assistant is `switch.my_node`, then the entity_id to use in the service call is `switch.my_node`.

### output_path

- Optional
- Defaults to 0
- Can be a comma separated list of output paths

The output path of the node to send the message through. When this value is set to 0, the message will be sent through all output paths. If this value is set to 1, the message will be sent through the first output path. When this value is set to 2, the message will be sent through the second output path, and so on.

### message

- Required

The message the triggered node will output. This can be any valid JSON object. For example, if the message is `{ "payload": "hello world" }`, then the message will be sent to the node as `msg.payload` with the value of `hello world`.
