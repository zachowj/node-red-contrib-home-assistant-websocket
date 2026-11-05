# Breaking Changes

## Version 1.0.0

(Upcoming release)

### Removed `timeSinceChangedMs` from entities

The `timeSinceChangedMs` property is no longer added to entity objects (`msg.data`, `new_state`, `entity`, etc.). Use the new **time since changed (ms)** output property type, or calculate it from `last_changed` in JSONata, for example `$millis() - $toMillis(data.last_changed)`.

### Removed State Type

The **State Type** option has been removed from the _current state_, _events: state_, _trigger: state_, and _poll state_ nodes. You can now cast the state value using **Output Properties**, but casting before the condition check is no longer supported.

Previously, casting to a Home Assistant STate Boolean converted the entity state of `"on"` to `true` and `"off"` to `false`, allowing condition checks against boolean values. Now, conditions must compare the state directly to the string values `"on"` or `"off"`.
