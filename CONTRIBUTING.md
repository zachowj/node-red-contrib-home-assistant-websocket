# Contributing

When contributing to this repository, please first discuss the change you wish to make via [GitHub Discussions](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/discussions/categories/feature-request).

## Development environment setup

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

### Accessing the development server

Node-RED will be running on ports 1880 and 3000. You can access the development server at http://localhost:1880. On port 3000 browser-sync is running and will reload the browser when changes are made to the editor source code.

## Issues and feature requests

You've found a bug in the source code, a mistake in the documentation or maybe you'd like a new feature? Take a look at [GitHub Discussions](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/discussions) to see if it's already being discussed. You can help us by [submitting an issue on GitHub](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues). Before you create an issue, make sure to search the issue archive -- your issue may have already been addressed!

Please try to create bug reports that are:

- _Reproducible._ Include steps to reproduce the problem.
- _Specific._ Include as much detail as possible: which version, what environment, etc.
- _Unique._ Do not duplicate existing opened issues.
- _Scoped to a Single Bug._ One bug per report.

**Even better: Submit a pull request with a fix or new feature!**

### How to submit a Pull Request

1. Search our repository for open or closed
   [Pull Requests](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/pulls)
   that relates to your submission. You don't want to duplicate effort.
2. Fork the project
3. Create your feature branch (`git checkout -b feat/amazing_feature`)
4. Commit your changes (`git commit -m 'feat: add amazing_feature'`)  
   node-red-contrib-home-assistant-websocket uses [conventional commits](https://www.conventionalcommits.org), so please follow the specification in your commit messages.
5. Push to the branch (`git push origin feat/amazing_feature`)
6. [Open a Pull Request](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare?expand=1)

### Testing

1. Run `npm run test` to run the tests.
