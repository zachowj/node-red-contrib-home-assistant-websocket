---
sidebarDepth: 2
---

# Conditionals

Conditionals define how node values are compared or evaluated in **If State** rules.
Each condition uses an **operator** and, optionally, a **value type** to determine how comparisons are made.

---

## Operators

### `==`, `!=`, `is`, and `is not`

These operators test whether two values are **equal** or **not equal**, using JavaScript’s [equality operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality).

- `is` is an alias for `==`
- `is not` is an alias for `!=`

> Example:
> `is "on"` → true if the entity state is `"on"`

---

### `<`, `<=`, `>`, and `>=`

These operators perform **numeric or lexicographic comparisons**, depending on the data type.

| Operator | Meaning                  |
| -------- | ------------------------ |
| `<`      | Less than                |
| `<=`     | Less than or equal to    |
| `>`      | Greater than             |
| `>=`     | Greater than or equal to |

> Example:
> Compare a temperature sensor value: `entity.state < 25`

---

### `in` and `not in`

These operators check if a value is **contained in** (or **not contained in**) a list.
The list can be either a **comma-separated string** or an **array**.

**Example:**

```yaml
in: "on,off"
```

This condition is true if the value equals either `"on"` or `"off"`.

::: tip

Use `in` and `not in` when comparing a state against multiple possible values — especially with [Home Assistant State Boolean](#home-assistant-boolean) types.

:::

---

### `includes` and `not includes`

These operators check whether an **array** includes (or does not include) a specified value.

> Example:
> Check if a user ID exists in an array of authorized users.

---

### `is null` and `is not null`

Checks whether a value is [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null) or not.

- `is null` → true if the value is `null`
- `is not null` → true if the value is **not** `null`

---

### `starts with`

Checks if a string **begins with** a given substring.

> Example:
> `"sensor.kitchen_temperature"` starts with `"sensor.kitchen"`

---

### `in group`

Checks whether an entity ID exists in the `attributes.entity_id` list of a specified Home Assistant **group**.

> Example:
> Returns true if the entity is part of `group.living_room_lights`.

---

### `JSONata`

Executes a [JSONata](https://jsonata.org/) expression, which must evaluate to a **boolean**.
JSONata allows complex, dynamic logic for advanced condition handling.

> For Home Assistant–specific examples, see [JSONata Expressions](./jsonata/).

---

## Value Types

Value types determine **how the comparison value is interpreted**.

### `string`, `number`, `boolean`, `regular expression`, and `JSONata expression`

These cast or evaluate the comparison value as the specified type before the condition is applied.

---

### `msg`, `flow`, and `global`

These reference the [Node-RED context](https://nodered.org/docs/user-guide/context) and allow comparisons against values stored in message, flow, or global context.

- `msg` → current message context
- `flow` → flow-level context
- `global` → global context shared across flows

---

### `entity` and `prevEntity`

These types reference the **current** and **previous** entity states that triggered the node.

- `entity` → current entity state
- `prevEntity` → previous entity state

**Examples**

To check the entity’s current state:

```yaml
entity.: "state"
```

To reference an attribute (e.g., brightness):

```yaml
entity.: "attributes.brightness"
```

---

### `Home Assistant State Boolean`

The `Home Assistant State Boolean` type uses the boolean mappings defined in your server’s [`State Boolean`](../node/config-server.md#state-boolean) configuration.

By default:

- **True values:** `y`, `yes`, `on`, `true`, `home`, `open`
- **False values:** Any other value

These true values are stored as an array, allowing you to use the [`in`](#in-and-not-in) and [`not in`](#in-and-not-in) operators for comparisons.
::: tip Note

Comparisons are case-sensitive. The configured state boolean values are normalized to lowercase when deployed, but entity state comparisons remain case-sensitive. Entity states from official Home Assistant integrations are typically lowercase, but user-defined entities (like `input_text`) may have capitalized values that will not match.

Use this type when you want to check whether an entity’s state matches one of your configured “true” values (for example, when testing if a light is “on” or a door is “open”). For user-controlled entities with potentially capitalized states, consider using a static list or flow/global context value instead.

:::
