# Issues Guide

This guide explains specific issues that may appear in the **Issues** tab for various nodes.

---

## State Type Deprecation

The **State Type** option has been **deprecated** and will be **removed** in the version 1.0 release. This guide explains what that means, why it matters, and how to update your flows.

### TL;DR — Simple Fix

:::tip Note

If you’re seeing a **State Type deprecated** warning and your node doesn’t use an **If State** condition or any **Output Properties**, you only need to update one setting:

1. Edit the node.
1. Set **State Type** to **`string`** (from `number` or `boolean`).
1. Save the node and **Redeploy** your flow.
   That’s it — the warning will disappear, and your flow will continue to work as before.

:::

### Background: What Changed

Previously, the **State Type** setting automatically converted entity states before they were evaluated or output:

| State Type | Behavior                                                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `string`   | No conversion; the state is treated as a string (e.g., `"42"`, `"on"`, `"locked"`, `"true"`)                                                              |
| `number`   | Converts `"42"` → `42`                                                                                                                                    |
| `boolean`  | Converts to `true` or `false` based on [Home Assistant State Boolean values](../node/config-server.md#state-boolean) (e.g., `"on"`, `"open"`, `"locked"`) |

These conversions happened **automatically**, even before **If State** conditions or **Output Properties** were applied.

Now, entity states are always treated as **strings** unless you explicitly convert them.
This makes behavior more predictable and consistent.

---

### Updating “If State” Conditions

If your node uses **If State** conditions that depended on the old `State Type` behavior, update them as follows:

1. Edit the node.
1. For each **If State** condition:
   - Set **Value Type** to `number` if you want to compare the state as a number.
   - Set **Value Type** to `Home Assistant State Boolean` if you want to check whether the state matches one of your configured boolean values.
     - `Home Assistant State Boolean` comparisons are only available with the `in` and `not in` operators.

1. Save the node and **Redeploy** your flow.

This ensures your logic continues to work as expected with explicit, type-safe comparisons.

---

### Updating “Output Properties”

You now have full control over how the entity state is cast within **Output Properties**.

The entity state can be explicitly set to one of the following types:

<!-- @include: ./output-properties.md#entity-state -->

---

### Event Nodes

For **event nodes**, data in `msg.data` — including `old_state.state` and `new_state.state` — will **no longer** be converted automatically based on the **State Type** setting.
All state values are now delivered as **strings**, unless you explicitly convert them elsewhere in your flow.

---

### Summary

| Before                                             | After                                                             |
| -------------------------------------------------- | ----------------------------------------------------------------- |
| Automatic state conversion based on **State Type** | Explicit conversion using **Value Type** or **Output Properties** |
| States may be `number` or `boolean` automatically  | States are always **strings** by default                          |
| Hidden conversions inside nodes                    | Transparent, user-controlled type casting                         |

---

::: tip Recommendation

For best results:

- Always treat entity states as **strings** unless your flow explicitly requires numeric or boolean logic.
- Review any custom nodes or function nodes that expect numeric/boolean states.
- Use the **Value Type** and **Output Properties** options for clarity and maintainability.

:::
