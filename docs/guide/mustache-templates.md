# Mustache Templates

When using templates, the top level refers to a property of the message object. For example, `msg.payload` would be accessed as <code v-pre>{{payload}}</code>.

You can also access `flow`, `global`, and `states` contexts with the following syntax:

- `flow` context: <code v-pre>{{flow.foobar}}</code>
- `global` context: <code v-pre>{{global.something}}</code>
- `states` context: Use <code v-pre>{{entity.domain.entity_id}}</code> to get the state, or drill further down with <code v-pre>{{entity.light.kitchen.attributes.friendly_name}}</code>.

Note:

- <code v-pre>{{entity.light.kitchen}}</code> and <code v-pre>{{entity.light.kitchen.state}}</code> are equivalent.

By default, Mustache will replace certain characters with their HTML escape codes. To prevent this, use triple braces: <code v-pre>{{{payload}}}</code>.

::: warning
Mustache templates are ideal for handling strings. However, if you need to insert a JSON object, consider using a JSONata expression or handling it with a function node and passing it as an input.
:::
