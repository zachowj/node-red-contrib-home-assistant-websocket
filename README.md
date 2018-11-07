# Node Red Contrib Home Assistant Websocket

[![Build Status](https://travis-ci.com/zachowj/node-red-contrib-home-assistant-websocket.svg?branch=master)](https://travis-ci.com/zachowj/node-red-contrib-home-assistant-websocket) [![Coverage Status](https://coveralls.io/repos/github/zachowj/node-red-contrib-home-assistant-websocket/badge.svg?branch=master)](https://coveralls.io/github/zachowj/node-red-contrib-home-assistant-websocket?branch=master)

Various nodes to assist in setting up automation using [node-red](https://nodered.org/) communicating with [Home Assistant](https://home-assistant.io/).

## Project status

Project is going through active development and as such will probably have a few 'growing pain' bugs as well as node type, input, output and functionality changes. At this stage backwards compatibility between versions is not a main concern and a new version **may mean you'll have to recreate certain nodes.**

## Getting Started

This assumes you have [node-red](https://nodered.org/) already installed and working, if you need to install node-red see [here](https://nodered.org/docs/getting-started/installation)

#### NOTE: node-red-contrib-home-assistant-websocket requires node.JS >= 8.12.0. If you're running Node-Red in Docker you'll need to pull the -v8 image for this to work.

Install via Node-RED Manage Palette

```shell
node-red-contrib-home-assistant-websocket
```

Install via npm

```shell
$ cd ~/.node-red
$ npm install node-red-contrib-home-assistant-websocket
# then restart node-red
```

For [Hass.io](https://hass.io/) add-on users:

The Community Hass.io add-on ships with this node right out of the box.

Under the server node config just check the checkbox for `I use Hass.io`

The add-on can be found here: <https://github.com/hassio-addons/addon-node-red#readme>

=======
For flow examples checkout the [flows here](https://raw.githubusercontent.com/zachowj/node-red-contrib-home-assistant-websocket/master/docker/node-red/root-fs/data/flows.json)

---

## Included Nodes

The installed nodes have more detailed information in the node-red info pane shown when the node is selected. Below is a quick summary

### All Events - `websocket`

Listens for all types of events from home assistant

### State Changed Event - `websocket`

Listens for only `state_changed` events from home assistant

### State Trigger - `websocket`

Much like the `State Changed Ndoe` however provides some advanced functionality around common automation use cases.

### Poll State - `websocket`

Outputs the state of an entity at regular intervals, optionally also at startup and every time the entity changes if desired

### Call Service - `websocket`

Sends a request to home assistant for any domain and service available ( `light/turn_on`, `input_select/select_option`, etc..)

### Fire Event - `rest api`

Fire an event on the event bus

### Get Current State - `websocket`

Fetches the last known state for any entity on input

### Get History - `rest api`

Fetches HomeAssistant history on input

### Get Template - `rest api`

Allows rendering of templates on input

## Development

Check out the wiki page for setting up an environment with Home Assistant/Node Red.

[Development Wiki](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/wiki/Development)

## Authors

- **[@AYapejian](https://github.com/AYapejian)** - [node-red-contrib-home-assistant](https://github.com/AYapejian/node-red-contrib-home-assistant)
- **[@AYapejian](https://github.com/AYapejian)** - [node-home-assistant](https://github.com/AYapejian/node-home-assistant)
- **[@zachowj](https://github.com/AYapejian)** - [node-red-contrib-home-assistant-websocket](https://github.com/AYapejian/node-home-assistant-websocket)

[List of all authors and contributors](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/graphs/contributors)

## Acknowledgments

- [home-assistant-js-websocket](https://github.com/home-assistant/home-assistant-js-websocket)
- [@Spartan-II-117](https://github.com/Spartan-II-117)
