# JSONata Examples

## Increase lights brightness with remote

A remote with a button that when clicked it increases the brightness of a given light by an amount that is set from an input_number inside Home Assistant.

![](./images/jsonata_1.png)

```
[{"id":"86cbf80d.5a9cf8","type":"api-call-service","z":"83fb2374.5839d","name":"","version":1,"service_domain":"light","service":"turn_on","entityId":"light.kitchen","data":"{\"brightness\": $min([$entities(\"light.kitchen\").attributes.brightness + $entities(\"input_number.brightness\").state, 255])}","dataType":"jsonata","mergecontext":"","output_location":"payload","output_location_type":"msg","mustacheAltTags":false,"x":426,"y":416,"wires":[[]]},{"id":"8aad6643.9ee7a8","type":"server-state-changed","z":"83fb2374.5839d","name":"Remote Button","version":1,"entityidfilter":"sensor.button","entityidfiltertype":"exact","outputinitially":false,"state_type":"str","haltifstate":"","halt_if_type":"str","halt_if_compare":"is","outputs":1,"output_only_on_state_change":true,"x":224,"y":416,"wires":[["86cbf80d.5a9cf8"]]}]
```

JSONata expression in the call-service node

```json
{
  "brightness": $min([
    $entities("light.kitchen").attributes.brightness +
      $entities("input_number.brightness").state,
    255
  ])
}
```

## Notification of lights left on when leaving home

Get notified when light or switch is left on when you leave. This a remake of Example #1 from this [post](https://community.home-assistant.io/t/examples-for-using-the-new-get-entities-node/85777) showing how to manipulate entities and get the desired output.

![](./images/jsonata_2.png)

```
[{"id":"8420cd3d.051ac","type":"trigger-state","z":"83fb2374.5839d","name":"Left Home","entityid":"device_tracker.jason","entityidfiltertype":"exact","debugenabled":false,"constraints":[{"id":"9i2c9sz7d3e","targetType":"this_entity","targetValue":"","propertyType":"previous_state","propertyValue":"old_state.state","comparatorType":"is","comparatorValueDatatype":"str","comparatorValue":"home"},{"id":"3h3lghs8xsm","targetType":"this_entity","targetValue":"","propertyType":"current_state","propertyValue":"new_state.state","comparatorType":"is","comparatorValueDatatype":"str","comparatorValue":"not_home"}],"constraintsmustmatch":"all","outputs":2,"customoutputs":[],"outputinitially":false,"state_type":"str","x":214,"y":240,"wires":[["888034a3.b642c8"],[]]},{"id":"888034a3.b642c8","type":"api-call-service","z":"83fb2374.5839d","name":"Notify","version":1,"service_domain":"notify","service":"android_jason","entityId":"","data":"{\t   \"message\": \"The \" & $join($entities().*[state = \"on\" and entity_id ~> /^light|^switch/].attributes.friendly_name, \", \") & \" are on.\",\t   \"title\": \"Left On\"\t}","dataType":"jsonata","mergecontext":"","output_location":"payload","output_location_type":"msg","mustacheAltTags":false,"x":370,"y":240,"wires":[[]]}]
```

This is the same as above but uses an event:state node and shows how to use the `$entity()` and `$prevEntity()` functions to compare states.

![](./images/jsonata_3.png)

```
[{"id":"cb25c8d7.881688","type":"server-state-changed","z":"83fb2374.5839d","name":"Left Home","version":1,"entityidfilter":"person.jason","entityidfiltertype":"exact","outputinitially":false,"state_type":"str","haltifstate":"$entity().state != $prevEntity().state","halt_if_type":"jsonata","halt_if_compare":"jsonata","outputs":2,"output_only_on_state_change":true,"x":204,"y":352,"wires":[["b48e8249.ad09f"],[]]},{"id":"b48e8249.ad09f","type":"api-call-service","z":"83fb2374.5839d","name":"Notify","version":1,"service_domain":"notify","service":"android_jason","entityId":"","data":"{\t   \"message\": \"The \" & $join($entities().*[state = \"on\" and entity_id ~> /^light|^switch/].attributes.friendly_name, \", \") & \" are on.\",\t   \"title\": \"Left On\"\t}","dataType":"jsonata","mergecontext":"","output_location":"payload","output_location_type":"msg","mustacheAltTags":false,"x":354,"y":352,"wires":[[]]}]
```

Event-State Node:
`$entity().state != $prevEntity().state`

Call-Service Node:

```json
{
     "message": "The " & $join($entities().*[state = "on" and entity_id ~> /^light|^switch/].attributes.friendly_name, ", ") & " are on.",
     "title": "Left On"
}
```

## OR conditional for the events: state node

The trigger-state node is great if you have several conditions you want to check for but it doesn't allow you to use OR checks. Using a JSONata expression with an event:state node will allow you to fill this gap.

Motion sensor at the front door triggers and have a text to speech notification be sent if at least one person is home.

![](./images/jsonata_3.png)

```
[{"id":"114a7e82.282431","type":"server-state-changed","z":"fac037bf.a42d78","name":"Motion Front Door","version":1,"entityidfilter":"binary_sensor.front_door","entityidfiltertype":"exact","outputinitially":false,"state_type":"str","haltifstate":"$entity().state = \"on\" and (\t   $entities(\"person.person1\").state = \"home\" or $entities(\"person.person2\").state = \"home\"\t)","halt_if_type":"jsonata","halt_if_compare":"jsonata","outputs":2,"output_only_on_state_change":true,"x":218,"y":1040,"wires":[["8c84fdde.9770f"],[]]},{"id":"8c84fdde.9770f","type":"api-call-service","z":"fac037bf.a42d78","name":"TTS Motion","version":1,"service_domain":"tts","service":"google_say","entityId":"","data":"{\"message\": \"Movement at the front door.\"}","dataType":"json","mergecontext":"","output_location":"","output_location_type":"none","mustacheAltTags":false,"x":406,"y":1040,"wires":[[]]}]
```

```json
$entity().state = "on" and (
   $entities("person.person1").state = "home" or $entities("person.person2").state = "home"
)
```

**Also see:**

- [JSONata guide](../guide/jsonata.md)
