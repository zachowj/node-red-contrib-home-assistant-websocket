# Copilot Instructions for node-red-contrib-home-assistant-websocket

## Project Overview

Node-RED extension providing WebSocket and REST API integration with Home Assistant. Built with TypeScript for both Node.js runtime and browser-based editor.

**Tech Stack:**

- **Runtime**: Node.js v18.2+, Node-RED v3.1.1+
- **Language**: TypeScript (dual configs for server/client)
- **Package Manager**: pnpm v10.20.0 (required, never use npm)
- **Build System**: Custom build.js (esbuild, SASS, HTML processing)
- **Testing**: Vitest (481+ unit tests)
- **HA Integration**: WebSocket + REST API (requires HA 2024.3+)

**Critical First-Time Setup:**

```bash
corepack enable && corepack enable pnpm  # Enable pnpm
pnpm install                             # Install dependencies
pnpm build                               # Initial build
```

## Architecture Patterns

### Node Structure (3-Part System)

Each node in `src/nodes/{node}/` consists of:

1. **`index.ts`** - Server-side logic (Node.js runtime)
   - TypeScript with Joi validation
   - Controller pattern extending `BaseController`
   - InputService for message parsing
   - Compiled via `tsconfig.json`

2. **`editor.html`** - Client UI definition
   - Mustache templates for rendering
   - HTML form controls for configuration
   - Localization support via `data-i18n`
   - Bundled into dist during build

3. **`editor.ts`** - Client-side logic (browser runtime)
   - Node-RED editor integration
   - UI interactions and form validation
   - Compiled via `tsconfig.editor.json`
   - Must use browser-compatible APIs only

### Dual TypeScript Configurations

- **`tsconfig.json`**: Server code targeting Node.js
  - Compiles `src/nodes/**/index.ts`
  - Can use Node.js APIs (fs, path, etc.)
- **`tsconfig.editor.json`**: Editor code targeting browsers
  - Compiles `src/**/*.ts` excluding `index.ts`
  - Browser-only APIs (DOM, localStorage, etc.)
  - No Node.js modules allowed

### Directory Structure

- **`src/nodes/`**: Individual node implementations (30+ nodes)
- **`src/common/`**: Shared services and controllers
  - `controllers/`: Base controller classes
  - `services/`: InputService, TypedInputService, JSONataService
  - `status/`: Node status management
  - `events/`: ClientEvents for HA WebSocket
- **`src/homeAssistant/`**: HA communication layer
  - WebSocket client
  - HTTP API client
  - Event subscriptions
- **`src/helpers/`**: Utility functions
- **`src/types/`**: TypeScript type definitions
- **`test/`**: Vitest unit tests with mocks

## Development Workflow

### Essential Commands

```bash
pnpm build     # Production build (~14s) - compiles TS, bundles assets
pnpm dev       # Development server with watch mode (ports 1880/3000)
pnpm test      # Run all unit tests (481+ tests, ~5s)
pnpm test:watch # Watch mode for test development
pnpm test:coverage # Generate coverage reports
pnpm lint      # ESLint + Prettier validation
pnpm lint:fix  # Auto-fix linting issues
```

### Build Process Details

The custom `build.js` script handles:

- **TypeScript compilation**: Two separate builds (server + editor)
- **SASS compilation**: Converts SCSS to CSS with autoprefixer
- **HTML processing**: Bundles editor.html with inlined CSS/JS
- **Asset copying**: Icons, locales, resources to dist/
- **Watch mode**: Auto-rebuilds on file changes during `pnpm dev`

### Testing Strategy

- **Framework**: Vitest with 481+ unit tests
- **Mocks**: Node-RED and HA WebSocket mocks in `test/mocks/`
- **Coverage**: v8 provider, HTML reports in `coverage/`
- **Patterns**: Test files mirror source structure `test/unit/nodes/{node}/*.test.ts`
- **Run tests after edits**: Always verify changes don't break existing functionality

