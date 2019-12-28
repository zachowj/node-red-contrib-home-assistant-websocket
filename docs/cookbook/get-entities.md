# Get Entities Examples

Here are three examples of how one might use the new `get entities` node.

## Example #1

You have a presence detection of some sort running in Home Assistant and you want to get a notification when you leave if any doors or windows are left open.

Using the `get entities` node here to get a possible list of entity ids [binary_sensor.front_door, binary_sensor.back_door, binary_sensor.front_window, binary_sensor.back_window] if their state is equal to `open`. The entities are returned with the output `Split`. This means that a message is sent for each valid entity. We then are using a template node to format the payload into the entity friendly name and joining them back into one payload using the `join` node.

![](./images/get-entities_03.png)

```
[{"id":"dafa6c83.24e07","type":"trigger-state","z":"7f24e6b8.eab548","name":"Left Home","entityid":"device_tracker.jason","entityidfiltertype":"exact","debugenabled":false,"constraints":[{"id":"9i2c9sz7d3e","targetType":"this_entity","targetValue":"","propertyType":"previous_state","propertyValue":"old_state.state","comparatorType":"is","comparatorValueDatatype":"str","comparatorValue":"home"},{"id":"3h3lghs8xsm","targetType":"this_entity","targetValue":"","propertyType":"current_state","propertyValue":"new_state.state","comparatorType":"is","comparatorValueDatatype":"str","comparatorValue":"not_home"}],"constraintsmustmatch":"all","outputs":2,"customoutputs":[],"outputinitially":false,"state_type":"str","x":230,"y":192,"wires":[["42dd6dce.c48ce4"],[]]},{"id":"42dd6dce.c48ce4","type":"ha-get-entities","z":"7f24e6b8.eab548","name":"","rules":[{"property":"entity_id","logic":"includes","value":"binary_sensor.front_door,binary_sensor.back_door,binary_sensor.front_window,binary_sensor.back_window","valueType":"str"},{"property":"state","logic":"is","value":"open","valueType":"str"}],"output_type":"split","output_empty_results":false,"output_location_type":"msg","output_location":"payload","output_results_count":1,"x":396,"y":192,"wires":[["301b2b51.48b104"]]},{"id":"301b2b51.48b104","type":"template","z":"7f24e6b8.eab548","name":"Format Friendly Name","field":"payload","fieldType":"msg","format":"handlebars","syntax":"mustache","template":"{{payload.attributes.friendly_name}}","output":"str","x":600,"y":192,"wires":[["8ed935f8.afbad8"]]},{"id":"8ed935f8.afbad8","type":"join","z":"7f24e6b8.eab548","name":"","mode":"custom","build":"string","property":"payload","propertyType":"msg","key":"topic","joiner":",","joinerType":"str","accumulate":false,"timeout":"","count":"","reduceRight":false,"reduceExp":"","reduceInit":"","reduceInitType":"","reduceFixup":"","x":770,"y":192,"wires":[["454131f7.c19f"]]},{"id":"454131f7.c19f","type":"api-call-service","z":"7f24e6b8.eab548","name":"Notify","version":1,"debugenabled":false,"service_domain":"notify","service":"push_jason","entityId":"","data":"{\"message\": \"The {{payload}} are open.\",\"title\": \"Left Open\"}","dataType":"json","mergecontext":"","output_location":"payload","output_location_type":"msg","mustacheAltTags":false,"x":898,"y":192,"wires":[[]]}]
```

---

## Example #2

Sort of a Vacation or Away script to randomly turn on some lights around your home.

Using an `inject` node here but you could use your preference of timer node. The `get entities` node is randomly choosing one entity from the criteria where `entity_id starts with light.`.

![](./images/get-entities_02.png)

```
[{"id":"39342a95.8db3d6","type":"inject","z":"c86782e1.cf429","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":252,"y":256,"wires":[["e9038030.b79e4"]]},{"id":"e9038030.b79e4","type":"ha-get-entities","z":"c86782e1.cf429","name":"","rules":[{"property":"entity_id","logic":"starts_with","value":"light.","valueType":"str"}],"output_type":"random","output_empty_results":false,"output_location_type":"msg","output_location":"payload","output_results_count":1,"x":402,"y":256,"wires":[["2586f129.6136fe"]]},{"id":"58c67712.8aa4a8","type":"delay","z":"c86782e1.cf429","name":"","pauseType":"random","timeout":"5","timeoutUnits":"seconds","rate":"1","nbRateUnits":"1","rateUnits":"second","randomFirst":"20","randomLast":"30","randomUnits":"minutes","drop":false,"x":732,"y":256,"wires":[["986369ca.af3f48"]]},{"id":"2586f129.6136fe","type":"api-call-service","z":"c86782e1.cf429","name":"Turn on Light","version":1,"debugenabled":false,"service_domain":"light","service":"turn_on","entityId":"{{payload.entity_id}}","data":"","dataType":"json","mergecontext":"","output_location":"","output_location_type":"none","mustacheAltTags":false,"x":562,"y":256,"wires":[["58c67712.8aa4a8"]]},{"id":"986369ca.af3f48","type":"api-call-service","z":"c86782e1.cf429","name":"Turn off Light","version":"1","debugenabled":false,"service_domain":"light","service":"turn_off","entityId":"{{payload.entity_id}}","data":"","dataType":"json","mergecontext":"","output_location":"payload","output_location_type":"msg","mustacheAltTags":false,"x":898,"y":256,"wires":[[]]}]
```

