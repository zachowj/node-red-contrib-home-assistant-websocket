# Events: state

The Events: State node listens for state changes of entities within Home Assistant. It triggers a flow in Node-RED whenever an entity's state changes, allowing you to automate responses to various conditions, like turning on lights when motion is detected or sending a notification when a door is opened.

## Configuration:

### Entity <Badge text="required"/>

- Type: `string`

The entity ID is used to listen for state changes. This can be a entity ID, regex, or a substring. If a regex or substring is used, the node will listen for all entities that match.

Example:

- `light.kitchen` (entity) listens for state changes of the `light.kitchen` entity
- `^light.*` (regex) listens for state changes of all entities that start with `light.`
- `light` (substring) listens for state changes of all entities that contain `light` in the entity ID

### If State

- Type: `string`

If the conditional is evaluated as true send the message to the first output otherwise send it to the second output. If blank there will only be one output.

**Also see:**

- [Conditionals](/guide/conditionals.md)

### For

- Type: `number`

An amount of time an entity's state needs to be in that state before triggering.

::: warning
Output on Connect state changes will not start a timer.
:::

### State Type

::: warning DEPRECATED
This feature is being phased out and will be removed in version **1.0.0**.  
Use the **output properties** for state conversion moving forward.
:::

- Type: `string`
- Values: `string|number|boolean`
- Default: `string`

Convert the state of the entity to the selected type. Boolean will be converted to true based on if the string is equal by default to (`y|yes|true|on|home|open`). Original value stored in msg.data.original_state

### Ignore state change event

- Type: `boolean`

A list of possible states that will be ignored.

### Output on Connect

- Type: `boolean`

Output once on startup/deploy

<!-- @include: @snippets/node/expose-as.md -->

## Outputs

Value types:

- `event data`: full event object
- `entity id`: entity id of the triggered entity
- `entity state`: entity state of the triggered entity
- `config`: config properties of the node
