# Other functions

Several additional **JSONata functions** are provided for use within the WebSocket nodes. JSONata expressions are first 'prepared' then 'executed', and the preparation first stage is used to bind the expression to extra Node-RED or other functions. This means that these WebSocket functions can _only_ be used within a WebSocket node.

![screenshot](./images/jsonata_8_1.png)

This example demonstrates the basic use of some of these functions.

@[code](@examples/cookbook/jsonata-examples/ws-functions.json)

### Reading entity state and entity attributes with _$entity()_ and _$prevEntity()_

In nodes with _output properties_, a number of properties are typically set by default, or can be optionally set as:

- msg.payload = '_entity state_'
- msg.data = '_entity_'
- msg.event = '_event data_'
- msg.topic = '_entity id_'

This provides useful message values in the flow _following_ the node, however these values can be obtained _within_ the node itself using the appropriate functions.

The function `$entity()` returns an object containing the entity details, relating to the entity that is the subject of the node. This means that the output property selection options are equivalent to JSONata expressions:

- '_entity_' ~ $entity()
- '_entity state_' ~ $entity().state
- '_entity id_' ~ $entity().entity_id

For the **Events:** nodes (_Events: all_ and _Events: state_) the node triggers from an entity-change event, with _$entity()_ returning the current (new) entity details, and the function `$prevEntity()` returning the previous (old) entity details.

```
{"old": $prevEntity(), "new": $entity()}
```

**The first example** uses an _Events: state_ node, with a basic `sensor.time` entity to facilitate triggering the node every minute. The [Time & Date Integration](https://www.home-assistant.io/integrations/time_date/) should be added to the configuration file, and then the given time sensor will return the current local time. The entity state (as time) is "hh:mm" and therefore changes every 60 seconds.

The output _msg.payload_ is set to a new JSONata expression, which creates a new object with the old and new entity details, just as the output property 'event data' would do, but permitting a more detailed JSONata expression to be executed if required.

### Using _$entities()_ to return one or all entities

**The next two examples** explore ways to obtain specific entities, and this code looks for all Home Assistant entities that have an attribute field called 'array'.

```
$entity().attributes.array!=[]
```

In the first flow, a _Get Entities_ node is used, with a JSONata expression used to filter the result, based on each entity having an attribute field called 'array' that is a non-empty JSON array. This will return the entire entity, and therefore the output will be an array of entities that have an 'attribute.array' field.

```
$entities().*.attributes[$exists(array)]
```

In the second flow, a _Current State_ node is used, with a valid subject entity. The return from the given entity itself is not required - the node is just being used as a vehicle in which to execute the _$entities()_ function. When specifying a _named_ entity such as `$entities('sun.next_dawn')` only that entity will be returned, otherwise an array of all entities in Home Assistant will be returned. This JSONata expression then matches all entities in the array, filtering out attributes fields where the object key 'array' exists.

In contrast to the preceding flow, this will return just an array of the entity attributes. The JSONata code in this case can also be executed as and when required.

**Note:** Where a number of entity state values or attributes are required at one point in a flow for collective processing, using JSONata in a Current State node can be highly effective. The alternatives are:

- Several Current State nodes chained in sequence, with each writing the state or entity data to a different msg.field.
- One Current State node executing a JSONata expression, collating various $entity() or $entities('sensor.name') functions to either place values into one object, or to perform the necessary computation at that point. Output from JSONata can be either a simple primitive, or an object with several fields.

### Using _$areas()_, _$areaDevices_ and _$areaEntities()_

Finally, a more complex JSONata expression that returns details about areas, devices, and entities.

```
$areas()^(name).{
    name: " Devices: " & $count($areaDevices(area_id)) & " Entities: " & $count($areaEntities(area_id))
    } ~> $merge()
```

The JSONata above is just one long expression line (unnecessary new lines have been added just to make the expression easier to read). Evaluated left to right, it starts with the `$areas()` function:

- Without a given area lookup value, this function returns an array of all areas in Home Assistant
  - which is then sorted alphabetically, by name
- The result is an array, which is mapped (iterated over)
- applying an {} object constructor for each array item
  - the object creates one key: value pair
  - the key is the area 'name' (this is a string)
  - the value is a constructed text string
- The function $areaDevices(area_id) returns all devices in each area
  - using 'area_id' for the item area, and returning an array of devices
  - using $count() to count the number of devices in the returned array
- The function $areaEntities(area_id) returns all entities in that area
  - returning an array, which is similarly counted
- The resulting array of objects is then merged into one single object

**Also see:**

- [JSONata guide](../guide/jsonata.md)
- [JSONata primer](../guide/jsonata-primer.md)
