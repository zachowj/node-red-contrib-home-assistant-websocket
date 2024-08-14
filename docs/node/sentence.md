# Sentence

The Sentence node triggers when the Home Assistant [Assist](https://www.home-assistant.io/voice_control/) feature matches a sentence from a voice assistant using the default [conversation agent](https://www.home-assistant.io/integrations/conversation/). This node is used for voice control integrations, allowing specific voice commands to trigger automations within Node-RED.

Sentences are allowed to use some basic template syntax. Check Home Assistant [documentation](https://www.home-assistant.io/docs/automation/trigger/#sentence-trigger) for more information.

::: warning
_Needs [Custom Integration](https://github.com/zachowj/hass-node-red) installed
in Home Assistant for this node to function_
:::

## Configuration

### Sentences

- Type: `string`

A list of sentences to match. Sentences are allowed to use some basic template syntax. Check Home Assistant [documentation](https://www.home-assistant.io/docs/automation/trigger/#sentence-trigger) for more information.

### Expose as

- Type: `string`

When an entity is selected a switch entity will be created in Home Assistant. Turning on and off this switch will disable/enable the nodes in Node-RED.

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
