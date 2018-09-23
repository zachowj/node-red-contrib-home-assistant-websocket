# Changelog

All notable changes to this project will be documented in this file.

## [0.0.2] - 2018.9.23

### Added

* Ability to filter event type from within the 'events: all' node
* Better error handling for refused connections and incorrect access token/password

### Changed

* Docker config you use Home Assistant 0.78.3 and node-red 8.12.0

### Fixed

* The ignoring of custom root path if set in node-red - [AYapejian/node-red-contrib-home-assistant/issues/41](https://github.com/AYapejian/node-red-contrib-home-assistant/issues/41)

## [0.0.1] - 2018.9.20

### Added

* Integrated [AYapejian/node-home-assistant](https://github.com/AYapejian/node-home-assistant) minus the CLI
* Ability to use Home Assistant long-lived access tokens

### Changed

* 'events: all', 'events: state', and 'trigger: state' to use websocket instead of the events stream
* 'poll state', 'call service', and 'current state' to use websocket instead of REST API
