# Development

An environment with Home Assistant/Node Red can be easily spun up using docker and docker-compose along with built in VSCode debug enabled.

1. Clone this repository: `git clone https://github.com/zachowj/node-red-contrib-home-assistant-websocket.git`
2. Install node dependencies as usual: `cd node-red-contrib-home-assistant-websocket && npm`
3. Start the docker dev environment: `npm run dev`
   a. _Note: First run will take a bit to download the images ( home-assistants image is over 1gb (yikes!) after that launch is much quicker)_
   b. _Note: Also first run load of HomeAssistant web interface seems very slow, but after first time it's also much faster_
4. The `npm run dev` command will leave you with a terminal spitting out logs, `ctrl+c` out of this and it kills all the servers by design, just run `npm run dev` again to pick back up. The following services and ports are launched in the `dev` script

| service        | port mappings            | info                                                                                                                            |
| -------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| home-assistant | `8123:8123`, `8300:8300` | exposed for local access via browser                                                                                            |
| node-red       | `1880:1880`, `9123:9229` | exposed for local access via browser, `9123` is used for debugging. Includes default flow example connected to `home-assistant` |

## Docker Tips

1. If you run into environment issues running `npm run dev:clean` should remove all docker data and get you back to a clean state
2. All data will be discarded when the docker container is removed. You can map volumes locally to persist data. Create and copy as directed below then modify `docker-compose.yaml` to map the container directories to the created host dirs below. _See: `./_docker/docker-compose.mapped.yaml` for an example or just use that file to launch manually_

```bash
$ mkdir -p _docker-volumes/home-assistant/config
$ mkdir -p _docker-volumes/node-red/data
$ cp _docker/home-assistant/root-fs/config/* _docker-volumes/home-assistant/config/
$ cp _docker/node-red/root-fs/data/*  _docker-volumes/node-red/data
```

## Node Debugger via VSCode

Optional but it's pretty nice if you have VSCode installed.

- Open the project directory in VSCode
- Go to the debug tab ( or `cmd/ctrl+shift+d`)
- In the debug tab you should see an target for "Attach: Docker", run that guy and you can place debug breakpoints and changes will be reloaded within docker automatically
- Open [http://localhost:8123](http://localhost:8123) for HomeAssistant (password is `password` by default).
- For node-red either open up via the HomeAssistant web link or left hand menu or just open a browser tab to [http://localhost:1880](http://localhost:1880)
