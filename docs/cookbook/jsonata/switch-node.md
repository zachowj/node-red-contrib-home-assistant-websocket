# Switch node

The _Switch_ node and the _Change_ node are standard Node-RED nodes that provide conditional routing (selection) and data manipulation respectively for flow messages. Many of the WebSocket nodes, when using JSONata, can provide some output property data manipulation, and a few nodes also offer simple binary output message routing. However, much more can be achieved using JSONata in Switch and Change nodes in combination with the WebSocket nodes.

![screenshot](./images/jsonata_6_1.png)

This example shows how to use JSONata within the standard Switch node.

@[code](@examples/cookbook/jsonata-examples/switch-node.json)

### Using JSONata in _switch routing_

A Poll State node has been set up to return the entity state of a light switch every 10 seconds. This will return the entity state ("on" or "off") as the _msg.payload_ value. It will also return the fuller entity state details in _msg.data_, which includes the _'timeSinceChangedMs'_ field.

**JSONata for the routing _property_**

```
$round(data.timeSinceChangedMs/60000,0)
```

The routing rules will test against the given _property_. By default this would be the value held in msg.payload. Using a JSONata expression here allows for a computation on the time since changed field to convert this to minutes. Rounding is also being used, so 31 to 89 seconds would become 1 minute.

**Note** that the JSONata expression has access to the full incoming message. The value required was output from the Poll State node within the output property _msg.data_ field, and this has to be used here since the `$entity()` functions are not available outside of the WebSocket nodes.

![screenshot](./images/jsonata_6_2.png)

**JSONata for the _rule value_**

1. In the first rule, the rule values to test against are given as literals.

2. In the second rule, the rule test value is provided by a JSONata expression. This will return either 4, if the light state is "on", or 1 if the light state is "off".

```
data.state="on" ? 4 : 1
```

**Note** that 'payload' contains the state value and could have been used rather than 'data.state'. Where the output of a WebSocket node is used later in the flow for routing or processing, care should be taken to generate the most appropriate output. For example, rather than generate the Property match value here, this JSONata expression could be used in the Poll State node to provide minutes since last changed in the output msg.payload directly.

**JSONata expression for the routing _match_**

3. In the third rule, the evaluation Property is not used. The test condition is the Boolean result of a JSONata expression. The routing path is taken only if the JSONata expression evaluates as `true`.

```
data.timeSinceChangedMs < 60000
```

The example is simplistic, however it shows that any incoming message property can be used within the expression.

**Note** that, since the `$entities()` function is not available in a Switch node, to obtain other entity values, JSONata can be used in the preceding Poll State node to generate an output property, for example by setting _msg.time_ to `$entities('sensor.time').state` to provide 'time' as an available value for use in the Switch node.

4. For completeness in these notes, a last rule of 'Otherwise' has been included, and the matching rules set to 'checking all rules'. This will mean that more than one of the first three rules may match at the same time, but that the last route is only taken when no other rule matches.

**JSONata expression in the _Debug_ node**

The Debug nodes also contain JSONata as a further demonstration of how versatile and applicable this language can be.

**Also see:**

- [JSONata guide](../guide/jsonata.md)
- [JSONata primer](../guide/jsonata-primer.md)
