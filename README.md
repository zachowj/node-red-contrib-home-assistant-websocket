# node-red-contrib-home-assistant-websocket

[![Release Version][release-shield]][release-link] [![Build Status][buildstatus-shield]][buildstatus-link] [![License][license-shield]](LICENSE.md)

[![BuyMeCoffee][buymecoffee-shield]][buymecoffee-link]

Various nodes to assist in setting up automation using [Node-RED](https://nodered.org/) communicating with [Home Assistant](https://home-assistant.io/).

## Getting Started

Documentation can be found [here](https://zachowj.github.io/node-red-contrib-home-assistant-websocket/).

### Prerequisites

Have Node-RED installed and working, if you need to
install Node-RED see [here](https://nodered.org/docs/getting-started/installation).

- [Node.js](https://nodejs.org) v18.2.0+
- [Node-RED](https://nodered.org/) v3.1.1+
- [Home Assistant](https://home-assistant.io) v2023.12+

### Installation

Install via Node-RED Manage Palette

```
node-red-contrib-home-assistant-websocket
```

Install via npm

```shell
$ cd ~/.node-red
$ npm install node-red-contrib-home-assistant-websocket
# then restart node-red
```

For [Home Assistant](https://www.home-assistant.io/hassio/) add-on users:

The Community add-on ships with this node right out of the box.

Under the server node config just check the checkbox for `I use the Home Assistant Add-on`

The add-on can be found here: <https://github.com/hassio-addons/addon-node-red#readme>

## Contribute

- [Setting up Development Environment](https://zachowj.github.io/node-red-contrib-home-assistant-websocket/guide/development.html)
- [Help with Documentation](https://zachowj.github.io/node-red-contrib-home-assistant-websocket/guide/documentation.html)

## Contributors

[List of all contributors](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/graphs/contributors)

[buildstatus-shield]: https://img.shields.io/github/actions/workflow/status/zachowj/node-red-contrib-home-assistant-websocket/ci.yml?branch=main&style=for-the-badge
[buildstatus-link]: https://github.com/zachowj/node-red-contrib-home-assistant-websocket/actions
[license-shield]: https://img.shields.io/github/license/zachowj/node-red-contrib-home-assistant-websocket.svg?style=for-the-badge
[release-link]: https://github.com/zachowj/node-red-contrib-home-assistant-websocket/releases
[release-shield]: https://img.shields.io/github/v/release/zachowj/node-red-contrib-home-assistant-websocket?style=for-the-badge
[buymecoffee-link]: https://www.buymeacoffee.com/zachowj
[buymecoffee-shield]: https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png
