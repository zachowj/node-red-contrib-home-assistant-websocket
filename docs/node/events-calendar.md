# Events: calendar

Outputs calendar item events similar to the calendar automation in Home Assistant

## Configuration:

### Entity ID <Badge text="required"/>

- Type: `string`

The entity_id for the calendar that contains triggerable calendar items.

### Event Type <Badge text="required"/>

- Type: `start | end`
- Default: `start`

Whether to trigger an event at the start or end of each matching calendar item.

### Filter

- Type: `string`

A string that will be used to match against a calendar item's description before it is sent as an event.

### Offset <Badge text="required"/>

- Type: `number`
- Default: 0 seconds

A negative or positive amount of time to allow the event to be triggered before or after the calendar item's start/end time.

### Update Interval <Badge text="required"/>

- Type: `number`
- Default: 15 minutes

The amount of time to wait between checking for matching calendar items. The default is 15 minutes as per the native Home Assistant calendar automation.

This also affects the 'window' of time that matching items will be found. For example, if the Update Interval is set to 15 minutes and a calendar item starts or ends in 14 minutes, the event will be triggered now rather than at the precise time of the item.

This node has also been configured to trigger at the beginning of each Update Interval rather than at an arbitrary time. This means that if the Update Interval is set to 15 minutes, the node will trigger at 00:00, 00:15, 00:30, 00:45, etc.

::: warning
Reducing the Update Interval may increase rate limit errors from the Home Assistant API. If this happens, some calendar item events may be missed.
If you are experiencing issues with this node, try increasing the Update Interval.
:::

### Output on Connect

- Type: `boolean`

Check for calendar items in the current 'window' when Home Assistant is started.

:::warning
This can cause some items to be triggered multiple times if they are matched both before and after a restart.
Alternatively, if set to false, a restart straddling an interval boundary may cause some items to be missed.
:::

### Expose to Home Assistant

- Type: `boolean`

Creates a switch within Home Assistant to enable/disable this node. This feature requires [Node-RED custom integration](https://github.com/zachowj/hass-node-red) to be installed in Home Assistant

## Outputs

Value types:

- `calendar item`: the calendar item object as provided by the Home Assistant API
