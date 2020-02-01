# Get Entities Examples

Here are three examples of how one might use the new `get entities` node.

## Example 1

You have a presence detection of some sort running in Home Assistant and you want to get a notification when you leave if any doors or windows are left open.

Using the `get entities` node here to get a possible list of entity ids [binary_sensor.front_door, binary_sensor.back_door, binary_sensor.front_window, binary_sensor.back_window] if their state is equal to `open`. The entities are returned with the output `Split`. This means that a message is sent for each valid entity. We then are using a template node to format the payload into the entity friendly name and joining them back into one payload using the `join` node.

![screenshot](./images/get-entities_03.png)

<<< @/examples/cookbook/get-entities/example_01.json

## Example 2

Sort of a Vacation or Away script to randomly turn on some lights around your home.

Using an `inject` node here but you could use your preference of timer node. The `get entities` node is randomly choosing one entity from the criteria where `entity_id starts with light.`.

![screenshot](./images/get-entities_02.png)

<<< @/examples/cookbook/get-entities/example_02.json

---

## Example 3

On Reddit the other day a user posted this [How can I join 1 to 4 pre-defined messages together based on 4 separate entity states?](https://www.reddit.com/r/homeassistant/comments/a628cw/nodered_how_can_i_join_1_to_4_predefined_messages/) (Their solution can be found in the post)

Here's my take on it using the `get entities` and a `function` node. Using the `Array` output option here.

![screenshot](./images/get-entities_01.png)

<<< @/examples/cookbook/get-entities/example_03.json

Disclaimer: All these examples are untested but should give you a general idea of how to use it.

**Also see:**

- [Get Entities Node](../node/get-entities.md)
