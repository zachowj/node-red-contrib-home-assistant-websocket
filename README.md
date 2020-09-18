# node-red-contrib-home-assistant-websocket

[![Release Version][release-shield]][release-link] [![Build Status][buildstatus-shield]][buildstatus-link] [![License][license-shield]](LICENSE.md)

[![BuyMeCoffee][buymecoffee-shield]][buymecoffee-link]

Various nodes to assist in setting up automation using [Node-RED](https://nodered.org/) communicating with [Home Assistant](https://home-assistant.io/).

## Getting Started

Documentation can be found [here](https://zachowj.github.io/node-red-contrib-home-assistant-websocket/).

### Prerequisites

Have Node-RED installed and working, if you need to
install Node-RED see [here](https://nodered.org/docs/getting-started/installation).

- [Node.js](https://nodejs.org) v10.0 or newer
- [Node-RED](https://nodered.org/) v1.0 or newer

### Installation

Install via Node-RED Manage Palette

```
node-red-contrib-home-assistant-websocket
```

Install via npm

```shell
$ cd ~/.node-red
$ npm install node-red-contrib-home-assistant-websocket
# then restart node-red
```

For [Home Assistant](https://www.home-assistant.io/hassio/) add-on users:

The Community add-on ships with this node right out of the box.

Under the server node config just check the checkbox for `I use the Home Assistant Add-on`

The add-on can be found here: <https://github.com/hassio-addons/addon-node-red#readme>

## Nodes

The installed nodes have more detailed information in the Node-RED info pane shown when the node is selected. Below is a quick summary

#### All Events

Listens for all types of events from home assistant with the ability to filter by event type

#### State Changed Event

Listens for only `state_changed` events from home assistant

#### State Trigger

Much like the `State Changed Node` however provides some advanced functionality around common automation use cases.

#### Poll State

Outputs the state of an entity at regular intervals, optionally also at startup
and every time the entity changes if desired

#### Webhook

_Need [Custom Integration](https://github.com/zachowj/hass-node-red) installed in Home Assistant for node to function_

Outputs the data received from the created webhook in Home Assistant

#### Call Service

Sends a request to home assistant for any domain and service available ( `light/turn_on`, `input_select/select_option`, etc..)

#### Entity

_Need [Custom Integration](https://github.com/zachowj/hass-node-red) installed in Home Assistant for node to function_

Creates an entity in Home Assistant which can be manipulated from this node

#### Fire Event

Fire an event on the event bus

#### Current State

Fetches the last known state for any entity on input

#### Get Entities

Get entities based on search criteria with 3 different output options

#### Get History

Fetches HomeAssistant history on input

#### Get Template

Allows rendering of templates on input

#### Wait Until

When an input is received the node will wait until the condition is met or the timeout occurs then will pass on the last received message

#### Zone

Outputs when one of the configured entities enter or leaves one of the defined zones.

## Contribute

- [Setting up Development Environment](https://zachowj.github.io/node-red-contrib-home-assistant-websocket/guide/development.html)
- [Help with Documentation](https://zachowj.github.io/node-red-contrib-home-assistant-websocket/guide/documentation.html)

## Contributors

[List of all contributors](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/graphs/contributors)

[buildstatus-shield]: https://img.shields.io/github/workflow/status/zachowj/node-red-contrib-home-assistant-websocket/CI/dev?label=dev%20build&style=for-the-badge
[buildstatus-link]: https://github.com/zachowj/node-red-contrib-home-assistant-websocket/actions
[license-shield]: https://img.shields.io/github/license/zachowj/node-red-contrib-home-assistant-websocket.svg?style=for-the-badge
[release-link]: https://github.com/zachowj/node-red-contrib-home-assistant-websocket/releases
[release-shield]: https://img.shields.io/github/v/release/zachowj/node-red-contrib-home-assistant-websocket?style=for-the-badge
[buymecoffee-link]: https://www.buymeacoffee.com/zachowj
[buymecoffee-shield]: https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png
