# JSONata

JSONata is a _functional declarative_ language, designed to work with JSON objects. It is built-in within Node-RED and is available in standard nodes where you see the **J: expression** option, for example in the _Inject Node_.

- JSONata code is written as a _line expression_, which is evaluated and returns the result.
- The expression is evaluated against a JSON object. In Node-RED this JSON is the top level message object. There is no need to use a leading 'msg.' therefore just  `payload` will evaluate as the message payload _value_, and `topic` as the topic _value_.

::: warning
JSONata is very different to Mustache templates, and the use of {{msg.payload}} will not work as you might expect.
:::

In the **Home Assistant nodes**, JSONata can be used to set entity states, set output property values, generate UI parameters, or as conditional tests (both generating the test value, and as an evaluated predicate expression).

| HA Nodes           | Set output property | Set state value | Construct data field | Conditional test value | Conditional Boolean | UI setting parameter | Example set (Xe) |
|--------------------|:-------------------:|:---------------:|:--------------------:|:----------------------:|:-------------------:|:--------------------:|:-------:|
| API                | X                   |                 | X                    |                        |                     |                      |         |
| Call service       | X                   |                 | Xe                   |                        |                     |                      | 1       |
| Current state      | Xe                  |                 |                      | Xe                     | Xe                  | Xe                   | 2       |
| Events: all        | X                   |                 |                      |                        |                     |                      |         |
| Events: state      | Xe                  |                 |                      | Xe                     | Xe                 | X                    | 3       |
| Fire event         |                     |                 | X                    |                        |                     |                      |         |
| Get entities       |                     |                 |                      | X                      | X                   |                      |         |
| Poll state         | X                   |                 |                      | X                      | X                   | X                    |         |
| Tag                | X                   |                 |                      |                        |                     |                      |         |
| Time               | X                   |                 |                      |                        |                     | X                    |         |
| Trigger: state     | Xe                  |                 |                      | Xe                     |                     |  X                    | 4       |
| Wait until         | X                   |                 |                      | X                      | X                   | X                    |         |
| Webhook            | X                   |                 |                      |                        |                     |                      |         |
| **Entity Nodes**   |                     |                 |                      |                        |                     |                      |         |
| Binary sensor      | X                   | X               |                      |                        |                     |                      |         |
| Button             | X                   |                 |                      |                        |                     |                      |         |
| Sensor             | X                   | Xe              |                      |                        |                     |                      | 5       |
| Update config      | X                   |                 |                      |                        |                     |                      |         |
| **Standard Nodes** |                     |                 |                      |                        |                     |                      |         |
| Inject             | X                   |                 |                      |                        |                     |                      |         |
| Switch             |                     |                 |                      | Xe                     | Xe                  | Xe                   | 6       |
| Change             | Xe                  |                 |                      |                        |                     |                      | 7       |

**Examples of using JSONata in the Home Assistant Nodes:**

1. [Call a service using JSONata to build the data object](../cookbook/jsonata-1-call-service.md)
    - Increase light brightness with remote
    - Set A/C target temperature and hvac mode
    - Send 'lights on' notification when leaving home
    - Extract weather forecast details from call return
2. [Read the current state or attribute value of an entity](../cookbook/jsonata-2-current-state.md)
    - Report difference between A/C current and target temperatures
    - Report if A/C been cooling for more than 2 hours before 17:00
    - Report if A/C unit is running outside of 'office hours'
3. [Listen for entity state or attribute changes](../cookbook/jsonata-3-events-state.md)
    - Motion detection start, and motion ending only before 08:30 and after 17:30
    - Switch just turned off, and has been on for less than three minutes
    - Motion detection only before dawn and after dusk, with dusk and dawn times output
4. [Trigger a flow from state change conditions](../cookbook/jsonata-4-trigger-state.md)
    - Every minute before and after sunset
    - Automation events just before, at, and just after sunset
    - Adjust light brightness from 0 to 100 percent over sunset
5. [Write state and attribute values to an HA sensor](../cookbook/jsonata-5-sensor.md)
    - Provide a sensor with a count of the number of lights that are on
    - Provide an attribute array (list) of the lights that are on
    - Since I last looked, list which lights have been turned on, or off
6. [Route flow (switch node) based on computed outcomes](../cookbook/jsonata-6-switch-node.md)
    - Select flow routing depending on state 'last changed ms' period in minutes
7. [Read state history and process the return JSON (change node)](../cookbook/jsonata-7-change-node.md)
    - Calculate when, and for how long, I have not been at home in the past week
8. [Using the additional $entity() functions in JSONata](../cookbook/jsonata-8-functions.md)
    - Reading node entity states and attributes
    - Reading all Home Assistant entities
    - Reading Areas, Devices, and their Entities

There are several _additional_ Home Assistant functions added for use in JSONata expressions, and these can only be used within the Home Assistant nodes.

- `$entity()` returns the entity that triggered the node
- `$prevEntity()` returns the previous state entity if the node is an event node

- `$areaDevices(areaId)` returns all devices associated with a specific area ID.
- `$areaEntities(areaId)` returns all entities associated with a specific area ID.
- `$areas(lookup)` returns an area based on a provided lookup value, or all areas if no lookup value is provided. The lookup value can be an area ID, an entity ID, or a device ID.
- `$deviceEntities(device_id)` returns all entities associated with a specific device.
- `$device(lookup)` returns a device based on a provided lookup value. The lookup value can be an entity ID or a device name.
- `$entities()` returns all entities in the cache
- `$entities(entity_id)` returns a single entity from cache matching the given entity_id

Expose [Lodash](https://lodash.com/) functions

- `$sampleSize(collection, [n=1])` [https://lodash.com/docs/#sampleSize](https://lodash.com/docs/#sampleSize)

  Gets n random elements at unique keys from collection up to the size of collection.

- `$randomNumber([lower=0], [upper=1], [floating])` [https://lodash.com/docs/#random](https://lodash.com/docs/#random)

  Produces a random number between the inclusive lower and upper bounds. If only one argument is provided a number between 0 and the given number is returned. If floating is true, or either lower or upper are floats, a floating-point number is returned instead of an integer.





**Also see:**

- [https://docs.jsonata.org](https://docs.jsonata.org)
- [http://try.jsonata.org](http://try.jsonata.org)

