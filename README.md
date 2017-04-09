# Node Red Contrib Home Assistant

Various nodes to assist in setting up automation using node-red communicating with Home Assistant.

## Gettings Started

This assumes you have [node-red](http://nodered.org/) already installed and working, if you need to install node-red see [here](http://nodered.org/docs/getting-started/installation)
```shell
$ cd cd ~/.node-red
$ npm install node-red-contrib-home-assistant
$ Restart node-red
```

## Included Nodes

### Incoming Events
This is probably where you want to get started. By default will send messages for each 'state_changed' event from home assistant.  See the node's info panel for more details.

### Service Call
Calls the home assistant server's api for the node's defined domain and service, sending in any set data as the payload of the api call.
