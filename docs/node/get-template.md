# Get Template

Can either set template in the node configuration or pass in the `msg.template` property of the incoming message. Passing template via `msg.template` will override the template string set in node configuration.

::: tip NOTE:
Node will output any Home Assistant API errors for catching with the 'catch all'
node
:::

## Configuration

### template

- Type: `string`

Jinja template to be rendered, discarded if `msg.template` is provided via input msg

### Template Location

Customizable location to output original template

### Results

Customizable location to output rendered template

## Inputs

### template

- Type: `string`

Jinja template to be rendered

## Outputs

### template

- Type: `string`

The original template sent to home assistant for rendering

### payload

- Type: `string`

The rendered template

## References

- [Home Assistant Template Docs](https://home-assistant.io/docs/configuration/templating/)
- [Jinja Docs](http://jinja.pocoo.org/docs/dev/templates/)
