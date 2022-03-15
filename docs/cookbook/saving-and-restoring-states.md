# Saving and Restoring States

## Using Home Assistant scene creation

Home Assistant added the ability to create scenes on the fly. This has reduced
the work needed to be done in Node-RED to be able to restore entities to a
previous state.

![screenshot](./images/saving-and-restoring-states_04.png)

@[code](@examples/cookbook/saving-and-restoring-states/example_01.json)

Here are several examples using the get-entities node to get the states of
several entities and then how to restore the entity states.

## Using the get entities node

![screenshot](./images/saving-and-restoring-states_01.png)

@[code](@examples/cookbook/saving-and-restoring-states/example_02.json)

![screenshot](./images/saving-and-restoring-states_02.png)

@[code](@examples/cookbook/saving-and-restoring-states/example_03.json)

![screenshot](./images/saving-and-restoring-states_03.png)

@[code](@examples/cookbook/saving-and-restoring-states/example_04.json)

As you can see in the above examples the `switch` and `light` domains are just saving and restoring the state, on/off. But what if some users wanted to also save and restore the brightness level or not. The `climate` domain is saving and restoring more than just the state.

**Also see:**

- [Scenes in Home Assistant docs](https://www.home-assistant.io/integrations/scene/#creating-scenes-on-the-fly)
- [get-entities node](../node/get-entities.md)
