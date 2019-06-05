# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.12.3"></a>

## [0.12.3](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.12.2...v0.12.3) (2019-06-05)

### Bug Fixes

- **current-state:** fix for none type for state and data location ([79fcf29](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/79fcf29)), closes [#126](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/126)

<a name="0.12.2"></a>

## [0.12.2](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.12.1...v0.12.2) (2019-06-02)

### Bug Fixes

- **wait-until:** removed leftover code that was breaking events ([4231717](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/4231717))

<a name="0.12.1"></a>

## [0.12.1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.12.0...v0.12.1) (2019-06-01)

### Bug Fixes

- Remove authorization from static files ([50352c1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/50352c1)), closes [#125](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/125)

<a name="0.12.0"></a>

# [0.12.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.11.0...v0.12.0) (2019-05-31)

### Bug Fixes

- **config-server:** trying to get global namespace before it created ([4472072](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/4472072))
- css change for node label ([22c645f](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/22c645f))
- css fixes for 'if state' text boxes ([78a2707](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/78a2707))
- fixed error reporting so catch node could be used ([861c8e8](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/861c8e8)), closes [#119](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/119)
- more error reporting fixes ([89346e2](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/89346e2))
- Update autocomplete on server change in ui ([c8b2e09](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/c8b2e09))

### Features

- if 'if state' = true now outputs to the first output ([9fdc6f5](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/9fdc6f5))
- **call-service:** Ability to use alt tags for mustache templates ([0624570](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/0624570)), closes [#117](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/117)
- **current-state:** Added ability to block input overrides to config ([9d46441](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/9d46441))
- **trigger-state:** More options for custom outputs ([3df9c18](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/3df9c18))

<a name="0.11.0"></a>

# [0.11.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.10.2...v0.11.0) (2019-05-07)

### Bug Fixes

- **base-node:** fix for using in/not in with context of msg/flow ([49b9c26](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/49b9c26))
- show msg for current state not and not others ([d2c7929](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d2c7929))
- use relative path for haltif.js for hassio ingress ([beb556a](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/beb556a))
- **mustache-context:** Fix for using both states/entity for templates ([4b09811](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/4b09811))

### Features

- **current-state:** able to override config entity id from payload ([9217e09](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/9217e09)), closes [#115](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/115)

<a name="0.10.2"></a>

## [0.10.2](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.10.1...v0.10.2) (2019-04-07)

### Bug Fixes

- **events-all:** only send home_assistant_client events when needed ([67857b5](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/67857b5))
- **ha-websocket:** Reset states/servicesLoaded on disconnect ([9af4807](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/9af4807))

<a name="0.10.1"></a>

## [0.10.1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.10.0...v0.10.1) (2019-04-04)

<a name="0.10.0"></a>

# [0.10.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.9.1...v0.10.0) (2019-04-04)

### Bug Fixes

- **api:** Fix for saving locationType ([bd20bfa](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/bd20bfa))
- **call-service:** Fix for having undefined output location and type ([3a0d8b0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/3a0d8b0))
- **wait-until:** fixed scope for setContextValue ([3fdfa27](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/3fdfa27))

### Features

- **api:** Allows input to set/override config values ([7296cd2](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/7296cd2)), closes [#100](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/100)
- Able to reference entity in comparators ([ece176b](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/ece176b))
- **api:** Output type added to http api: binary, json,txt ([9305c7d](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/9305c7d))
- **events-all:** Added states_loaded and services_loaded ([b8097b8](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/b8097b8))
- **events-all:** Will includes HA client events ([ccf9fbc](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/ccf9fbc)), closes [#75](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/75)
- **get-entities:** Added total count of entities as an output option ([3061151](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/3061151))
- **render-template:** Added custom outputs ([66d504d](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/66d504d))

<a name="0.9.1"></a>

## [0.9.1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.9.0...v0.9.1) (2019-03-09)

### Bug Fixes

- **haltif:** Fix to include contexts on other operators ([1a250b9](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/1a250b9))
- **poll-state:** Set default value for updateIntervalUnits ([61f9768](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/61f9768))

<a name="0.9.0"></a>

# [0.9.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.8.0...v0.9.0) (2019-03-09)

### Bug Fixes

- Fix for checking valid entity id ([4ee501e](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/4ee501e))

### Features

- **api:** New node for direct access to api ([ed7341a](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/ed7341a))
- **call-service:** domain and service fields accept templates ([8f86906](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8f86906))
- **get-history:** Add flatten option ([b46a4d5](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/b46a4d5))
- **poll-state:** Added Interval Units ([44f75c0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/44f75c0))
- Access to msg, flow and global context ([e1ce911](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e1ce911))

<a name="0.8.0"></a>

# [0.8.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.7.1...v0.8.0) (2019-02-26)

## Breaking Change

- jinja2 (HA) templates will no longer work in fields where mustache templates are rendered.

### Bug Fixes

- **get-history:** fix backwards compatibility for output location ([8bd6e42](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8bd6e42)), closes [mit/3154f79a5758c74967742e282660dac1decfbe74#r32270616](https://github.com/mit/3154f79a5758c74967742e282660dac1decfbe74/issues/r32270616)
- **mustache-context:** catch error thrown for invalid flow and global var ([38a16fb](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/38a16fb))

### Features

- **wait-until:** Added ability to check against current state ([c6343a9](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/c6343a9))
- Able to access flow global and states in templates ([e0de7cb](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e0de7cb))
- hass.io connection delay toggleable ([11c440c](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/11c440c))

<a name="0.7.1"></a>

## [0.7.1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.7.0...v0.7.1) (2019-02-11)

### Bug Fixes

- **config-server:** Removed needsPermission from static files ([83018e9](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/83018e9))

<a name="0.7.0"></a>

# [0.7.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.6.1...v0.7.0) (2019-02-03)

### Bug Fixes

- Added a check for valid server ([66d8daf](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/66d8daf))
- Fix for nodes to trigger on deploy ([8205236](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8205236)), closes [#80](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/80)
- **trigger-state:** Fix to show the correct properties for constraints ([62e22fa](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/62e22fa))

### Features

- **current-state:** Added customizable outputs for state and entity ([0a51c5d](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/0a51c5d))
- **event-state:** Added Only output on state change ([0707d72](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/0707d72))
- **wait-until:** New 'Wait Until' Node ([6717972](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/6717972)), closes [#82](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/82)

## [0.6.1] 2019.1.18

### Fixes

- Fixed validation error for the **get-history** node
- Fixed poll-state node not waiting for getComparatorResult

## [0.6.0] 2019.1.18

### New Features

- The **call-service** node autocomplete for `entity_id` now handles multiple entities
- The properties field of a **trigger-state** node now has autocomplete
- Added a new comparator, 'in group', to the **get-entities** node
- **Get-history** node can use a relative time string for its date fields

### Added

- A more verbose error message for the autocomplete error when the server config hasn't been deployed
- More informative error message for the **call-service** node when there's an API error

### Changed

- Change the connect timeout for hass.io users so it doesn't bombard the proxy when attempting to connect. ([#76](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/76))

### Fixed

- HomeAssistant object updated before firing state_change event ([#74](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/74))
- Fixed HTTP API so it returns an empty string and not the response object when res.data is empty.
  ([#78](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/78))

## [0.5.1] 2018.12.29

### Fixed

- Fixed `get-entities` to use custom label if valid
- Correct possessive apostrophe in trigger state node constraint list ([@albertnis](https://github.com/albertnis))
- Fixed condition where wildcard type state changes fired before current states were actually saved
- Fixed onDeploy for trigger-state node when using substring/regex for entity id

## [0.5.0] 2018.12.18

### New Features

- Added secondary outputs for `halt if` logic for current-state, events-state, and poll-state nodes
- Call-service node now has the option for custom location output or no output
- New node `get-entities`: Get entities based on search criteria with 3 different output options

### Added

- Added Spinner UI element to poll-state node

### Changed

- Refactored the UI for `halt if` logic into an external file and loaded on demand

### Fixed

- Fixed the handling of multiple entity ids for the homeassistant domain for the call-service node Fixed #57

## [0.4.3] 2018.12.9

### Fixed

- Make Server Id is not empty when performing autocomplete ajax call for `get history` node ([@rchl](https://github.com/rchl))

## [0.4.2] 2018.12.9

### Fixed

- Make Server Id is not empty when performing autocomplete ajax call

## [0.4.1] 2018.12.9

### Fixed

- Make sure `halt if` logic has default starting values

## [0.4.0] 2018.12.8

### New Features

- Ability to cast the `state` of event entities and payload to String/Number/Boolean
- Changed `halt if` logic to be able to use different comparators to check the state for current-state, and events-state-change nodes
- Poll-state now has `halt if` logic

### Added

- Added status times for success and error messages for the `get template` node ([@jonathanadams](https://github.com/jonathanadams))
- Added timeSinceChangedMs to current-state, events-state, and trigger-state nodes `entity.timeSinceChangedMs`

### Fixed

- Autocomplete to use the correct entities/services if more than one server is setup ([#49](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/49))

## [0.3.1] 2018.11.18

### Added

- Added mustache dependency

## [0.3.0] 2018.11.18

### New Features

- Entity Id now has autocomplete for the Call Service node.
- Trigger node now can be filtered by substring/exact/regex.
- Call Service and Fire Event nodes are now able to render [mustache templates](https://github.com/janl/mustache.js) in the data property. Template also work on the new entity id field for the Call Service node.

### Added

- Request/Sending status to Call Service, Fire Event, Get History and Get Template nodes.

### Changed

- Call Service node won't send message until it receives a response from HA.
- Fire Event node won't send message until it receives a response from HA.

## [0.2.1] 2018.11.11

### Changed

- Reverted home-assistant-js-websocket to version 3.1.6 because hass.io proxy reconnect errors popped back up in ^3.2.0

## [0.2.0] 2018.11.6

### New Features

- Ability to allow Unauthorized SSL Certificates configurable via the server config
- Added override `msg.data` control to current-state node ([@thejta](https://github.com/thejta))
- Config for Hass.io users is now just a single checkbox
- Added autocomplete to the entity id field for the get-history node

### Added

- Base URL will now show validation error if not in an acceptable format

### Fixed

- Files should now get linted correctly on staging

## [0.1.3] 2018.10.28

### Changed

- Refactored the connection process for the WebSocket. Now shows Connecting, Connected, and Disconnected. Connected is now shown only after it has successfully authenticated with Home Assistant.
- Load the full Services object from Home Assistant on load
- Only process State and Services objects if they're not empty

## [0.1.2] 2018.10.18

### Security

- Added permission checks for the httpAdmin endpoints for autocomplete [Fixes #7](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/7)

## [0.1.1] 2018.10.11

### Added

- More tests for fire-event node
- Added coverage/ and travis.yml to .npmignore

### Fixed

- Poll-state node will stop triggering if not connected to Home Assistant
- Setting server global context states on data load

## [0.1.0] 2018.10.8

### Added

- Support for reading the HASSIO_TOKEN from hass.io and using that in the server config if the server URL is the hass.io proxy

### Fixed

- Use the correct hass.io proxy url for websockets

## [0.0.7] 2018.10.7

### Fixed

- Added more checks to see if server is selected before calling "GET /homeassistant/entities" for call-server, current-state and poll-state nodes

## [0.0.6] 2018.10.6

### Added

- Added Output Initially / On Deploy for trigger-state node
- Added Output Initially / On Deploy for events: state node
- Added config for Github stale bot
- Added config and base code for coveralls code coverage reporting
- Added a few more test cases

### Fixed

- Poll state node to wait for a state before triggering when Output Initially is checked
- Close WebSocket when Deploying before creating a new connection

## [0.0.5] 2018.10.5

### Added

- Linting and formating into pre-commit hooks using eslint and prettier
- More logging to the testing of the connection to Home Assistant
- Boilerplate for adding tests

### Fixed

- Undefined string in call-service node
- Forgot to reference class function in fire-event node

## [0.0.4] - 2018.9.31

### Added

- json editor to call-service node data input
- Fire Event node to send events

### Changed

- host and access token/password credentials are now encrypted and stored in the node-red cred file. This also stops them from being exported in flows.

## [0.0.3] - 2018.9.26

### Fixed

- Fix for autocomplete xhr call showing undefined for httpAdminRoot. Not going to assume that httpAdminRoot is defined. [zachowj/node-red-contrib-home-assistant-websocket/issues/2](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/2)

## [0.0.2] - 2018.9.23

### Added

- Ability to filter event type from within the 'events: all' node
- Better error handling for refused connections and incorrect access token/password

### Changed

- Docker config to use Home Assistant 0.78.3 and node-red 8.12.0

### Fixed

- The ignoring of custom root path if set in node-red - [AYapejian/node-red-contrib-home-assistant/issues/41](https://github.com/AYapejian/node-red-contrib-home-assistant/issues/41)

## [0.0.1] - 2018.9.20

### Added

- Integrated [AYapejian/node-home-assistant](https://github.com/AYapejian/node-home-assistant) minus the CLI
- Ability to use Home Assistant long-lived access tokens

### Changed

- 'events: all', 'events: state', and 'trigger: state' to use websocket instead of the events stream
- 'poll state', 'call service', and 'current state' to use websocket instead of REST API
