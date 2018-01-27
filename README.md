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

---
## Included Nodes
The installed nodes have more detailed information in the node-red info pane shown when the node is selected. Below is a quick summary

### events: all
Listens for all types of events from home assistant

### events: state
Listens for only `state_changed` events from home assistant

### call service
Sends a request to home assistant for any domain and service available ( `light/turn_on`, `input_select/select_option`, etc..)

### get state
Fetches the last known state for any entity on input

### get history
Fetches HomeAssistant history on input

### get template
Allows rendering of templates on input

---
## Development
An entire environment with Home Assistant/MQTT/Node Red can be easily spun up using docker and docker-compose along with built in VSCode debug enabled.

1. Clone this repository:              `git clone https://github.com/AYapejian/node-red-contrib-home-assistant.git`
2. Install node dependencies as usual: `cd node-red-contrib-home-assistant && npm install`
3. Start the docker dev environment:   `npm run dev`
a. _Note: First run will take a bit to download the images ( home-assistants image is over 1gb (yikes!) after that launch is much quicker)_
b. _Note: Also first run load of HomeAssistant web interface seems very slow, but after first time it's also much faster_
4. The `npm run dev` command will leave you with a terminal spitting out logs, `ctrl+c` out of this and it kills all the servers by design, just run `npm run dev` again to pick back up.  The following services and ports are launched in the `dev` script


| service                | port mappings            | info                                                                                                                            |
|------------------------|--------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| home-assistant         | `8123:8123`, `8300:8300` | exposed for local access via browser                                                                                            |
| node-red               | `1880:1880`, `9123:9229` | exposed for local access via browser, `9123` is used for debugging. Includes default flow example connected to `home-assistant` |
| mqtt                   | `1883:1883`, `9001:9001` | exposed for experimenting, however shouldn't be needed as compose handles mappings internally                                   |
| mqtt-listener          |                          | debug listener subscribed to topic `dev/#` of `mqtt` broker for log output                                                      |
| mqtt-dev-sensor        |                          | publishes every 10 seconds to a topic home assistant has  a `sensor` platform for                                               |
| mqtt-dev-binary-sensor |                          | publishes every 30 seconds to a topic home assistant has a `binary_sensor` for                                                  |







### Node Debugger via VSCode
Optional but it's pretty nice if you have VSCode installed.
- Open the project directory in VSCode
- Go to the debug tab ( or `cmd/ctrl+shift+d`)
- In the debug tab you should see an target for "Attach: Docker", run that guy and you can place debug breakpoints and changes will be reloaded within docker automatically
- Open [http://localhost:8123](http://localhost:8123) for HomeAssistant (password is `password` by default).  There is a default config which includes mqtt with a couple mqtt sensors that autopublish every 10 and 30 seconds by default. MQTT broker is also launched via docker, checkout the `docker` dir for more details if interested.
- For node-red either open up via the HomeAssistant web link or left hand menu or just open a browser tab to [http://localhost:1880](http://localhost:1880)

