---
sidebarDepth: 2
---

# Conditionals

## Rules

### `==`, `!=`, `is`, and `is not`

These operators check if a value is equal to or different from the expected value using the [equality](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality) operator. The `is` and `is not` are aliases for `==` and `!=`.

### `<`, `<=`, `>`, and `>=`

These operators compare values to determine if one is less than, less than or equal to, greater than, or greater than or equal to another value.

### `in` and `not in`

These operators check if a value is within a specified list of items. The list should be comma-separated.

#### Example

```yaml
in: "on,off"
```

### `includes` and `not includes`

These operators check if an array includes or does not include a specified value.

### `is null` and `is not null`

These operators check if a value is [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null) or not.

### `JSONata`

This rule expects a boolean result from evaluating a value using JSONata, a powerful expression language. More information can be found [here](https://jsonata.org/), with examples specific to Home Assistant [here](./jsonata/).

### `starts with`

This operator checks if a value begins with the expected string.

### `in group`

This operator checks if a value is present in the `attributes.entity_id` property of a given group.

## Value Types

### `string`, `number`, `boolean`, `regular expression`, and `JSONata expression`

These types evaluate and return the value as the specified type.

### `msg`, `flow`, and `global`

These refer to the different [contexts](https://nodered.org/docs/user-guide/context) within Node-RED.

### `entity` and `prevEntity`

These refer to the entities that triggered the node.

- `entity` refers to the current state entity.
- `prevEntity` refers to the previous state entity.

#### Examples

To reference the current state of the entity:

```yaml
entity.: "state"
```

To reference the brightness attribute of the entity:

```yaml
entity.: "attributes.brightness"
```
