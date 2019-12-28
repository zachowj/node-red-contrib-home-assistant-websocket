# Mustache Templates

When using templates the top level is a property of the message object:
`msg.payload` would be <code v-pre>{{payload}}</code>.

You can access flow, global, and states contexts <code
v-pre>{{flow.foobar}}</code> <code v-pre>{{global.something}}</code>. For the
`states` context you can use <code v-pre>{{entity.domain.entity_id}}</code> to
get the state or drill further down <code
v-pre>{{entity.light.kitchen.attributes.friendly_name}}</code>.

- <code v-pre>{{entity.light.kitchen}}</code> and <code v-pre>{{entity.light.kitchen.state}}</code> are equivalent

By default, Mustache will replace certain characters with their HTML escape
codes. To stop this happening, you can use triple braces:
<code v-pre>{{{payload}}}</code>.

::: warning
Mustache templates work well with strings but if you're trying to insert a JSON
object somewhere you're better off using a JSONata expression or doing with a
function node and passing it in as an input.
:::
