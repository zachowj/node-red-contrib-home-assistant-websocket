# Getting Started

## Installation

Installation of custom integration can be done using [HACS](https://hacs.xyz/) or manually, instruction can be found in the [README](https://github.com/zachowj/hass-node-red/blob/master/README.md#installation).

## Tip

Filling in the friendly name field in the entity config node before you first deploy will attempt to create it with that entity\*id otherwise it will default to `sensor.nodered_<node id>`. Where the random string is the node id in Node-RED. The entity id can be changed in Home Assistant after creating them in Node-RED.

![image|455x88](./images/tip.png)
