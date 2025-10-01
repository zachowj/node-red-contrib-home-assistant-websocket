# Copilot Instructions for node-red-contrib-home-assistant-websocket

## Project Overview

Node-RED extension providing WebSocket and REST API integration with Home Assistant. TypeScript/JavaScript targeting Node.js v18.2+ and Node-RED v3.1.1+.

**Critical Setup (ALWAYS do first):**

```bash
corepack enable && corepack enable pnpm  # Enable pnpm
pnpm install                            # Install dependencies
```

## Architecture Patterns

- **Node Structure**: Each node in `src/nodes/` has 3 parts:
  - `index.ts`: Server-side logic with Joi validation
  - `editor.html`: Client UI with mustache templates
  - `editor.ts`: Client-side logic for Node-RED editor
- **Dual TypeScript Configs**:
  - `tsconfig.json`: Server code (Node.js runtime)
  - `tsconfig.editor.json`: Editor code (browser runtime)
- **Service Layers**: `src/common/` contains shared controllers, services, status management
- **HA Integration**: `src/homeAssistant/` handles WebSocket/HTTP communication

## Development Workflow

```bash
pnpm build     # Gulp build (~14s) - compiles TS, bundles assets
pnpm dev       # Start Node-RED dev server (ports 1880/3000)
pnpm test      # Vitest unit tests (481+ tests, ~5s)
pnpm lint      # ESLint + Prettier validation
```

**Node Development Pattern:**

```typescript
// Server logic (index.ts)
export interface NodeProperties extends BaseNodeProperties {
  action: string;
  data: string;
  // ... properties with Joi validation
}

const inputs: NodeInputs = {
  action: { property: "action", validate: Joi.string().required() },
};

// Controller pattern
class ActionController extends BaseController {
  protected async onInput({ message, parsedMessage }: InputMessage) {
    // Implementation
  }
}
```

## Key Conventions

- **Package Manager**: pnpm only (never npm)
- **Imports**: Use relative imports with `../../` prefixes
- **Error Handling**: `inputErrorHandler` wrapper for all node inputs
- **Status Management**: Use `Status` class for node status indicators
- **Testing**: Vitest with Node-RED test helpers, mocks in `test/mocks/`
- **Build Output**: `dist/` contains compiled JS, bundled HTML/CSS/JS

## Common Patterns

- **Entity Selection**: Use `entityId`, `deviceId`, `areaId` arrays with ID selector component
- **Data Processing**: `TypedInputService` for mustache/JSONata/json processing
- **Event Handling**: `ClientEvents` for WebSocket event subscriptions
- **Migration System**: Version-based property migrations in `migrations.ts`

## CI/CD Validation

- **Node Versions**: Tests Node.js 18/20/22
- **Node-RED Versions**: Tests v3.x and v4.x compatibility
- **Pre-commit**: Husky runs `pnpm test` (blocks failing commits)
- **Lint-staged**: Auto-fixes ESLint/Prettier on staged files

## Troubleshooting

- **Build Issues**: Delete `dist/` and rebuild
- **Type Errors**: Check if using server vs editor TypeScript config
- **Test Failures**: Ensure HA WebSocket mocks are properly configured
- **Editor Issues**: Client code must use browser-compatible APIs

## File Patterns

- **Node Implementation**: `src/nodes/{node}/index.ts`
- **Editor UI**: `src/nodes/{node}/editor.html`
- **Editor Logic**: `src/nodes/{node}/editor.ts`
- **Tests**: `test/unit/nodes/{node}/**/*.test.ts`
- **Shared Services**: `src/common/services/`
- **HA API**: `src/homeAssistant/`
