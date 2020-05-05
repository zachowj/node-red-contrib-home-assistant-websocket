# Getting Started

## Installation

Installation of custom integration can be done using [HACS](https://hacs.xyz/) or manually, instruction can be found in the [README](https://github.com/zachowj/hass-node-red/blob/master/README.md#installation).

## Tip

Filling in the name field in the HA config of these new nodes before you first deploy will attempt to create it with that entity_id otherwise it will default to `sensor.nodered_79fba2c4_04342c`. Where the random string is the node id in Node-RED. The entity ids change be changed in HA after creating them in NR.

![image|455x88](./images/tip.png)
