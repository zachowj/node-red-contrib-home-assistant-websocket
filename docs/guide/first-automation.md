# First Automation

For your first automation, let's keep it simple by setting up a light to turn on when the sun sets and off when it rises.

This example uses the `sun.sun` entity in Home Assistant, which has states `below_horizon` and `above_horizon`, to trigger the light.

## Events: State Node

1. Drag an **Events: state** node onto the workspace and double-click it to edit.

![screenshot](./images/first-automation_01.png)

## Entity ID Configuration

2. In the **Entity ID** field, enter `sun.sun`. This is the entity that will trigger the automation.

## If State Condition

3. The **If State** condition checks the entity's state when the node is triggered. If the condition is `true`, the message will be sent through the top output; if `false`, it will be sent through the bottom output. If no condition is set, all messages will pass through a single output.

   For this example, set the **If State** to `above_horizon`.

![screenshot](./images/first-automation_02.png)

## Action Node

4. Now, let's set up the actions that will be triggered. Most Home Assistant interactions are done through action calls, which we'll handle with the **Action** node.

5. Drag two **Action** nodes onto the workspace and connect them to the outputs of the **Events: state** node.

![screenshot](./images/first-automation_03.png)

- Since we set the **If State** to `above_horizon`, the top output will turn off the light, and the bottom output will turn it on.

6. Configure the **Action** nodes:
   - **Action**: `light.turn_off` (for the top output) and `light.turn_on` (for the bottom output)
   - **Entity**: `light.front_porch`

![screenshot](./images/first-automation_04.png)

## Complete Automation

7. Once you've configured everything, deploy your flow. You now have your first working automation in Node-RED!

![screenshot](./images/first-automation_05.png)

@[code](@examples/guides/first-automation/complete-automation.json)

---

**Related Resources:**

- [Importing and Exporting Flows](https://nodered.org/docs/user-guide/editor/workspace/import-export)
- [Action Node Documentation](/node/action.md)
- [Events: State Node Documentation](/node/events-state.md)
- [Conditionals in Node-RED](./conditionals.md)
