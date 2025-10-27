# Output Properties

### Types of Output Properties

#### **entity**

Outputs the **full state object** from Home Assistant. This includes all attributes, state, entity ID, and other metadata.

[About the state object](https://www.home-assistant.io/docs/configuration/state_object/#about-the-state-object)

#### **entity id**

Outputs the **entity ID** of the triggered entity.

#### **entity state**

Outputs the **current state** of the triggered entity.
All states received from Home Assistant are strings, but you can apply common type conversions:

- **number** – converts numeric strings to numbers
- **boolean** – converts strings to boolean values based on the following rules:
  - If the value is a number, it returns `true` for any non-zero number and `false` for zero.
  - If the value is a string, it trims and lowercases the string, returning `true` for "true", `false` for "false", or attempts to convert numeric strings to a boolean based on their numeric value.
  - For all other types or unrecognized values, it returns `false`.

- **Home Assistant boolean** – converts `"y"`, `"yes"`, `"true"`, `"on"`, `"home"`, and `"open"` to `true` boolean values and everything else to `false`. These can be customized in the server node config settings.

#### **config**

Outputs the **node’s configuration properties**.