### Node Development Pattern

**Complete Example Structure:**

```typescript
// src/nodes/action/index.ts - Server-side implementation
import Joi from "joi";
import { createControllerDependencies } from "../../common/controllers/helpers";
import { inputErrorHandler } from "../../common/errors/inputErrorHandler";
import InputService, {
  NodeInputs,
  ParsedMessage,
} from "../../common/services/InputService";
import Status from "../../common/status/Status";
import {
  BaseNode,
  BaseNodeProperties,
  OutputProperty,
} from "../../types/nodes";

// 1. Define node properties interface
export interface ActionNodeProperties extends BaseNodeProperties {
  action: string; // Home Assistant action (e.g., "light.turn_on")
  data: string; // Action data payload
  dataType: string; // Type: json, jsonata, msg, flow, global
  areaId?: string[]; // Target area IDs
  deviceId?: string[]; // Target device IDs
  entityId?: string[]; // Target entity IDs
  queue: Queue; // Message queue behavior
  outputProperties: OutputProperty[];
  blockInputOverrides: boolean;
}

export interface ActionNode extends BaseNode {
  config: ActionNodeProperties;
}

// 2. Define input mappings with validation
const inputs: NodeInputs = {
  action: {
    messageProp: "payload.action", // Read from msg.payload.action
    configProp: "action", // Fallback to node config
  },
  data: {
    messageProp: "payload.data",
    configProp: "data",
    default: {}, // Default value if not provided
  },
};

// 3. Joi validation schema
const inputSchema: Joi.ObjectSchema = Joi.object({
  action: Joi.string().required(),
  data: Joi.alternatives(Joi.string().allow(""), Joi.object()).required(),
  target: Joi.object()
    .keys({
      area_id: Joi.alternatives(Joi.string(), Joi.array()).optional(),
      device_id: Joi.alternatives(Joi.string(), Joi.array()).optional(),
      entity_id: Joi.alternatives(Joi.string(), Joi.array()).optional(),
    })
    .optional(),
});

// 4. Controller implementation
class ActionController extends BaseController<ActionNodeProperties> {
  protected async onInput({ message, parsedMessage }: InputMessage) {
    const { action, data } = parsedMessage;

    // Business logic here
    const result = await this.homeAssistant.websocket.callService(
      action.value,
      data.value,
    );

    // Set status and send output
    this.status.setSuccess("Completed");
    this.node.send({ payload: result });
  }
}

// 5. Node registration
export default function actionNode(
  this: ActionNode,
  config: ActionNodeProperties,
) {
  RED.nodes.createNode(this, config);
  this.config = migrate(config);

  const controllerDeps = createControllerDependencies(this, config);
  const controller = new ActionController(controllerDeps);
  const inputService = new InputService<ActionNodeProperties>({
    inputs,
    nodeConfig: config,
    schema: inputSchema,
  });

  // Input handler
  this.on(
    "input",
    inputErrorHandler(async (message: NodeMessage) => {
      const parsedMessage = await inputService.parse(message);
      await controller.onInput({ message, parsedMessage });
    }, this),
  );

  controller.init();
}
```

**Key Patterns:**

- **Properties Interface**: Always extend `BaseNodeProperties`
- **Input Mapping**: Use `messageProp` + `configProp` for flexible input
- **Validation**: Joi schemas ensure type safety at runtime
- **Controller Pattern**: Business logic in `onInput` method
- **Error Handling**: `inputErrorHandler` wrapper catches and reports errors
- **Status Updates**: Use `Status` class for visual feedback in Node-RED UI

## Key Conventions

