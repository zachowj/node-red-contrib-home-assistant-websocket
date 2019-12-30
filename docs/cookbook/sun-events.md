# Turn Light On/Off with Sunset/Sunrise

## Option 1

![screenshot](../guide/images/first-automation_05.png)

```
[{"id":"b74ada49.d7e408","type":"server-state-changed","z":"ffbd7f06.4a014","name":"","version":1,"exposeToHomeAssistant":false,"haConfig":[{"property":"name","value":""},{"property":"icon","value":""}],"entityidfilter":"sun.sun","entityidfiltertype":"exact","outputinitially":false,"state_type":"str","haltifstate":"above_horizon","halt_if_type":"str","halt_if_compare":"is","outputs":2,"output_only_on_state_change":true,"x":244,"y":784,"wires":[["1f467cbb.0c3983"],["da5ff3e0.cbb2a"]]},{"id":"1f467cbb.0c3983","type":"api-call-service","z":"ffbd7f06.4a014","name":"","version":1,"debugenabled":false,"service_domain":"light","service":"turn_off","entityId":"light.front_porch","data":"","dataType":"json","mergecontext":"","output_location":"","output_location_type":"none","mustacheAltTags":false,"x":474,"y":784,"wires":[[]]},{"id":"da5ff3e0.cbb2a","type":"api-call-service","z":"ffbd7f06.4a014","name":"","version":1,"debugenabled":false,"service_domain":"light","service":"turn_on","entityId":"light.front_porch","data":"","dataType":"json","mergecontext":"","output_location":"","output_location_type":"none","mustacheAltTags":false,"x":474,"y":832,"wires":[[]]}]
```

## Option 2

![screenshot](./images/sun-events_01.png)

```
[{"id":"74a64f80.d2302","type":"server-state-changed","z":"ffbd7f06.4a014","name":"","version":1,"exposeToHomeAssistant":false,"haConfig":[{"property":"name","value":""},{"property":"icon","value":""}],"entityidfilter":"sun.sun","entityidfiltertype":"exact","outputinitially":false,"state_type":"str","haltifstate":"above_horizon","halt_if_type":"str","halt_if_compare":"is","outputs":2,"output_only_on_state_change":true,"x":404,"y":832,"wires":[["ccb2f059.1d384"],["4a84490d.9930a8"]]},{"id":"ccb2f059.1d384","type":"api-call-service","z":"ffbd7f06.4a014","name":"","version":1,"debugenabled":false,"service_domain":"light","service":"turn_off","entityId":"light.front_porch","data":"","dataType":"json","mergecontext":"","output_location":"","output_location_type":"none","mustacheAltTags":false,"x":794,"y":832,"wires":[[]]},{"id":"4a84490d.9930a8","type":"change","z":"ffbd7f06.4a014","name":"turn on","rules":[{"t":"set","p":"payload","pt":"msg","to":"{\"service\": \"turn_on\"}","tot":"json"}],"action":"","property":"","from":"","to":"","reg":false,"x":604,"y":880,"wires":[["ccb2f059.1d384"]]}]
```

## Option 3

**Required Nodes**

- [node-red-contrib-eztimer](https://flows.nodered.org/node/node-red-contrib-eztimer)

![screenshot](./images/sun-events_02.png)

```
[{"id":"ccb2f059.1d384","type":"api-call-service","z":"ffbd7f06.4a014","name":"","version":1,"debugenabled":false,"service_domain":"light","service":"{{payload}}","entityId":"light.front_porch","data":"","dataType":"json","mergecontext":"","output_location":"","output_location_type":"none","mustacheAltTags":false,"x":644,"y":832,"wires":[[]]},{"id":"1a6cb307.d3168d","type":"eztimer","z":"ffbd7f06.4a014","name":"","autoname":"sunset - sunrise","tag":"eztimer","suspended":false,"sendEventsOnSuspend":false,"timerType":"1","startupMessage":true,"ontype":"1","ontimesun":"sunset","ontimetod":"17:00","onproperty":"payload","onvaluetype":"str","onvalue":"turn_on","onoffset":0,"onrandomoffset":0,"onsuppressrepeats":false,"offtype":"1","offtimesun":"sunrise","offtimetod":"dusk","offduration":"00:01:00","offproperty":"payload","offvaluetype":"str","offvalue":"turn_off","offoffset":0,"offrandomoffset":0,"offsuppressrepeats":false,"mon":true,"tue":true,"wed":true,"thu":true,"fri":true,"sat":true,"sun":true,"x":288,"y":832,"wires":[["ccb2f059.1d384"]]}]
```
