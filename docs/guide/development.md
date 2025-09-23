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

7. Open a terminal in VS Code and run `pnpm dev` to start the development server.

### Local Setup

1. **Fork the Repository:**
   - Begin by forking the [Node-RED Home Assistant repository](https://github.com/zachowj/node-red-contrib-home-assistant-websocket) to your GitHub account.

1. **Clone Your Forked Repository:**
   - Clone the forked repository to your local machine:

     ```bash
     git clone https://github.com/<GITHUB_USER_NAME>/node-red-contrib-home-assistant-websocket
     ```

1. **Navigate to the Project Directory:**
   - Change to the project’s root directory:

     ```bash
     cd node-red-contrib-home-assistant-websocket
     ```

1. **Setup the Environment:**
   - You can either run the setup script or manually configure the environment:

   **Option A: Run the Setup Script**
   - Execute the provided setup script to automate the environment configuration:

     ```bash
     ./scripts/setup.sh
     ```

   **Option B: Manual Setup**
   - Alternatively, you can manually create a `.node-red` directory and link `pnpm`:

     ```bash
     mkdir .node-red
     corepack enable && corepack enable pnpm
     pnpm link --dir .node-red
     ```

1. **Start Node-RED:**
   - Launch Node-RED in development mode:

     ```bash
     pnpm dev
     ```

### Accessing the Development Server

After running `pnpm dev`, Node-RED will be available on ports 1880 and 3000. Access the development server at:

- [http://localhost:1880](http://localhost:1880)
- [http://localhost:3000](http://localhost:3000)

Port 3000 includes browser-sync, which will automatically reload the browser when changes are made to the editor source code.

### Linting

This project uses [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for code linting and formatting. Run the following command to lint the code:

```sh
pnpm lint
```

### Testing

To run the tests, use:

```sh
pnpm test
```
