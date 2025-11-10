# Issues Guide

This guide explains specific issues that may appear in the **Issues** tab for various nodes.

## State Type Deprecation

### TL;DR / Simple Case

:::tip

If you’re seeing a **State Type deprecated** warning and your node doesn’t use an **If State** condition or any **Output Properties**, you only need to update one setting:

1. Edit the node.
1. Set **State Type** to **`string`** (from `number` or `boolean`).
1. Save the node and **Redeploy** your flow.
   That’s it — the warning will disappear, and your flow will continue to work as before.

:::

### Details

The **State Type** option is being removed. Any conversion of entity states to numbers or booleans will no longer occur. You may need to update your flows if they relied on those conversions.

Previously, the **State Type** setting worked as follows:

- If set to `number`, a state like `"42"` was converted to the number `42`.
- If set to `boolean`, the state was converted to `true` if it matched a [HA State Boolean](../node/config-server.md#state-boolean) value defined in the Home Assistant server configuration (e.g., `"on"`, `"open"`), or `false` otherwise.

These conversions happened **before** any conditions were evaluated or the state value was output.

In the new behavior, states are always treated as **strings** when evaluated in conditions.

For **Output Properties**, you now have full control over how the entity state is cast. The entity state can be set to one of the following types:

<!-- @include: ./output-properties.md#entity-state -->

:::tip Note

Conversion now happens **only** when explicitly configured in **Output Properties**, rather than automatically through the deprecated **State Type** field.

:::

For **event nodes**, event data in `msg.data`—including `old_state.state` and `new_state.state`—will no longer be converted based on the deprecated **State Type** setting.
