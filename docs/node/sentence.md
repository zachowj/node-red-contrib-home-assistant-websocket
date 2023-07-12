# Sentence

A sentence trigger fires when [Assist](https://www.home-assistant.io/voice_control/) matches a sentence from a voice assistant using the default [conversation agent](https://www.home-assistant.io/integrations/conversation/).

Sentences are allowed to use some basic template syntax. Check Home Assistant [documentation](https://www.home-assistant.io/docs/automation/trigger/#sentence-trigger) for more information.

::: warning
_Needs [Custom Integration](https://github.com/zachowj/hass-node-red) installed
in Home Assistant for this node to function_
:::

## Configuration

### Sentences

- Type: `string`

A list of sentences to match. Sentences are allowed to use some basic template syntax. Check Home Assistant [documentation](https://www.home-assistant.io/docs/automation/trigger/#sentence-trigger) for more information.

## Outputs

Value types:

- `trigger id`: sentence that triggered the flow
- `config`: config properties of the node

## Examples

<InfoPanelOnly>

[link](https://zachowj.github.io/node-red-contrib-home-assistant-websocket/node/sentence.html#examples)

</InfoPanelOnly>

<DocsOnly>

![screenshot](./images/sentence_01.png)

@[code](@examples/node/sentence/sentence_usage.json)

</DocsOnly>
