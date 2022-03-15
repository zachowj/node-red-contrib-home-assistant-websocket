# Check if an entity was a certain state in the last 24 hours

Use the `get-history` to get a list of state changes for the last 24 hours. Filter them using a `switch` node looking for a given state and then count the remaining to see if the entity was in that state during the time frame.

![screenshot](./images/check-if-an-entity-was-turned-on-in-the-last-24-hours_01.png)

@[code](@examples/cookbook/check-if-an-entity-was-turned-on-in-the-last-24-hours/example_01.json)

Here's the same example but using a `function` node.

![screenshot](./images/check-if-an-entity-was-turned-on-in-the-last-24-hours_02.png)

@[code](@examples/cookbook/check-if-an-entity-was-turned-on-in-the-last-24-hours/example_02.json)
