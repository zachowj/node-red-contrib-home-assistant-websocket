# Node Red Contrib Home Assistant

Various nodes to assist in setting up automation using [node-red](https://nodered.org/) communicating with [Home Assistant](https://home-assistant.io/).

## Project status

Project is going through active development and as such will probably have a few 'growing pain' bugs as well as node type, input, output and functionality changes.  At this stage backwards compatibility between versions is not a main concern and a new version may mean you'll have to recreate certain nodes.

## Getting Started

This assumes you have [node-red](http://nodered.org/) already installed and working, if you need to install node-red see [here](http://nodered.org/docs/getting-started/installation)
```shell
$ cd cd ~/.node-red
$ npm install node-red-contrib-home-assistant
# then restart node-red
```

## Included Nodes
The installed nodes have more detailed information in the node-red info pane shown when the node is selected. Below is a quick summary

### events: all
Listens for all types of events from home assistant

### events: state
Listens for only `state_changed` events from home assistant

### current state
Returns the last known state for any entity

### call service
Sends a request to home assistant for any domain and service available ( light/turn_on, input_select/select_option, etc..)

## Known issues

* If the connection to the home assistant server is lost the nodes may have to be redeployed ( by just introducing a small change and clicking 'deploy' in node-red) to start listening again
* Fields with autocomplete ( Domain, Service some Entity ID fields ) are in progress, they should work but need polish
* Currently only Server Sent Events are supported for listening to home assistant.  Websockets will be implemented at some point in the future.
* Have not tested with more than one Home Assistant server configuration setup at one time within Node Red.  It should work in theory, but...
