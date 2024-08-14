# Development

For detailed contributing guidelines, refer to [CONTRIBUTING.md](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/blob/main/CONTRIBUTING.md).

## Environment Setup

Follow these steps to set up your development environment for contributing to this project:

### Using the VS Code Dev Container

This method sets up a Docker container with all required tools and dependencies.

1. Fork the [Node-RED Home Assistant repository](https://github.com/zachowj/node-red-contrib-home-assistant-websocket).

2. Clone your forked repository:

   ```sh
   git clone https://github.com/<GITHUB_USER_NAME>/node-red-contrib-home-assistant-websocket
   ```

3. Open the project in VS Code.

4. Install the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.

5. Click the green button in the lower-left corner labeled "Reopen in Container."

6. Wait for the container to build and start.

7. Open a terminal in VS Code and run `npm run dev` to start the development server.

### Local Setup

1. Fork the [Node-RED Home Assistant repository](https://github.com/zachowj/node-red-contrib-home-assistant-websocket).

2. Clone your forked repository:

   ```sh
   git clone https://github.com/<GITHUB_USER_NAME>/node-red-contrib-home-assistant-websocket
   ```

3. Navigate to the project directory and create an npm link, which also builds the project's dependencies:

   ```sh
   cd node-red-contrib-home-assistant-websocket
   npm link
   ```

4. [Install Node-RED](https://nodered.org/docs/getting-started/local) locally. This example assumes installation in the `~/dev` directory:

   ```sh
   cd ~/dev/node-red
   npm install -g --unsafe-perm node-red
   ```

5. Link your forked project to the local Node-RED installation:

   ```sh
   cd ~/dev/node-red
   npm link node-red-contrib-home-assistant-websocket
   ```

6. Start Node-RED:

   ```sh
   cd ~/dev/node_modules/node-red
   npm run dev
   ```

### Accessing the Development Server

After running `npm run dev`, Node-RED will be available on ports 1880 and 3000. Access the development server at:

- [http://localhost:1880](http://localhost:1880)
- [http://localhost:3000](http://localhost:3000)

Port 3000 includes browser-sync, which will automatically reload the browser when changes are made to the editor source code.

### Linting

This project uses [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for code linting and formatting. Run the following command to lint the code:

```sh
npm run lint
```

### Testing

To run the tests, use:

```sh
npm run test
```
