# Using Date and Time entities to trigger flows

## Home Assistant Companion app next alarm sensor

Here's a basic example of using the Home Assistant Companion app next alarm sensor.

![screenshot](./images/using-date-and-time-entities-to-trigger-flows_01.png)

<<< @/examples/cookbook/using-date-and-time-entities-to-trigger-flows/example1a.json

### Adding an offset and on/off switch

Using the Helpers section under Configuration in Home Assistant add an `input_boolean` and `input_number` with a min of `-90` and a max of `90`.

In this example they are `input_number.offset` and `input_boolean.next_alarm_enabled`. The offset will be plus or minus minutes to the alarm. The delay node will get updated when either the alarm sensor gets updated, the input boolean gets toggled, or the offset changes.

If the [Node-RED custom component](https://github.com/zachowj/hass-node-red) is installed in Home Assistant there is no need for the `input_boolean` as the event state node can be exposed to Home Assistant as the toggle switch.

![screenshot](./images/using-date-and-time-entities-to-trigger-flows_02.png)

<<< @/examples/cookbook/using-date-and-time-entities-to-trigger-flows/example1b.json

::: warning
Delay nodes can have a max timeout of around 24.8 days greater than that and weird things will happen.
:::

## Daily alarm using Datetime Entity

![screenshot](./images/using-date-and-time-entities-to-trigger-flows_03.png)

<<< @/examples/cookbook/using-date-and-time-entities-to-trigger-flows/example2.json

An offset can also be added as shown in the next alarm sensor example.
