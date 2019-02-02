# node-red-contrib-home-assistant-websocket

[![Build Status](https://travis-ci.com/zachowj/node-red-contrib-home-assistant-websocket.svg?branch=master)](https://travis-ci.com/zachowj/node-red-contrib-home-assistant-websocket) [![Coverage Status](https://coveralls.io/repos/github/zachowj/node-red-contrib-home-assistant-websocket/badge.svg?branch=master)](https://coveralls.io/github/zachowj/node-red-contrib-home-assistant-websocket?branch=master)

[![Buy me a coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoff.ee/zachowj)

Various nodes to assist in setting up automation using [Node-RED](https://nodered.org/) communicating with [Home Assistant](https://home-assistant.io/).

## Project status

Project is going through active development and as such will probably have a few 'growing pain' bugs as well as node type, input, output and functionality changes. At this stage backwards compatibility between versions is not a main concern and a new version **may mean you'll have to recreate certain nodes.**

## Getting Started

This assumes you have [Node-RED](https://nodered.org) already installed and working, if you need to install Node-RED see [here](https://nodered.org/docs/getting-started/installation)

**NOTE:** This requires [Node.js](https://nodejs.org) v8.12+ and [Node-RED](https://nodered.org/) v0.19+. If you're running Node-Red in Docker you'll need to pull the -v8 image for this to work.

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

For [Hass.io](https://hass.io/) add-on users:

The Community Hass.io add-on ships with this node right out of the box.

Under the server node config just check the checkbox for `I use Hass.io`

The add-on can be found here: <https://github.com/hassio-addons/addon-node-red#readme>

## Migrating

Coming from a different version, e.g. [@Ayapejian](https://github.com/AYapejian/node-red-contrib-home-assistant) or [@Spartan-II-117](https://github.com/Spartan-II-117/node-red-contrib-home-assistant-llat)?

If you have been using [@Ayapejian](https://github.com/AYapejian/node-red-contrib-home-assistant) version there are some breaking changes with two of the nodes. The ‘Poll State’ and ‘Current State’ both have a little different formatted outputs. Check your nodes and make sure they are outputting what you expect. A more in depth example can be found [here](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/wiki/Migration).

If you have been using the [@Spartan-II-117](https://github.com/Spartan-II-117/node-red-contrib-home-assistant-llat) fork this should be a drop in replacement.

---

## Included Nodes

The installed nodes have more detailed information in the Node-RED info pane shown when the node is selected. Below is a quick summary

### All Events - `websocket`

Listens for all types of events from home assistant with the ability to filter by event type

### State Changed Event - `websocket`

Listens for only `state_changed` events from home assistant

### State Trigger - `websocket`

Much like the `State Changed Node` however provides some advanced functionality around common automation use cases.

### Poll State - `websocket`

Outputs the state of an entity at regular intervals, optionally also at startup and every time the entity changes if desired

### Call Service - `websocket`

Sends a request to home assistant for any domain and service available ( `light/turn_on`, `input_select/select_option`, etc..)

### Fire Event - `http`

Fire an event on the event bus

### Current State - `websocket`

Fetches the last known state for any entity on input

### Get Entities - `websocket`

Get entities based on search criteria with 3 different output options

### Get History - `http`

Fetches HomeAssistant history on input

### Get Template - `http`

Allows rendering of templates on input

### Wait Until - `websocket`

When an input is received the node will wait until the condition is met or the timeout occurs then will pass on the last received message

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
