# JSONata Example 1 - Call Service

Integrations in Home Assistant provide _service calls_ that can be used, for example, to set target temperature on heaters and air-conditioning units. All service calls can be found and tested within Home Assistant Developer toolbox, and it is also useful to check the integration documentation to identify exactly what is required for a successful service call.

**All service calls require:**

- a domain (integration platform) such as 'climate'
- a service call within this domain, such as 'set_temperature'
- a target entity or entities (or area or device containing entities) to apply the service to
- a JSON _data object_, containing any additional required and optional parameters

The _data object_ will vary, depending on the integration and service call, from an empty object `{}` to something much more complex. Constructing this data object correctly is key to a successful service call, and **JSONata** rather than mustache templating should ideally be used to achieve this.

**Note:** The data field used in a service call must be a valid JSON object.

- Mustache templates are delimited with '{{msg.payload}}'. Although acceptable in most JSON input fields, this is _invalid syntax_ in JSONata expressions and must not be used.
- Home Assistant configuration uses YAML constructs, containing space-tabulation for objects and '-' for arrays. This format is incompatible with both JSON and JSONata, but YAML constructs can be converted to JSON.
- The WebSocket nodes Data UI field option typically offers two input methods:
    - `{}` for JSON - this _must_ be strict JSON formed with all literals and string keys. Mustache templates _may_ work successfully in _simple strings_. **JSONata will not work here**. The JSON option cannot accept anything other than literals and Mustache templates.
    - `J:` for JSONata (expression) - this must _evaluate_ to strict JSON, but can be formed with expressions in both the object keys (evaluating as strings) and the object values. In JSONata, literals evaluate as themselves, so the JSONata option can accept a JSON literal construct.

## Passing variables to WebSocket nodes _in summary_

**JSONata** in Node-RED nodes accesses the incoming message as a JSON object. Thus _msg.payload_ is referenced just as `payload` and is evaluated as the value of that key. The leading 'msg.' is not required, and '{{ payload }}' is invalid JSONata syntax.

Node-RED typically uses _msg.payload_ to pass values between nodes, however any field can be used. Most WebSocket nodes have _output properties_ that default to set _msg.data_ to the entity details, and therefore in the flow _following_ (not in) the node, `data.state` will typically provide the state value of the entity that was the subject of the _preceding_ WebSocket node.

Within the WebSocket node itself, the entity data is accessed using the special JSONata _$entity()_ function, hence `$entity().state` would be used. In a similar manner, the _$entities()_ function can reference any Home Assistant entity, and `$entities('sensor.date_time').state` would return the state value of the given date_time sensor.

In JSONata, as well as using message fields or the entity functions, Node-RED provides functions to access environment variables using `$env('ENV_NAME')`. Global context can be read using `$globalContext(name[, store])` and flow context likewise as `$flowContext(name[, store])`.

## JSONata and the _Call Service_ node

For Node-RED flows with a _Call Service_ node there are three locations where the _Data object_ can be defined.

- Directly in the _Call Service_ node UI 'Data' field, using the JSONata option.
- In a preceding _Change_ node, passing the Service Call settings in a _msg.payload_ object.
- In a flow trigger node, such as _Events: state_ node, generated as an output _msg.payload_ object.

There are advantages and drawbacks to each approach, and personal choice as well as the particular case and need will influence your flow design.

![screenshot](./images/jsonata_1_1.png)

Here are three examples, each using JSONata to set the required Data object, and one example of using JSONata to process service call return data.

@[code](@examples/cookbook/jsonata-examples/service-call.json)


## Setting the _Data_ field

### Increase lights brightness with remote

**Example:** A remote with a button that when clicked increases the brightness of a given light by an amount that is set from an input_number inside Home Assistant.

JSONata expression in the _Call Service_ node UI Data field. Nothing special is required as input to this node as all the settings are completed within the node itself.

```
{
  "brightness": $min([
    $entities("light.kitchen").attributes.brightness +
      $number($entities("input_number.brightness").state),
    255
  ])
}
```

### Setting target temperature on air-conditioning unit

**Example:** Set the target temperature (and mode) for air-conditioning unit from the input msg.payload value.

Here a _Change_ node is used to build the msg.payload object required to set the Call Service node parameters, including the nested data field. In a Change node, the special WebSocket `$entity()` and `$entities()` functions are _not_ available, however we can still perform a read from global context using the Node-RED `$globalContext()` function. These Node-RED functions can be used to bring in values from context and environment variables.

```
{
   "target": {"entity_id": $globalContext("AClist")},
   "data": {
       "temperature": payload,
       "hvac_mode": payload>20 ? "heat" : "cool"
   }
}
```

The _Call Service_ node can accept from one to all of the UI parameters in msg.payload, and where given these each take precedence over any UI settings. Default settings can therefore be set in the UI, and can then be over-riden by the input message, including when using settings from _Inject_ nodes as shown in the example.

### Notification of lights left on when leaving home

**Example:** Get notified when lights or switches are left on when you leave.

This example uses JSONata in two places in the _Events: state_ node. The state value test is a JSONata expression that must return true for the node to output a message (upper output). This code selects an array of all entity states for entities starting with 'person', and will return `true` if this array contains one or more with state "home". The expression will therefore only return `false` when no-one is home, and we can use the lower (condition fail) output rather than using the JSONata $not() function to look for '_not_ home'.

```
"home" in $entities().*[$substringBefore(entity_id,".")="person"].state
```


JSONata is also then used in the output properties to create the required object for a notification service call. It uses `$entities().*` with a filter looking for those with "light" or "switch" in the entity_id and state "on", then selecting the friendly_name, and joining all those found into a string list in the message.

The message title uses `$entity().attributes.friendly_name` to add the name of the person who just left home to the message title.

```
{
    "data": {
        "message": "The " & 
          $join($entities().*[state = "on" and entity_id ~>
          /^light|^switch/].attributes.friendly_name, ", ") &
          " are on.",
        "title": "Things Left On " & $entity().attributes.friendly_name
    }
}
```

In this example all the parameter setup is performed in the _Events: state_ node, so the _Call Service_ node can accept all the required parameters just from the input msg.payload object.

## Processing a service call _return_

Home Assistant service calls can provide data returned as a result of the call, and JSONata is an ideal tool to manage any resulting JSON object and array structures. This example uses JSONata to extract and manipulate weather forecasts, providing a summary in a modified format.

**Example:** The forecast service call now returns an array of forecasts. JSONata is used to iterate over all forecasts, returning an new object for each, with a time and arrays for temperature, cloud coverage, and precipitation only.

```
results.*.forecast{
   "time": $[0].datetime,
   "temp": $.temperature,
   "cloud": $.cloud_coverage,
   "rain": $.precipitation
}
```

**Also see:**

- [JSONata guide](../guide/jsonata.md)
- [JSONata primer](../guide/jsonata-primer.md)
