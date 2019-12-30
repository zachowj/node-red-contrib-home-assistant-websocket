# Motion Triggered Light

## Example 1

A motion sensor that always sends an `on` event when any motion is detected. Turns
light on when motion is detected and waits 5 minutes for no motion and turns off
light.

![screenshot](./images/motion-triggered-light_01.png)

```
[{"id":"9e2a08f5.4634b8","type":"server-state-changed","z":"ffbd7f06.4a014","name":"","version":1,"exposeToHomeAssistant":false,"haConfig":[{"property":"name","value":""},{"property":"icon","value":""}],"entityidfilter":"sensor.motion","entityidfiltertype":"exact","outputinitially":false,"state_type":"str","haltifstate":"","halt_if_type":"str","halt_if_compare":"is","outputs":1,"output_only_on_state_change":true,"x":250,"y":1008,"wires":[["1e4159dc.af4366","6a54b527.806bec"]]},{"id":"6a54b527.806bec","type":"api-call-service","z":"ffbd7f06.4a014","name":"Kitchen Light","version":1,"debugenabled":false,"service_domain":"light","service":"turn_on","entityId":"light.kitchen","data":"","dataType":"json","mergecontext":"","output_location":"","output_location_type":"none","mustacheAltTags":false,"x":678,"y":1008,"wires":[[]]},{"id":"1e4159dc.af4366","type":"trigger","z":"ffbd7f06.4a014","op1":"","op2":"{\"service\": \"turn_off\"}","op1type":"nul","op2type":"json","duration":"5","extend":true,"units":"min","reset":"","bytopic":"all","name":"","x":486,"y":1056,"wires":[["6a54b527.806bec"]]}]
```

## Example 2

A motion sensor that only sends an `on` event once then an `off` event when motion is
no longer detected.

![screenshot](./images/motion-triggered-light_02.png)

```
[{"id":"9e2a08f5.4634b8","type":"server-state-changed","z":"ffbd7f06.4a014","name":"","version":1,"exposeToHomeAssistant":false,"haConfig":[{"property":"name","value":""},{"property":"icon","value":""}],"entityidfilter":"sensor.motion","entityidfiltertype":"exact","outputinitially":false,"state_type":"str","haltifstate":"on","halt_if_type":"str","halt_if_compare":"is","outputs":2,"output_only_on_state_change":true,"x":250,"y":1008,"wires":[["6a54b527.806bec"],["c066de8f.8a0e2"]]},{"id":"6a54b527.806bec","type":"api-call-service","z":"ffbd7f06.4a014","name":"Kitchen Light On","version":1,"debugenabled":false,"service_domain":"light","service":"turn_on","entityId":"light.kitchen","data":"","dataType":"json","mergecontext":"","output_location":"","output_location_type":"none","mustacheAltTags":false,"x":666,"y":1008,"wires":[[]]},{"id":"c066de8f.8a0e2","type":"ha-wait-until","z":"ffbd7f06.4a014","name":"","outputs":2,"entityId":"sensor.motion","property":"state","comparator":"is","value":"on","valueType":"str","timeout":"5","timeoutUnits":"minutes","entityLocation":"","entityLocationType":"none","checkCurrentState":true,"blockInputOverrides":true,"x":476,"y":1056,"wires":[[],["28f00104.71e9de"]]},{"id":"28f00104.71e9de","type":"api-call-service","z":"ffbd7f06.4a014","name":"Kitchen Light Off","version":1,"debugenabled":false,"service_domain":"light","service":"turn_off","entityId":"light.kitchen","data":"","dataType":"json","mergecontext":"","output_location":"","output_location_type":"none","mustacheAltTags":false,"x":656,"y":1056,"wires":[[]]}]
```
