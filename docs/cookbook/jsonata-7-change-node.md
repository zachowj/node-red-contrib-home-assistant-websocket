# JSONata Examples 7 - Change Node

**Using JSONata for more complex tasks:**

Many automations can be coded using a simple JSONata expression at some convenient point in the flow. Where the data is a more complex structure, then JSONata is a powerful tool for manipulating JSON.

## Read a person state history for the past week

Since Home Assistant stores state history for a default 10 days, it is possible to read historic state records. The **Get History** node can do this for any given entity, and using relative time it is easy to obtain an array of past _state-change_ events.

There are no opportunities to use JSONata within this simple node, however JSONata can be used to manipulate the returned array. In this example, JSONata is used extensively to

- set the input parameters for the time period required
- capture the current state for 'now' and the given entity ID
- add an 'event' for 'now' and an 'event' for the earliest history-period time
- calculate the time interval between events
- filter out any events less than, say, 50 minutes or state 'unknown'
- combine now-sequential equal-state events into one longer period

This now returns a filtered array of entity states, the time that state started and the time it ended, and the duration in minutes. The need for extensive data processing here comes from the way 'person' sensors report, giving rise to short periods of 'unknown' or 'away' because WiFi signal or a smart phone has gone 'off-line'.

## Report only those periods when 'not home' during the day

Once state history has been manipulated like this into an event-array, it is easy to ask questions, such as

- how long was the period when this person was last away?
- how many times has this person been away this week?
- was this person away overnight in the past week?
- was this person out after 23:00, and if so, what time did they return home?

The question 'when was this person away during the day' for example, can be answered by filtering the state event array, to look for 'not home' and for the event period (both start and end) to be entirely on the same date.

**Note on history records:**

In asking for the history for the past 24 hours, the Get History node will return an array of all state change events that occured within that time period. If the current state has been unchanged for the entire period requested, then an empty array will be returned.

To address this, the JSONata code here first adds a record for 'now' at the current state. Then the code finds the oldest state (which may well be the current 'now' state just added) and adds that as a record for 'the start of the time period requested' at that state. This ensures that the returned history event array is topped and tailed. The minimum state event array will therefore be _one_ entry from _start of history request_ to _now_, at the _current_ state.