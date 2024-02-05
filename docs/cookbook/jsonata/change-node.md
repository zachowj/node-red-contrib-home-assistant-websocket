# Change node

**Using JSONata for more complex tasks:**

Many automations can be coded using a simple JSONata expression at some convenient point in the flow, often directly within one of the WebSocket nodes. Where the data involved is a more complex structure, then JSONata is a powerful tool for manipulating JSON objects and arrays. Almost all computation can be achieved using JSONata in a Change node in place of using a Function node.

## Read a person state history for the past week

Since Home Assistant stores state history for 10 days by default, it is possible to read historic state records. The **Get History** node can do this for any given entity, and using _relative time_ it is easy to obtain an array of past _state-change_ events.

There are no opportunities to use JSONata within the Get History node itself, however JSONata can be used both to setup the node parameters and to manipulate the returned array. In this example, JSONata is used extensively to:

- set the input parameters for the time period required
- read the current entity state for 'now' and the given entity ID
- add an 'event' for 'now' and an 'event' for the start history-period time
- calculate the time interval between successive state changes to create 'event-periods'
- filter out any event periods less than, say, 50 minutes or for state 'unknown'
- compact any now sequential equal-state events into one longer period

This returns a filtered array of entity states, with the time that state period started and the time it ended, and the duration in minutes. The requirement for extensive data processing here is due to the way 'person' sensors report, giving rise to short periods of 'unknown' or 'away' because Wi-Fi signal or a smart phone has gone 'off-line'.

![screenshot](./images/jsonata_7_1.png)

@[code](@examples/cookbook/jsonata-examples/read-person-history.json)

```
(
/* FILTER parameters */
    $fMins:=50;

/* get current state from entity 'data', and set the 'last_changed' to now */
    $first:= data~>|$|{"last_changed": $now()}|;

/* add this to far end of history payload array, then sort by reverse time order */
    $x:=$append(payload, $first)^(>last_changed,>last_updated);

/* copy the oldest state value, and add in as the first record at start of history */
/* we now have a 'now' and 'start of history' record, even if payload was empty    */
    $x:=$append($x,{"state": $x[0].state, "last_changed": startAt});

/* create array of state changes, with how long they have been in that state */
/* remove any zero periods and unknown states FILTER OUT AS REQUIRED         */
    $events:=$x#$i.(
        $prior:= $i>0 ? $x[$i-1] : {"first": $now()};
        {"index": $i,
         "state": state,
         "from": last_changed,
         "upto": $prior.last_changed,
         "dmins": ($toMillis($prior.last_changed)-$toMillis(last_changed))/60000~>$round(0)
        }
    )[dmins>$fMins and state!="unknown"];

/* merge consecutive records with the same state into one longer period */
/* get each event position as 'start - middle - end' or 'only'          */

    $temp:=$events#$v.(
        $back:= $v<1 ? false : state = $events[$v-1].state;
        $next:= state = $events[$v+1].state;
        $position:=( $back ? ($next ? "middle" : "end") : ($next ? "start" : "only") );
        $~>|$|{"index": $v, "position": $position}|
    );

/* get start and end indexes, and zip into a sequence array of [start, end]  */
/* map this array of sequences to an array of objects, one for each sequence */
/* where the object is the combination of a run of the same state value      */

    $chain:=$zip($temp[position="start"].index, $temp[position="end"].index);

    $array:=$map($chain, function($item) {(
        $recA:=$events[$item[0]];
        $recB:=$events[$item[1]];
        {"state": $recA.state,
        "from": $recB.from,
        "upto":  $recA.upto,
        "dmins": ($toMillis($recA.upto)-$toMillis($recB.from))/60000~>$round(0),
        "position": "merged"}
        )
    });

/* combine the 'only' single events with the now-merged sequences, and sort by time */
    $append($temp[position="only"], $array)^(>from);

)
```

**Notes:**

The Inject node uses JSONata to initially create msg.payload as a data object, setting the relative time parameter for the Get History node, and also setting the timestamp for the effective start of this time period.

The Current State node uses JSONata in the output to retain msg.payload and also merge in the _entityId_ using `$entity().entity_id`. This now sets msg.payload with the required input parameters for the Get History node (which therefore requires no UI settings). Full entity details are also captured in msg.data as usual.

::: caution
This example code has been tested but person sensors can go 'off line' for long periods
and the exact nature of the output data should be checked by experimentation.
:::

## Report only those periods when _'not home'_ during the day

Once state history has been manipulated like this into an event-array, it is easy to ask questions, such as "how many times has this person been away this week?"

The question "when was this person away during the day?" for example, can be answered by filtering the state event array, to look for 'not home' and for the event period (both start and end) to be entirely on the same date.

```
payload[state="not_home" and ($substringBefore(from,"T") = $substringBefore(upto,"T") ) ]
```

**Note on history records:**

In asking for the history for the past 24 hours, the Get History node will return an array of all state change events that occurred within that time period. If the current state has been unchanged for the entire period requested, then an empty array will be returned.

To address this, the JSONata code here first adds a record for 'now' with the current state. The code then finds the oldest state (which may well be the current 'now' state just added) and adds that as a record for 'the start of the time period requested' at that state. This ensures that the returned history event array is topped and tailed. The minimum state event array will therefore be _one_ entry from _start of history request_ to _now_, at the _current_ state.

**Also see:**

- [JSONata guide](../guide/jsonata.md)
- [JSONata primer](../guide/jsonata-primer.md)
