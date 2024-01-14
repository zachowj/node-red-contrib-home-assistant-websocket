# JSONata Examples 1 - Call Service

Integrations in Home Assistant provide service calls that can be used, for example, to set target temperature on heaters and air-conditioning units. All service calls can be found and tested within Home Assistant Developer toolbox, and it is also useful to check the integration documentation to identify exactly what is required for a successful service call.

**All service calls require:**

- a domain (integration platform) such as 'climate'
- a service call within this domain, such as 'set_temperature'
- a target entity or entities (or area or device containing entities) to apply the service to
- a data _object_, containing any additional required and optional parameters

The data object will vary, depending on the integration and service call, from an empty object `{}` to something much more complex. Constructing this data object is key to a successful service call, and JSONata should ideally be used to achieve this rather than mustache templating.

**JSONata and the Service Call node:**

For all Node-RED flows with a Service Call node, there are three locations where the data object can be defined.

- directly in the Service Call node UI field 'Data', using the JSONata option
- in a preceeding Change Node, passing the Service Call settings in a msg.payload object
- in flow trigger nodes, such as Event: State nodes, as an output msg.payload object

There are advantages and drawbacks to each approach.

![screenshot](./images/jsonata_1_1.png)

Here are three examples, each using JSONata to set the required data object, and one example of using JSONata to process service call return data.

@[code](@examples/cookbook/jsonata-new/service-call.json)

## Setting the Data field

### Increase lights brightness with remote

A remote with a button that when clicked increases the brightness of a given light by an amount that is set from an input_number inside Home Assistant.

JSONata expression in the Call Service node UI Data field - note that nothing special is required as input to this node.

```json
{
  "brightness": $min([
    $entities("light.kitchen").attributes.brightness +
      $number($entities("input_number.brightness").state),
    255
  ])
}
```

### Setting target temperature on air-conditioning unit

Here a Change Node is used to build a larger msg.payload object. In a Change Node, the special `$entity()` and `$entities()` functions are _not_ available, however we can still do things like read from global context using the Node-RED `$globalContext()` function.

```json
{
   "target": {"entity_id": $globalContext("AClist")},
   "data": {
       "temperature": payload,
       "hvac_mode": payload>20 ? "heat" : "cool"
   }
}
```

The Call Service node can accept parameters in msg.payload, and where given these take precedence over any UI settings. Default settings can therefore be set in the UI, and then be over-riden by the input message, including from Inject Nodes as shown in the example.

### Notification of lights left on when leaving home

Get notified when lights or switches are left on when you leave. This example uses JSONata in two places in the Event: State node. The state value test is a JSONata expression that should return true to output a message. This code selects an array of all entity states for entities starting with 'person', and will return `true` if this contains any with state "home". Since we are looking for a state change where all person entities are _not_ home, we can use the lower (failure) output.

```json
"home" in $entities().*[$substringBefore(entity_id,".")="person"].state
```


JSONata is then used in the output properties, to create the required object for a notification service call. It uses `$entities().*` with a filter looking for those with "light" or "switch" in the entity_id and state "on", then selecting the friendly_name, and joining into a list in the message.

The title uses `$entity().attributes.friendly_name` to add the name of the person who just left home to the message title.

```json
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

In this example all the work is performed in the Event: State node, and the Service Call node accepts setting parameters in the input msg.payload object.

## Processing a service call return

Home Assistant service calls can now provide data as a result of the call, and JSONata is an ideal tool to manage complex JSON object and array structures. This example uses JSONata to extract and manipulate weather forecasts, providing a summary in a different format.

```json
results.*.forecast{
   "time": $[0].datetime,
   "temp": $.temperature,
   "cloud": $.cloud_coverage,
   "rain": $.precipitation
}
```
The forecast service call now returns an array of forecasts. Here JSONata is used to itterate over all forecast, returning an new object for each, with a time and arrays for tempeature, cloud coverage, and precipitation only.

**Also see:**

- [JSONata guide](../guide/jsonata.md)