- **Package Manager**: pnpm only (never npm)
- **Imports**: Use relative imports with `../../` prefixes
- **Error Handling**: `inputErrorHandler` wrapper for all node inputs
- **Status Management**: Use `Status` class for node status indicators
- **Testing**: Vitest with Node-RED test helpers, mocks in `test/mocks/`
- **Build Output**: `dist/` contains compiled JS, bundled HTML/CSS/JS
- **Code Style**: ESLint + Prettier enforced via pre-commit hooks
- **Migration System**: Version-based schema updates in `migrations.ts`

## Common Patterns

### Entity/Device/Area Selection

```typescript
// Node config uses arrays for multi-selection
entityId?: string[];    // Selected entity IDs
deviceId?: string[];    // Selected device IDs
areaId?: string[];      // Selected area IDs
floorId?: string[];     // Selected floor IDs
labelId?: string[];     // Selected label IDs
```

### Data Processing with TypedInputService

```typescript
import TypedInputService from "../../common/services/TypedInputService";

// Supports: msg, flow, global, jsonata, json, mustache
const typedInputService = new TypedInputService({
  nodeConfig: config,
  context: this.context(),
  message,
});

const value = await typedInputService.getValue(
  config.data, // The value or expression
  config.dataType, // Type: 'msg', 'jsonata', 'json', etc.
);
```

### Event Handling with ClientEvents

```typescript
import ClientEvents from "../../common/events/ClientEvents";

// Subscribe to Home Assistant events
const clientEvents = new ClientEvents({
  node: this,
  emitter: this.homeAssistant.websocket,
});

clientEvents.addListener("ha_client:close", () => {
  this.status.setFailed("Disconnected");
});

clientEvents.addListener("ha_client:running", () => {
  this.status.setSuccess("Connected");
});
```

### Status Management

```typescript
import Status from "../../common/status/Status";

const status = new Status({ node: this });

status.setSuccess("Action completed");
status.setFailed("Connection lost");
status.setSending("Processing...");
status.setText("Custom status");
```

### Message Queue Patterns

```typescript
// Queue types for handling multiple inputs
enum Queue {
  None = "none", // No queuing, parallel execution
  First = "first", // Queue, process in order
  All = "all", // Queue all messages
  Last = "last", // Only process latest message
}
```

## CI/CD Validation

- **Node Versions**: Tests Node.js 18/20/22
- **Node-RED Versions**: Tests v3.x and v4.x compatibility
- **Pre-commit**: Husky runs `pnpm test` (blocks failing commits)
- **Lint-staged**: Auto-fixes ESLint/Prettier on staged files
- **Coverage**: Vitest coverage reports in `coverage/` directory

## Troubleshooting

- **Build Issues**: Delete `dist/` and rebuild with `pnpm build`
- **Type Errors**: Check if using server vs editor TypeScript config
  - Server code: `tsconfig.json` (Node.js APIs allowed)
  - Editor code: `tsconfig.editor.json` (browser APIs only)
- **Test Failures**: Ensure HA WebSocket mocks are properly configured
- **Editor Issues**: Client code must use browser-compatible APIs
- **Import Errors**: Use relative imports, not absolute paths
- **pnpm Issues**: Ensure corepack is enabled: `corepack enable pnpm`

## Important Notes

- **Never use npm**: Project requires pnpm v10.20.0
- **Dual compilation**: Server and editor code compile separately
- **Testing**: Run tests before committing (enforced by Husky)
- **Status visibility**: Use Status class for user feedback in Node-RED UI
- **Input validation**: Always use Joi schemas for runtime type safety
- **Error handling**: Wrap input handlers with `inputErrorHandler`

## File Patterns

- **Node Implementation**: `src/nodes/{node}/index.ts`
- **Editor UI**: `src/nodes/{node}/editor.html`
- **Editor Logic**: `src/nodes/{node}/editor.ts`
- **Tests**: `test/unit/nodes/{node}/**/*.test.ts`
- **Shared Services**: `src/common/services/`
- **HA API**: `src/homeAssistant/`
- **Type Definitions**: `src/types/`
- **Migrations**: `src/nodes/{node}/migrations.ts`
