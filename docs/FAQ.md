---
sidebar: auto
---

# FAQ

## What is what

[node-red-contrib-home-assistant-websocket](index.md) is a package that contains a set of nodes in Node-RED that interface with Home Assistant. It uses the Home Assistant WebSocket API to communicate with Home Assistant.

[hass-node-red](https://github.com/zachowj/hass-node-red) is a Home Assistant custom [integration](https://www.home-assistant.io/docs/glossary/#integration). It extends the Home Assistant WebSocket API to allow Node-RED to do more with Home Assistant, such as creating sensors, buttons, and switches in Home Assistant from Node-RED. Typically, it is installed via [HACS](https://hacs.xyz/) but can be installed [manually](https://github.com/zachowj/hass-node-red?tab=readme-ov-file#manual).

[Node-RED Home Assistant Community Add-on](https://github.com/hassio-addons/addon-node-red) is a Home Assistant [Add-on](https://www.home-assistant.io/docs/glossary/#add-on) that runs Node-RED with the [Home Assistant nodes](https://github.com/zachowj/node-red-contrib-home-assistant-websocket) pre-installed.

[Node-RED](https://nodered.org) is a flow-based development tool for visual programming developed originally by IBM for wiring together hardware devices, APIs, and online services as part of the Internet of Things.

[Home Assistant](https://www.home-assistant.io) is an open source home automation that puts local control and privacy first.

## Entities not showing in the autocomplete dropdown

1. Make sure you have at least deployed once after adding a server config.
2. There sometimes is a caching issue. Caching can be disabled for autocomplete
   results in the server config node and restarting Node-RED.

## Entity could not be found in cache for entity_id: ???

If your flow runs before Node-RED has had a chance to connect to Home Assistant
and retrieve the latest state information. The cache will be empty and this
error is thrown.

Home Assistant Add-on users have a 5-second delay between connection attempts because of
how the supervisor proxy works and the high CPU usage it can cause, [Issue
#76](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/76#issuecomment-453877333).
The delay can be turned off in the server config.

## Why do some of my nodes have a yellow font?

Starting with version 0.12.0 individual nodes on the workspace will now have a
version number associated with them. This will allow changes to be made to the
structure of nodes without affecting all nodes of that type until you edit them.
Legacy nodes will have a yellow font until the node has been upgraded to the
current version.

Just because the text is yellow on a node doesn’t mean you need to update it.
It will continue to function just as it has and the next time you modify the node
it will be upgraded then.