---

## Example #3

On Reddit the other day a user posted this [How can I join 1 to 4 pre-defined messages together based on 4 separate entity states?](https://www.reddit.com/r/homeassistant/comments/a628cw/nodered_how_can_i_join_1_to_4_predefined_messages/) (Their solution can be found in the post)

Here's my take on it using the `get entities` and a `function` node. Using the `Array` output option here.

![](./images/get-entities_01.png)

```
[{"id":"2bdd6fb7.15743","type":"server-state-changed","z":"3c84cc55.8f02f4","name":"","version":"1","exposeToHomeAssistant":false,"haConfig":[{"property":"name","value":""},{"property":"icon","value":""}],"entityidfilter":"binary_sensor.button_bedroom","entityidfiltertype":"substring","outputinitially":false,"state_type":"str","haltifstate":"","halt_if_type":"str","halt_if_compare":"is","outputs":1,"output_only_on_state_change":false,"x":276,"y":224,"wires":[["c2a9ffac.1e05d"]]},{"id":"c2a9ffac.1e05d","type":"ha-get-entities","z":"3c84cc55.8f02f4","name":"","rules":[{"property":"entity_id","logic":"includes","value":"sensor.phon_charging,sensor.watch_charging,sensor.kaylas_phone_charging,lock.lock","valueType":"str"},{"property":"state","logic":"includes","value":"no,unlocked","valueType":"str"}],"output_type":"array","output_empty_results":true,"output_location_type":"msg","output_location":"payload","output_results_count":1,"x":550,"y":224,"wires":[["2950c181.1ef95e"]]},{"id":"2950c181.1ef95e","type":"function","z":"3c84cc55.8f02f4","name":"","func":"let lockFD = null;\nlet PC = false;\nlet WC = false;\nlet KP = false;\nlet FD = false;\n\nmsg.payload.forEach(entity => {\n    switch(entity.entity_id) {\n        case \"sensor.phone_charging\":\n            PC = true;\n            break;\n        case \"sensor.watch_charging\":\n            WC = true;\n            break;\n        case \"sensor.kaylas_phone_charging\":\n            KP = true;\n            break;\n        case \"lock.lock\":\n            FD = true;\n            lockFD = { payload: true };\n            break;\n    }\n    \n});\n\nlet message = \"Goodnight.\";\nif(PC && WC) {\n    message = `${message} Don’t forget to charge your phone and watch.`;\n} else {\n    message = `${message} Don’t forget to charge your ${PC ? 'phone' : 'watch'}.`\n}\nif(KP) {\n    message = `${message} Remind Kayla to charge her phone${PC ? ' too':''}.`;\n}\nif(FD) {\n    message = `${message} The door is now locked.`\n}\nmsg.payload = message;\nreturn [msg, lockFD];\n","outputs":2,"noerr":0,"x":690,"y":224,"wires":[["ca4a5643.9bf0d8"],["64374b0e.f72394"]]},{"id":"ca4a5643.9bf0d8","type":"cast-to-client","z":"3c84cc55.8f02f4","name":"","url":"","contentType":"","message":"","language":"en","ip":"192.168.1.29","port":"","volume":"40","x":874,"y":224,"wires":[[]]},{"id":"64374b0e.f72394","type":"api-call-service","z":"3c84cc55.8f02f4","name":"lock door","version":"1","debugenabled":false,"service_domain":"scene","service":"turn_on","entityId":"scene.lock_door","data":"","dataType":"json","mergecontext":"","output_location":"payload","output_location_type":"msg","mustacheAltTags":false,"x":844,"y":272,"wires":[[]]}]
```

Disclaimer: All these examples are untested but should give you a general idea of how to use it.

**Also see:**

- [get-entities node](../node/get-entities.md)
