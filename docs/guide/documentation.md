# Documentation

The documentation is built with [VuePress v2](https://v2.vuepress.vuejs.org/). The pages are written in Markdown and are located in the `docs` directory.

## Small changes

If you want to make small changes to the documentation, you can do so directly in the GitHub web interface. Just navigate to the file you want to change and click the pencil icon in the top right corner.

There is a link on the bottom of each page to edit the file directly in the GitHub web interface.

## Local development

If you want to make larger changes to the documentation, you can clone the repository.

### Developing with Visual Studio Code and Docker

1. Install [Visual Studio Code](https://code.visualstudio.com/).
1. Install the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.
1. Go to the [Node-RED Home Assistant](https://github.com/zachowj/node-red-contrib-home-assistant-websocket) repository and fork it.
1. Clone your forked repository to your local machine.

   ```sh
   git clone https://github.com/<GITHUB_USER_NAME>/node-red-contrib-home-assistant-websocket
   ```

1. Open the repository in Visual Studio Code.
1. Click on the green "Open a Remote Window" button in the bottom left corner and select "Reopen in Container".
1. Open a terminal in Visual Studio Code and run `npm install --save-dev` to install the dependencies.
1. Run `npm run docs:dev` to start the development server.

### Manual environment

1. Install [Node.js](https://nodejs.org/).
1. Go to the [Node-RED Home Assistant](https://github.com/zachowj/node-red-contrib-home-assistant-websocket) repository and fork it.
1. Clone your forked repository to your local machine.

   ```sh
   git clone https://github.com/<GITHUB_USER_NAME>/node-red-contrib-home-assistant-websocket
   ```

1. Open the repository in your favorite editor.
1. Run `npm install --save-dev` to install the dependencies.
1. Run `npm run docs:dev` to start the development server.
