NOTE: I did not write this, I forked from [@AYapejian](https://github.com/AYapejian/node-red-contrib-home-assistant) due to a lack of responsiveness to issues and pull requests.

# Node Red Contrib Home Assistant

Various nodes to assist in setting up automation using [node-red](https://nodered.org/) communicating with [Home Assistant](https://home-assistant.io/).

## Project status

Project is going through active development and as such will probably have a few 'growing pain' bugs as well as node type, input, output and functionality changes.  At this stage backwards compatibility between versions is not a main concern and a new version __may mean you'll have to recreate certain nodes.__

## Getting Started

This assumes you have [node-red](http://nodered.org/) already installed and working, if you need to install node-red see [here](http://nodered.org/docs/getting-started/installation)

#### NOTE: node-red-contrib-home-assistant requires node.JS > 8.0  If you're running Node-Red in Docker you'll need to pull the -v8 image for this to work.

```shell
$ cd cd ~/.node-red
$ npm install node-red-contrib-home-assistant
# then restart node-red
```

For flow examples checkout the [flows here](https://raw.githubusercontent.com/AYapejian/node-red-contrib-home-assistant/master/_docker/node-red/root-fs/data/flows.json)

---
## Included Nodes
The installed nodes have more detailed information in the node-red info pane shown when the node is selected. Below is a quick summary

### All Events
Listens for all types of events from home assistant

### State Changed Event
Listens for only `state_changed` events from home assistant

### State Trigger
Much like the `State Changed Ndoe` however provides some advanced functionality around common automation use cases.

### Poll State
Outputs the state of an entity at regular intervals, optionally also at startup and every time the entity changes if desired

### Call Service
Sends a request to home assistant for any domain and service available ( `light/turn_on`, `input_select/select_option`, etc..)

### Get Current State
Fetches the last known state for any entity on input

### Get History
Fetches HomeAssistant history on input

### Get Template
Allows rendering of templates on input

---
## Development
An environment with Home Assistant/Node Red can be easily spun up using docker and docker-compose along with built in VSCode debug enabled.

1. Clone this repository:              `git clone https://github.com/AYapejian/node-red-contrib-home-assistant.git`
2. Install node dependencies as usual: `cd node-red-contrib-home-assistant && yarn`
3. Start the docker dev environment:   `yarn run dev`
a. _Note: First run will take a bit to download the images ( home-assistants image is over 1gb (yikes!) after that launch is much quicker)_
b. _Note: Also first run load of HomeAssistant web interface seems very slow, but after first time it's also much faster_
4. The `yarn run dev` command will leave you with a terminal spitting out logs, `ctrl+c` out of this and it kills all the servers by design, just run `yarn run dev` again to pick back up.  The following services and ports are launched in the `dev` script


| service                | port mappings            | info                                                                                                                            |
|------------------------|--------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| home-assistant         | `8123:8123`, `8300:8300` | exposed for local access via browser                                                                                            |
| node-red               | `1880:1880`, `9123:9229` | exposed for local access via browser, `9123` is used for debugging. Includes default flow example connected to `home-assistant` |                                     |

### Docker Tips
1. If you run into environment issues running `yarn run dev:clean` should remove all docker data and get you back to a clean state
2. All data will be discarded when the docker container is removed. You can map volumes locally to persist data.  Create and copy as directed below then modify `docker-compose.yaml` to map the container directories to the created host dirs below. _See: `./_docker/docker-compose.mapped.yaml` for an example or just use that file to launch manually_

```
mkdir -p _docker-volumes/home-assistant/config
mkdir -p _docker-volumes/node-red/data
cp _docker/home-assistant/root-fs/config/* _docker-volumes/home-assistant/config/
cp _docker/node-red/root-fs/data/*  _docker-volumes/node-red/data
```

### Node Debugger via VSCode
Optional but it's pretty nice if you have VSCode installed.
- Open the project directory in VSCode
- Go to the debug tab ( or `cmd/ctrl+shift+d`)
- In the debug tab you should see an target for "Attach: Docker", run that guy and you can place debug breakpoints and changes will be reloaded within docker automatically
- Open [http://localhost:8123](http://localhost:8123) for HomeAssistant (password is `password` by default).
- For node-red either open up via the HomeAssistant web link or left hand menu or just open a browser tab to [http://localhost:1880](http://localhost:1880)

### Other Dev Tips
* If you're using VSCode and annoyed that node-red html ( `type="x-red"` ) isn't syntax highlighted you can run force it by adding support.  Below is for Mac, can do the same manually on any platform however, note that this is a hack as I couldn't find any other good way to do this.

```shell
# For VSCode
sed -i .orig 's/text\/(javascript|ecmascript|babel)/text\/(javascript|ecmascript|babel|x-red)/' "/Applications/Visual Studio Code.app/Contents/Resources/app/extensions/html/syntaxes/html.json"

# For VSCode Insiders
sed -i .orig 's/text\/(javascript|ecmascript|babel)/text\/(javascript|ecmascript|babel|x-red)/' "/Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/extensions/html/syntaxes/html.json"
```

