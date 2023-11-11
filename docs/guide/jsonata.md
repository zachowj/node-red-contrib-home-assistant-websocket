# JSONata

There are three functions added for JSONata expressions within the Home Assistant nodes.

- `$entity()` returns the entity that triggered the node
- `$prevEntity()` returns the previous state entity if the node is an event node
- `$areaDevices(areaId)` returns all devices associated with a specific area ID.
- `$areaEntities(areaId)` returns all entities associated with a specific area ID.
- `$area(lookup)` returns an area based on a provided lookup value, or all areas if no lookup value is provided. The lookup value can be an area ID, an entity ID, or a device ID.
- `$deviceEntities(device_id)` returns all entities associated with a specific device.
- `$device(device_id)` returns a device based on a provided lookup value. The lookup value can be an entity ID or a device name.
- `$entities()` returns all entities in the cache
- `$entities(entity_id)` returns a single entity from cache matching passed in entity_id

Expose [Lodash](https://lodash.com/) functions

- `$sampleSize(collection, [n=1])` [https://lodash.com/docs/#sampleSize](https://lodash.com/docs/#sampleSize)

  Gets n random elements at unique keys from collection up to the size of collection.

- `$randomNumber([lower=0], [upper=1], [floating])` [https://lodash.com/docs/#random](https://lodash.com/docs/#random)

  Produces a random number between the inclusive lower and upper bounds. If only one argument is provided a number between 0 and the given number is returned. If floating is true, or either lower or upper are floats, a floating-point number is returned instead of an integer.

When JSONata appears in the conditional dropdown it expects the expression to return a boolean, true or false.

![screenshot](./images/jsonata_1.png)

When it is chosen with a conditional, not JSONata it will return a value of the evaluated expression that will be checked against the conditional chosen.

![screenshot](./images/jsonata_2.png)

- [Increase lights brightness with remote](../cookbook/jsonata.html#increase-lights-brightness-with-remote)
- [Notification of lights left on when leaving home](../cookbook/jsonata.html#notification-of-lights-left-on-when-leaving-home)
- [OR conditional for the events: state node](../cookbook/jsonata.html#or-conditional-for-the-events-state-node)

**Also see:**

- [https://docs.jsonata.org](https://docs.jsonata.org)
- [http://try.jsonata.org](http://try.jsonata.org)
