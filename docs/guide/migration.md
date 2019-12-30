# Migration

## Current-State Node Output

Unchecking 'Override Topic' and 'Override Payload' doesn't work in node-red-contrib-home-assistant v0.3.2. It always overwrites `msg.topic` and `msg.payload`. If you have current-state nodes where you have unchecked the 'Override Payload' with node-red-contrib-home-assistant-websocket it will stop overriding payload and put the state object into `msg.data`

## Poll-State Node Output

`msg.payload.data` moved to `msg.data`

`msg.payload` becomes just the state of the state object `msg.payload.data.state` => `msg.payload`

`msg.payload.dateChanged` removed

`msg.timeSinceChanged` and `msg.timeSinceChangedMs` moved into `msg.data`

[node-red-contrib-home-assistant](https://github.com/AYapejian/node-red-contrib-home-assistant) v0.3.2

```json
{
  "topic": "sun.sun",
  "payload": {
    "timeSinceChanged": "4 hours ago",
    "timeSinceChangedMs": 15342567,
    "dateChanged": "2018-10-11T14:21:01.004Z",
    "data": {
      "entity_id": "sun.sun",
      "state": "above_horizon",
      "attributes": { ... },
      "last_changed": "2018-10-11T14:21:01.004183+00:00",
      "last_updated": "2018-10-11T18:36:30.002985+00:00",
      "context": { ... }
    }
  },
  "_msgid": "345fd403.6e71ec"
}
```

[node-red-contrib-home-assistant-websocket](https://github.com/zachowj/node-red-contrib-home-assistant-websocket) v0.1.1

```json
{
  "topic": "sun.sun",
  "payload": "above_horizon",
  "data": {
    "entity_id": "sun.sun",
    "state": "above_horizon",
    "timeSinceChanged": "5 hours ago",
    "timeSinceChangedMs": 16236433
    "attributes": { ... },
    "last_changed": "2018-10-11T14:21:01.004183+00:00",
    "last_updated": "2018-10-11T18:51:30.002737+00:00",
    "context": { ... },
  },
  "_msgid": "5071255c.ad802c"
}
```
