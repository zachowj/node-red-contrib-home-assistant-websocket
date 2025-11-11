# Output Properties

### Types of Output Properties

#### entity

Outputs the **full state object** from Home Assistant. This includes all attributes, state, entity ID, and other metadata.

[About the state object](https://www.home-assistant.io/docs/configuration/state_object/#about-the-state-object)

#### entity id

Outputs the **entity ID** of the triggered entity.

#### entity state

Outputs the **current state** of the triggered entity.
All states received from Home Assistant are strings, but you can apply common type conversions:

<!-- #region entity-state -->

- **string** (default): No conversion is applied; the state remains as text.
- **number**: Converts the state to a numeric value.
- **boolean**: Converts the state to `true` or `false` using standard logic:
  - If the value is already a boolean, it’s used as-is.
  - Numbers: non-zero values become `true`, and `0` becomes `false`.
  - Strings: `"true"` → `true`, `"false"` → `false`, numeric strings like `"1"` or `"42"` → `true`, and `"0"` → `false`.
  - Any other or unrecognized value results in `false`.

- **Home Assistant [State Boolean](../node/config-server.md#state-boolean)**: Converts the state to `true` if it matches one of the configured true values (e.g., `"on"`, `"open"`, `"locked"`), otherwise `false`.

<!-- #endregion entity-state -->

#### config

Outputs the **node’s configuration properties**.
