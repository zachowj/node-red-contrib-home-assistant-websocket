# Development

Also see [CONTRIBUTING.md](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/blob/main/CONTRIBUTING.md).

## Environment setup

Here are the steps to successfully setup your development environment to contribute to this project

### Setup using the VS Code dev container

This will set up a docker container with all the required tools and dependencies to get started.

1. Go to the [Node-RED Home Assistant](https://github.com/zachowj/node-red-contrib-home-assistant-websocket) repository and fork it.

1. Clone your forked repository to your local machine.

   ```sh
   git clone https://github.com/<GITHUB_USER_NAME>/node-red-contrib-home-assistant-websocket
   ```

1. Open the project in VS Code.

1. Install the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.

1. Click the green button in the lower-left corner of the window that says "Reopen in Container".

1. Wait for the container to build and start.

1. Open a terminal in VS Code and run `npm run dev` to start the development server.

### Setup locally

1. Go to the [Node-RED Home Assistant](https://github.com/zachowj/node-red-contrib-home-assistant-websocket) repository and fork it.

1. Clone your forked repository to your local machine.

   ```sh
   git clone https://github.com/zachowj/node-red-contrib-home-assistant-websocket
   ```

1. create an npm link to your forked project. This will also build this project's dependencies.

   ```sh
   cd node-red-contrib-home-assistant-websocket
   npm link
   ```

1. [Install](https://nodered.org/docs/getting-started/local) Node-RED on localhost, assuming we install it on ~/dev directory (you can install it in another location as you wish)

   ```sh
   cd ~/dev/node-red
   npm install -g --unsafe-perm node-red
   ```

1. Install your fork project into local Node-RED using npm link:

   ```sh
   cd ~/dev/node-red
   npm link node-red-contrib-home-assistant-websocket
   ```

1. Starting Node-RED on localhost

   ```sh
   cd ~/dev/node_modules/node-red
   npm run dev
   ```

### Accessing

After running `npm run dev` Node-RED will be running on ports 1880 and 3000. You can access the development server at http://localhost:1880 or http://localhost:3000 either port can be used. On port 3000 browser-sync is running and will reload the browser when changes are made to the editor source code.

### Linting

This project uses [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) to lint and format the code. You can run `npm run lint` to lint the code.

### Testing

1. Run `npm run test` to run the tests.
