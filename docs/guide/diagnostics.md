# Diagnostics Flow

## Overview

To assist with troubleshooting, a button has been added to the Node-RED editor that will run a diagnostics flow and copy the output to the clipboard. This output can then be pasted into a GitHub issue or a support forum.

::: tip Note
Before version 0.62.0, the diagnostics flow was a separate flow that had to be imported into Node-RED. This flow is still available and can be found [here](#before-version-0-62-0).
:::

![screenshot of buton location](./images/diagnostics_04.png)

![gif for finding button](./images/diagnostics_05.gif)

## Before version 0.62.0

The supplied diagnostics flow serves as a valuable tool for collecting data about the runtime and the system environment. This flow can be [imported](https://nodered.org/docs/user-guide/editor/workspace/import-export) into Node-RED and run. By doing so, it compiles crucial information regarding the runtime and the system environment, enabling users to easily share this data when addressing issues.

### Flow

![screenshot](./images/diagnostics_01.png)

@[code](@examples/diagnostic.json)

This flow can also be imported directly from the examples section in Node-RED.

- [How to import a flow](https://nodered.org/docs/user-guide/editor/workspace/import-export)

### Usage

1. Import the flow into Node-RED.

2. Deploy the flow.

3. Click the `Inject` node to run the flow.

![screenshot of debug window](./images/diagnostics_02.png)

4. Copy the output from the `Debug` tab.

![screenshot of debug window](./images/diagnostics_03.png)

5. Paste the output into a GitHub issue or a support ticket.
