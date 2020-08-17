# Using Date and Time entities to trigger flows

## Using the Home Assistant Companion app next alarm sensor

Here's a basic example of using the Home Assistant Companion app next alarm sensor.

![screenshot](./images/using-date-and-time-entities-to-trigger-flows_01.png)

<<< @/examples/cookbook/using-date-and-time-entities-to-trigger-flows/example1a.json

### Adding an offset and togglable on and off switch

Using the Helpers section under configuration in Home Assistant add an `input_number` and `input_boolean`. In this example they are `input_number.offset` and `input_boolean.next_alarm_enabled`. The offset will be plus or minus minutes to the alarm. The delay node will get updated when either the alarm sensor gets updated, the input boolean gets toggled, or the offset changes.

![screenshot](./images/using-date-and-time-entities-to-trigger-flows_02.png)

<<< @/examples/cookbook/using-date-and-time-entities-to-trigger-flows/example1b.json

::: warning
Delay nodes can have a max timeout of around 24.8 days greater than that and weird things will happen.
:::
