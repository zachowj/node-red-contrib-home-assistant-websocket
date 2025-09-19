# Copilot Instructions for node-red-contrib-home-assistant-websocket

## Project Overview

This repository contains **node-red-contrib-home-assistant-websocket**, a Node-RED extension that provides a suite of nodes for seamless integration between Node-RED and Home Assistant through WebSocket and REST API connections. It's a TypeScript/JavaScript project targeting Node.js v18.2+ and Node-RED v3.1.1+.

### Key Statistics
- **Size**: Large project (~1,300+ dependencies, 405+ test cases)
- **Languages**: TypeScript (primary), JavaScript, HTML, CSS, Markdown
- **Runtime**: Node.js v18.2+, Node-RED v3.1.1+
- **Package Manager**: pnpm (v9.7.1) - **ALWAYS use pnpm, never npm**
- **Build System**: Gulp-based with TypeScript compilation
- **Testing**: Vitest framework
- **Documentation**: VuePress v2

## Development Environment Setup

### Prerequisites - CRITICAL ORDER
1. **Enable pnpm** (ALWAYS FIRST):
   ```bash
   corepack enable && corepack enable pnpm
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Setup development environment** (choose one):
   - **Quick setup**: `./scripts/setup.sh`
   - **Manual**: 
     ```bash
     mkdir .node-red
     cp -r .devcontainer/nodered/* .node-red
     pnpm link --dir .node-red
     ```

### Development Commands (Validated Working)

#### Build & Development
- **Clean build**: `pnpm build` (takes ~14s, uses Gulp)
- **Development mode**: `pnpm dev` (starts Node-RED on ports 1880 and 3000)
- **Documentation dev**: `pnpm docs:dev` (starts VuePress on port 8080)

#### Quality Assurance
- **Lint code**: `pnpm lint` (ESLint + Prettier, ~5s)
- **Fix lint issues**: `pnpm lint:fix`
- **Run tests**: `pnpm test` (Vitest, 405+ tests, ~5s)
- **Test with coverage**: `pnpm test:coverage`
- **Type check only**: `npx tsc --noEmit` (validates TypeScript without building)

#### Documentation
- **Build docs**: `pnpm docs:build` 
- **Format docs**: `pnpm docs:lint`

### Common Issues & Solutions

1. **TypeScript version warning**: ESLint shows TypeScript 5.9.2 warning but works fine
2. **Browserslist outdated**: Shows warning but doesn't affect builds
3. **Always clean before building**: Build artifacts are in `dist/` directory
4. **Node-RED development**: Access on port 3000 for browser-sync auto-reload

## Project Architecture

### Directory Structure
```
├── src/                    # TypeScript source code
│   ├── nodes/             # Node-RED node implementations
│   ├── editor/            # Node-RED editor components
│   ├── helpers/           # Utility functions
│   ├── homeAssistant/     # HA API integration
│   └── common/            # Shared services and types
├── test/                  # Vitest test files
├── docs/                  # VuePress documentation
├── dist/                  # Build output (generated)
├── gulpfile.js           # Build configuration
└── scripts/              # Development setup scripts
```

### Key Configuration Files
- **package.json**: Main project config, dependencies, scripts
- **tsconfig.json**: TypeScript compilation for Node.js runtime
- **tsconfig.editor.json**: TypeScript compilation for Node-RED editor
- **vitest.config.ts**: Test configuration
- **.eslintrc.js**: Linting rules (standard + TypeScript + Prettier)
- **gulpfile.js**: Complex build pipeline (CSS, JS, HTML, docs processing)
- **.prettierrc**: Code formatting (4 spaces, single quotes)

### Build Process (Gulp-based)
1. **Clean**: Removes dist/ directory
2. **Parallel tasks**:
   - TypeScript compilation (`src/` → `dist/`)
   - Editor files compilation (HTML, CSS, JS bundling)
   - Asset copying (icons, locales)
   - Documentation processing (Markdown → HTML)

## CI/CD & Validation

### GitHub Actions Workflows
- **ci.yml**: Runs on PR/push, tests Node.js 18/20 + Node-RED 3/3.1.1 matrix
- **documentation.yml**: Builds and deploys docs to GitHub Pages
- **publish.yml**: NPM package publishing
- **prerelease.yml**: Beta releases

### Pre-commit Hooks (Husky)
- **pre-commit**: Runs `pnpm test` (blocks commits if tests fail)
- **lint-staged**: Runs ESLint + Prettier on staged files

### Validation Steps
1. **Lint**: `pnpm lint` (must pass)
2. **Tests**: `pnpm test` (405+ tests, must all pass)
3. **Build**: `pnpm build` (must complete without errors)
4. **Type checking**: `tsc --noEmit` (implicit in build)

## Development Workflow

### Making Changes
1. **Always run tests first**: `pnpm test` to ensure baseline
2. **Make minimal changes**: Focus on specific functionality
3. **Validate continuously**: 
   ```bash
   pnpm lint && pnpm test && pnpm build
   ```
4. **Test in Node-RED**: Use `pnpm dev` for live testing

### Node-RED Integration Testing
- Development server runs on port 1880 (Node-RED) and 3000 (with browser-sync)
- Use `.node-red/` directory for testing flows
- Editor assets auto-rebuild on changes

### Documentation Changes
- Markdown files in `docs/` directory
- Use `pnpm docs:dev` for live preview
- VuePress builds are deployed automatically via GitHub Actions

## Dependencies & Ecosystem

### Key Dependencies
- **Node-RED**: v4.1.0 (dev), requires v3.1.1+ (runtime)
- **TypeScript**: v5.9.2
- **Home Assistant JS WebSocket**: v9.4.0
- **Build tools**: Gulp, Rollup, Sass, PostCSS
- **Testing**: Vitest, Node-RED test helpers

### File Patterns & Locations
- **Node implementations**: `src/nodes/*/index.ts` (server-side logic)
- **Editor components**: `src/nodes/*/editor.html` (UI), `src/nodes/*/editor.ts` (client-side logic)
- **Tests**: `test/**/*.test.ts` (Vitest format)
- **Documentation**: `docs/**/*.md` (VuePress)
- **Localization**: `locales/**/*.json` (translations)
- **Icons**: `icons/*.svg` (Node-RED node icons)
- **Build output**: `dist/` (auto-generated, gitignored)

### Critical Files to Never Modify
- `pnpm-lock.yaml` (dependency lock file)
- `dist/` directory (build artifacts)
- `.node-red/` directory (development environment)
- `resources/` directory (external libraries)

### Node-RED Specific Patterns
- Nodes have three parts: server logic (TypeScript), editor UI (HTML), editor logic (TypeScript)
- Node types follow pattern: `ha-*` or `api-*` or `server-*`
- Documentation is auto-generated from `docs/node/*.md` into node help panels

## Common Pitfalls

1. **Use pnpm, never npm**: Package manager is locked to pnpm
2. **Clean builds**: Delete `dist/` if encountering build issues
3. **TypeScript configs**: Two separate configs for server vs editor code
4. **Test scope**: 405+ tests must pass, don't break existing functionality
5. **Lint compliance**: Code must pass ESLint + Prettier checks
6. **Node versions**: CI tests Node.js 18 and 20, ensure compatibility

## Trust These Instructions

These instructions have been validated by running all commands and workflows. Only perform additional exploration if:
- Instructions appear incomplete for your specific task
- Commands fail unexpectedly
- You encounter errors not documented here

The build system is complex but stable when these patterns are followed.