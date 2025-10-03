---
sidebar: auto
---

# FAQ

## What is What?

- [node-red-contrib-home-assistant-websocket](index.md): A Node-RED package containing nodes that interface with Home Assistant using the WebSocket API.

- [hass-node-red](https://github.com/zachowj/hass-node-red): A custom Home Assistant integration that extends the WebSocket API, allowing Node-RED to create sensors, buttons, and switches in Home Assistant. It is usually installed via [HACS](https://hacs.xyz/) but can also be installed [manually](https://github.com/zachowj/hass-node-red?tab=readme-ov-file#manual).

- [Node-RED Home Assistant Community Add-on](https://github.com/hassio-addons/addon-node-red): A Home Assistant Add-on that runs Node-RED with Home Assistant nodes pre-installed.

- [Node-RED](https://nodered.org): A flow-based development tool for visual programming, originally developed by IBM, used to wire together hardware devices, APIs, and online services as part of the Internet of Things.

- [Home Assistant](https://www.home-assistant.io): An open-source home automation platform focused on local control and privacy.

## How to Install a Specific Version or Downgrade?

To install a specific version of the package or downgrade to an earlier version:

1. Visit the [Releases Page](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/releases) on GitHub.
2. Download the `.tgz` file for the desired version.
3. Open Node-RED and navigate to the "Manage palette" option.
4. Go to the "Install" tab and select the "Upload module tgz file" option.
5. Upload the downloaded `.tgz` file to install the specific version.
6. Restart Node-RED to apply the changes.

This method ensures you can control the version of the package used in your Node-RED setup.

## Entities Not Showing in the Autocomplete Dropdown

1. Ensure you've deployed at least once after adding a server configuration.
2. If there's a caching issue, disable caching for autocomplete results in the server config node, and restart Node-RED.

## Entity Could Not Be Found in Cache for entity_id: ???

This error occurs if your flow runs before Node-RED connects to Home Assistant and retrieves the latest state information, leaving the cache empty.

For Home Assistant Add-on users, there is a 5-second delay between connection attempts due to the supervisor proxy, which can cause high CPU usage. This delay can be turned off in the server config ([Issue #76](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/76#issuecomment-453877333)).

## Why Do Some of My Nodes Have a Yellow Font?

Starting with version 0.12.0, individual nodes in the workspace will have a version number associated with them, allowing structural changes without affecting all nodes of that type until edited. Nodes with legacy versions will display yellow font until upgraded.

Yellow text on a node doesn’t mean it needs immediate updating; it will continue functioning as before and will be upgraded the next time you modify it.
