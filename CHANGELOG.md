# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.21.2](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.21.1...v0.21.2) (2020-02-28)

### Bug Fixes

- **wait-until:** use correct entity id for check against current state ([f2d47c5](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/f2d47c5b6392731efb2ff01666252c80d153ae08)), closes [#210](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/210)

## [0.21.1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.21.0...v0.21.1) (2020-02-26)

### Bug Fixes

- fix breaking change caused by rebranding hassio ([c6dcaac](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/c6dcaac10c601557295c35b335dd19b3cb3086ad))

# [0.21.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.20.2...v0.21.0) (2020-02-26)

### Bug Fixes

- Prior to 0.90.0 is_admin doesn't exist check for it to exist and not true ([3f07f55](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/3f07f55cbb257347e95e9033bf1dbd46936c2036)), closes [#207](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/207)

### Features

- **entity:** Rename sensor node to entity and add new entity type switch ([059c340](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/059c3403a4f90eefa7d5921d93c4e765f0c0601a))
- **wait-until:** Entity Id can be a exact match, substring or Regex match ([9738bb5](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/9738bb530d74df84f3cf69fd1f8e6e1df6094e4c))
- **wait-until:** Timeout property can be a JSONata expression to allow for dynamic timeout values ([9dcbe1a](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/9dcbe1a1ba6e803b578cb74206f6835a9a6965b6)), closes [#206](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/206)

## [0.20.2](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.20.1...v0.20.2) (2020-02-14)

### Bug Fixes

- HA rebranding fixes/changes ([b0df6d5](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/b0df6d50407d856d49c10e08b5f59f83162abf87))

## [0.20.1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.20.0...v0.20.1) (2020-02-12)

### Bug Fixes

- Fix status message for non triggered events ([5d7faa4](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/5d7faa440a35c72f2f8d198e9ea823a89b0d982c))

# [0.20.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.19.5...v0.20.0) (2020-02-12)

### Features

- Add ability to handle nodered.trigger service call ([aba9eab](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/aba9eabc37dad38e3054aae5abe1bbaf6492c23b))
- **integration:** Handle nodered:loaded event from when HA loads custom component ([072cec7](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/072cec7f5dd1c991f8da65f28aec67365f4aa407))

## [0.19.5](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.19.4...v0.19.5) (2020-01-24)

### Bug Fixes

- **get-history:** Set end date when using relative time ([9414210](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/9414210)), closes [#191](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/191) [#190](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/190) [#177](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/177)
- fix crash when base url was missing http:// or https:// ([2ef2166](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/2ef2166))

### Build System

- **gulp:** Watch for lib/\*.js file changes ([0d28013](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/0d28013))

### [0.19.4](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.19.3...v0.19.4) (2020-01-14)

### Features

- Add search button to find home assisant instances for server config ([8f25ef6](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8f25ef61c14972cdea61f93ad5f631cf47a64ae1))
- **wait-until:** Add ability to use mustache templates for entity id field ([6d9e183](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/6d9e183657a0cf3856a608fab9c6db2e2e3f7404)), closes [#189](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/189)

### Bug Fixes

- Fix 'in' conditional ([78a3d22](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/78a3d22f54e80c237e651b1da00f7f7583aeced7))

## [0.19.3](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.19.2...v0.19.3) (2020-01-06)

## [0.19.2](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.19.1...v0.19.2) (2020-01-06)

### Bug Fixes

- **get-history:** Don't send an enddate when using relative time ([d536c3c](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d536c3ced8392c9a821e7809e7762cc1413bd041)), closes [#183](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/183)
- **get-history:** Fix for using flatten results with output type split ([38b9c9c](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/38b9c9c3267c403532082bbc0b0cf8549576399d))

## [0.19.1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.19.0...v0.19.1) (2020-01-04)

### Bug Fixes

- include correct files when publishing to npm ([8f8eb6f](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8f8eb6f2f082e562556c08bdbec18e4b6dcf38c7))

# [0.19.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.18.0...v0.19.0) (2020-01-04)

### Bug Fixes

- point changelog to new documentation ([0c1a93e](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/0c1a93e739df022c65a7ff6b444a6ada4fd30c7a))
- run correct task for convert docs action ([b9b3ee4](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/b9b3ee494540474c2e13df116c9d182a82c6d9b6))

### Features

- **docs:** Markdown docs will be automattically convert to NR help files ([5abfb62](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/5abfb620a39703e00fb0efabec1f06f19c47b46f))

# [0.18.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.17.1...v0.18.0) (2019-12-21)

### Bug Fixes

- Catch rejection for lost connection when unsubbing ([0008406](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/00084065cfe32018c75cdb3f9ef2d57ae0ed933a))

### Features

- **api:** Add debug ouput option ([72cf55b](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/72cf55bc94192690e00532d29a6b471532f86201))
- **sensor:** Add the ability to choose how input values are handled ([cbd48b9](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/cbd48b9b2b17fa2567f725836a2e9edf9b1658fd))

## [0.17.1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.17.0...v0.17.1) (2019-12-11)

### Bug Fixes

- **sensor:** Fix reading attributes object when received in message object ([18849d9](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/18849d917984d9449c241ca9a9312dcfdcb98ea6))

# [0.17.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.16.3...v0.17.0) (2019-12-09)

### Bug Fixes

- **call-service:** Remove spaces around entity ids for homeassistant domain ([564670a](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/564670ae8f8bac74d773a32d5d672b1692eb7d1c)), closes [#170](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/170)

### Features

- Custom Integration ([#173](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/173)) ([0d9f94e](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/0d9f94e192d76176d3421fb29ebb79da0472e727))

## [0.16.3](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.16.0...v0.16.3) (2019-10-24)

### Bug Fixes

- fix JOI validate format ([24af2d4](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/24af2d434b20b91e469f7d22158837a7252fe3c5))

## [0.16.2](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.16.0...v0.16.2) (2019-10-24)

### Bug Fixes

- fix JOI validate format ([24af2d4](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/24af2d434b20b91e469f7d22158837a7252fe3c5))

## [0.16.1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.16.0...v0.16.1) (2019-10-24)

### Bug Fixes

- fix JOI validate format ([24af2d4](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/24af2d434b20b91e469f7d22158837a7252fe3c5))

# [0.16.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.15.0...v0.16.0) (2019-10-24)

### Bug Fixes

- check for WS client before listening for events ([8d72dbc](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8d72dbcdcbca0a928065e9ee17cd101ee5c004bb)), closes [#158](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/158)
- css changed for NR v1.0 ([41539d7](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/41539d7df918f8e7356fa6e6a248ffe255137a46))
- Remove event type from sub list when unsubscribing ([321561d](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/321561d324c8f460fc81b1093f3a1859013d9d04))
- **config-server:** Revert ha_events for state_changed event so global context gets updated ([ef0c8d1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/ef0c8d1c674e1c46bd89e149254fd168b6456ccd))

### Features

- **call-service:** Add debug flag for more information ([873603b](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/873603b29778c824bd3f8b2c72b80964efd440bf))
- **wait-until:** Add trigger time to wait until node in status message ([eeac869](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/eeac86923a0f9402b36a9809201d3e8fdbb864eb)), closes [#157](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/157)
- Add ability to disable caching of autocomplete results ([a90e041](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/a90e041da7e7b9ab210d157fe29d622dd750aa0d))

<a name="0.15.0"></a>

# [0.15.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.14.2...v0.15.0) (2019-08-22)

### Bug Fixes

- **get-entities:** error when property value was not set for jsonata ([5125821](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/5125821))
- **trigger-state:** Attribute of other entity undefined in trigger ([a45366f](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/a45366f)), closes [#148](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/148)

### Features

- **get-entities:** timeSinceChangedMs is not a filterable property ([adfd0dc](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/adfd0dc)), closes [#147](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/147)

<a name="0.14.2"></a>

## [0.14.2](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.14.1...v0.14.2) (2019-08-01)

### Bug Fixes

- **call-service:** render mustache templates for entity id field ([8889355](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8889355))

<a name="0.14.1"></a>

## [0.14.1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.14.0...v0.14.1) (2019-07-28)

### Bug Fixes

- **call-service:** fix for validation of data field ([0902162](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/0902162))
- **call-service:** homeassistant domain ids needing to be an array ([b118009](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/b118009)), closes [#136](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/136)

<a name="0.14.0"></a>

# [0.14.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.13.1...v0.14.0) (2019-07-24)

### Features

- JSONata everywhere ([6424235](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/6424235))
- **api:** Add option for data field to be a JSONata Expr ([37b54ce](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/37b54ce))
- **call-service:** Add JSONata option to data field ([8e91f42](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8e91f42))
- **fire-event:** Add option for data field to be a JSONata Expr ([526d083](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/526d083))
- **get-entities:** Allow overriding of config values from payload ([a0fdb96](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/a0fdb96)), closes [#133](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/133)

<a name="0.13.1"></a>

## [0.13.1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.13.0...v0.13.1) (2019-07-06)

### Bug Fixes

- Load external js,css for all nodes not only config ([e0f52e0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e0f52e0))

<a name="0.13.0"></a>

# [0.13.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.12.3...v0.13.0) (2019-07-02)

### Features

- **current-state:** Templates are processed in the entity id field ([aed4579](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/aed4579))
- **wait-until:** Allow overriding of config value ([c4d3081](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/c4d3081))

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
