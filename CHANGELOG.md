# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.49.1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.49.0...v0.49.1) (2023-04-07)


### Bug Fixes

* **button:** Remove event listeners when node is deployed ([e646f1d](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e646f1dfd6bec52dfa62e1d4ece827fb26b747e5)), closes [#881](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/881)

## [0.49.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.48.1...v0.49.0) (2023-03-13)


### Features

* Add entity picture to entity config ([132547f](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/132547f43901cd2fd17cf3755404a4ae4e3e83d0))

## [0.48.1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.48.0...v0.48.1) (2023-01-30)


### Bug Fixes

* **api:** Allow data field to empty ([4e51506](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/4e515062c944b976d871311a80ff384ecff30f24))
* **api:** Check for the type property ([e117475](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e11747542f749dc5226f77d46d5eb0e18509e3af))
* **api:** Don't render data when the source is from the message ([6a1c7df](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/6a1c7df481a447abe1b741005c735e2b1d0eaede))
* Fix slow opening nodes and other issues with select2 ([ec97ddd](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/ec97dddd0299e477078328f5c9070e77dbdd7621))
* **time:** Fix usage of toDate, luxon doesn't support it ([ca9a81a](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/ca9a81a0723d52e6ad7715746360ac40d9f38e6d))

## [0.48.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.47.2...v0.48.0) (2022-12-25)


### Features

* Enable message coalescing ([d235c35](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d235c3572ec5051cf11bc3bf26c9266f5ca9c659))

## [0.47.2](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.47.1...v0.47.2) (2022-12-21)


### Bug Fixes

* throttle registry lookups to 500 ms ([9fa2177](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/9fa21773f2bce4ad25cbd3acdba3c1cd3d269235))

## [0.47.1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.47.0...v0.47.1) (2022-12-08)


### Bug Fixes

* **server:** Catch exception when access token is invalid ([3d3cf8d](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/3d3cf8d5332da22ed810bb04190b250a9e921950)), closes [#770](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/770)
* **wait-until:** Fix typo in timed out status ([d46005c](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d46005c1e9c93fce2bd5f9c724360dd7b7f40834)), closes [#755](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/755)

## [0.47.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.46.2...v0.47.0) (2022-11-13)


### Features

* Add water device class to entity config ([4e05721](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/4e05721c8f184c90aa766d78a11eece0cc547b1b)), closes [#733](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/733)
* **entity-config:** Added Giga Joule as an energy unit ([#735](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/735)) ([4e8514c](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/4e8514c32409bb26005bb4f74fb6d33edb140874))


### Bug Fixes

* **entity-config:** Add missing moisture and wind speed device classes to entity config ([4e05721](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/4e05721c8f184c90aa766d78a11eece0cc547b1b))
* Fix "show debug information" for all nodes ([65181f6](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/65181f6cb8556456a2b904f50b23956a5c1216a3))
* **wait-until:** Catch errors thrown during timeout ([eab4c19](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/eab4c19400d572462f2fec2c8cd3645dc017709e))

## [0.46.2](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.46.1...v0.46.2) (2022-10-31)


### Bug Fixes

* **sensor:** Allow attriubtes input to be an array ([d066479](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d066479308310768019bc4c98bebb893ffac91ff)), closes [#725](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/725)

### [0.46.1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.46.0...v0.46.1) (2022-10-19)


### Bug Fixes

* Changes so devcontainer works ([bddfde3](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/bddfde313dfcf0add3de13c39d980816a17442fe))
* **sensor:** Expose sent data to output properties ([1dd6fb0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/1dd6fb08071ff8d5fb0ef4517d1db4b5ec3864b1)), closes [#702](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/702)


### Documentation

* change url for device-config.md ([#697](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/697)) ([60a9bb9](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/60a9bb9d6862b58f7c73b8cf296ad18dc22092a7))
* Fix JSONata Example links ([#666](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/666)) ([46ee50f](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/46ee50fd16de171247d8ca69dd44d696365d0269))
* Fix sidebar links for guides ([9422b63](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/9422b637bb3a24857c8c26a881a265d243de0a89))
* More changes for contributing ([4711413](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/47114136dfd35da92d455e19f4bf18e6b4adc401))
* **trigger-state:** Remove reference to mustache template for entity id ([#699](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/699)) ([35e40fe](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/35e40fe36278bbb4adb03312b32756c6b027351e))
* **trigger-state:** Update config settings and input ([09250fe](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/09250fe91be8fa516302fd0ad8778fe030c8be11))
* Update contriubting and set up environment ([9422b63](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/9422b637bb3a24857c8c26a881a265d243de0a89)), closes [#511](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/511)
* Update vuepress ([2a5b5f8](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/2a5b5f81ca56024afd9776445aff8ba914a64c48))
* **update-config:** Fix links to other config nodes ([7ad62ee](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/7ad62ee5ce19761ae4a7409b92dddaac27d052ea))

## [0.46.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.45.10...v0.46.0) (2022-10-09)


### ⚠ BREAKING CHANGES

* Dropping support for Node 12 and NR v1 and v2

### Bug Fixes

* Allow editor context to handle large number of entities ([0d496e2](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/0d496e26da51125511a98a8e9f2f4644ff37c62d)), closes [#696](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/696)


### chore

* Drop support for Node 12 and NR v1 and v2 ([5dbe2f5](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/5dbe2f5a42c38ef365ab790b0ab8221edb0bf674))

### [0.45.10](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.45.9...v0.45.10) (2022-10-07)


### chore

* release 0.45.10 ([1fc5689](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/1fc568942ca516bd3cf486f3f0c4c5be50d63ac6))

### [0.45.9](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.45.8...v0.45.9) (2022-10-03)


### Bug Fixes

* Remove entity from HA when entity config is deleted ([d78851b](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d78851b943bb22dc86ac70b4b86aff853bbf5265))

### [0.45.8](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.45.7...v0.45.8) (2022-10-03)


### Bug Fixes

* Send saved switch state on registration ([296bd37](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/296bd3718151b2e59be09838600519b03763deae)), closes [#685](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/685)

### [0.45.7](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.45.6...v0.45.7) (2022-10-02)


### Bug Fixes

* Use correct validation for sensor state input ([9a4522b](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/9a4522ba8ea3fbed7152cc88c3c8a17770827aa1)), closes [#683](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/683)

### [0.45.6](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.45.5...v0.45.6) (2022-10-01)


### Bug Fixes

* **editor-context:** Update editor global on entity state change ([5bc0cdc](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/5bc0cdc36c85ec3b434c24aaa922546353576c1a)), closes [#680](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/680)

### [0.45.5](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.45.4...v0.45.5) (2022-10-01)


### Bug Fixes

* **wait-until:** Allow validation to accept a number or an empty string ([87a8846](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/87a884646bac99d0f2fd9b22086a6b3bfbacac1c))

### [0.45.4](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.45.3...v0.45.4) (2022-09-30)


### Bug Fixes

* Convert bool string to boolean when comparator is set to boolean ([e9dc0e3](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e9dc0e3f8218c8dc90dbe1baa7bd8e2b5c64cae1)), closes [#671](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/671)

### [0.45.3](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.45.2...v0.45.3) (2022-09-30)


### Bug Fixes

* Listen for the correct event states_loaded to publish entities ([ef48a68](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/ef48a682268962ef237d7a2eb2a1b851c4332a1b)), closes [#672](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/672)
* Make sure old style node using comparator service has access to states ([f25bebe](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/f25bebe10876ba6b87900f1414593a437a04d751))

### [0.45.2](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.45.1...v0.45.2) (2022-09-29)


### Bug Fixes

* Remove validation for sensor attributes ([27a3ecb](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/27a3ecb2156a9611053eba3a5e4d1a8e67be30d8))

### [0.45.1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.45.0...v0.45.1) (2022-09-29)


### Bug Fixes

* **sensor:** Fix attribute validation for sensor and binary sensor ([914b4b2](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/914b4b2b46a5863d06abef6a5cf0dc9f0522eff1)), closes [#669](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/669)


### Documentation

* Fix spelling in node list ([cde607f](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/cde607f9e7438a48fd86238bd318476f8f10afac))

## [0.45.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.44.0...v0.45.0) (2022-09-26)


### ⚠ BREAKING CHANGES

* Entity node is being deprecated. Use the individual entity nodes.
* In the get-entities node "starts with" and "contains" will no longer return true for an empty string

### Features

* **config-server:** HA global context data can be enable/disabled ([053be16](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/053be1680877db3396cff5a4dc1050ce25f7b987))
* Create devices in HA that entities can be added to ([6c64212](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/6c6421298acd176a9632d01ec34356417e163fda))
* **events:all:** Add event data comparison ([d8e3840](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d8e3840912312fd09df8bb3bab59864b6f2275c9))
* **update-config:** New node to update HA entity config dynamically ([7a70f43](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/7a70f4396e250c3688e323cbcd79a51fabb4f0bf))


### Bug Fixes

* Add entity node back to group after importing ([73f8fcf](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/73f8fcf85f782d87d5816ed3b71de336ee5440d3))
* Catch all onEvent errors ([533c094](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/533c0940cdf6295f66dd44b4e31ecba6b5e4d4c6))
* **device:** Fix type for html option element ([58672e6](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/58672e6dc59dd2a037459ab7050c122d2da415d2))
* **device:** Use correct server id ([9cc4c75](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/9cc4c75bb9680b7a7d2fdf94c6afc8f70c6cfed1))
* Integration event trigger ([3ec43c9](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/3ec43c96b3e909cad692a3c29ed81f1602a3d525))
* Remove correct event listener when node is closed ([b1311b9](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/b1311b923c8064dc1376082a9c38c4bdbb919505))
* Remove event listeners on node close ([21fbdeb](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/21fbdeb67437acdb84eea83724bdd895907b6724))
* **sensor:** Fix validation of state value and remove default output properties ([b03f1b4](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/b03f1b4649b26d9e3364dc1ef44672c0d28f87a5))
* Trigger Node Custom Output Comparators [#580](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/580) ([#665](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/665)) ([7e22233](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/7e22233b01dfed5c35ed6008f4711754752ab4a7))
* **trigger-state:** Throw error when id is missing ([65b62fe](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/65b62fe4048436beb87d2a26fc726fb1d957dfbb))
* **websocket:** Stop device lookups call to HA when there's no connection ([f165659](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/f165659ea654cd18586269d4604d3870d7e4e7d7))


### Style

* eslint changes ([9def058](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/9def0588d3859327145a4d6a80ccb436552b0405))
* lower case status message ([c08f38d](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/c08f38d2ad8b111fb33581d6638c7b09321f93b2))


### refactor

* Deprecate the entity node ([1e31ec3](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/1e31ec37439729fc1081c7dcac978e01a11b77e7))
* Use new services in BaseNode controller ([51b9717](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/51b9717ec6607c1c11572cecd35dea6015e259b8))


### Documentation

* Add documentation for the new entity nodes ([36bb956](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/36bb956ed0e1daf963f3d44a67e69f2ac82970ad))
* Remove sidebar length ([7f65fec](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/7f65fecc59e3e406fed96c94a011b15f81117470))
* restore entity node page ([2d4616a](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/2d4616a102550f845d327df208dbcb99e4e9a095))
* spelling fixes ([0d20801](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/0d208016085dfd7dd1405f1a04b6de6f386efe41))
* **update-config:** Fix spelling ([d70c836](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d70c836e4fdc60ce452f1bbce65228adfe841988))

## [0.44.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.43.1...v0.44.0) (2022-07-20)


### ⚠ BREAKING CHANGES

* **time:** The status text format of the node changed. Could breaking things if the status node was used to monitor the time node status text.

### Features

* Add configurable display option to the id selector ([c491806](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/c4918065052c8f38b0ab81f62ddaf9c8901c7a42))
* Make datetime string in the status text configurable ([c6b2ecd](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/c6b2ecd4ea6c7e87fb021ce6512e54fafe87851c))


### Bug Fixes

* **call-service:** Allow any input for the entity id field ([1d4f486](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/1d4f486c03152e09b48b3822a4111c28d37b19c3)), closes [#615](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/615)
* **config-server:** Stop reporting base url error when node-red env var ([eb972b6](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/eb972b60c5a3814f702f68ce79bbf97db76838fb))
* **device:** Catch promise rejection from WS send ([28ff1d9](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/28ff1d9cc897bb74e8d10e0c1436d67306be96b0))
* **get-history:** Catch invalid relative time string ([32a0389](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/32a0389f14af2dfca95094dd05999d5bee8f8dbf))
* Make sure fractionalSecondDigits is a number ([43d7b8e](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/43d7b8ea0684fac1387dcc1ebb53576394e41d62))
* **render-template:** Add mode type to editor so it works with NR 3.0 ([6fb4de1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/6fb4de1b30e42ec397df09ff01b962335ce23ceb)), closes [#647](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/647)
* Set status date migration month to short ([43d7b8e](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/43d7b8ea0684fac1387dcc1ebb53576394e41d62))
* **status:** Fix import paths ([d894b98](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d894b988eb7508ddcb25ed09c65853e7c99ecfc2))


### Style

* Remove unnecessary style from legacy label class ([685c2b1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/685c2b1ea05134025fa3ce24888a47fa9b339a1b))


### refactor

* **time:** Change time node to use formatDate ([e88abaf](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e88abaf5687b1aef968c65ee93e560aab6808442))


### Documentation

* Add button node link to node list ([a89f048](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/a89f048e21abeec0f77752f37e2928c99abeb355))
* Change code copy plugin ([6272a91](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/6272a91b985d279be0c494b2dc871f634cecd904))
* config changes for vuepress v2 ([0dd2f68](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/0dd2f681586ffe130adac1d2785c9cbcd98f1f2c))
* **cookbook:** Fix JSONata example to use $number on entity state as it is a string ([ae751fc](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/ae751fc8edb3f5329589755fefa41ba8d68ab767))
* Fix plugin config setting ([95f89f0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/95f89f03ad9aaed7ca3e96688adb92d46ce3bd66))
* Migrate docs to vuepress v2 ([cf890fa](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/cf890fa5ce0bdf2615f50c80601a25039794ede0))
* **poll-state:** Fix output location information ([a4dcc28](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/a4dcc280c6ee2f08e0925714bd92f27a9dc85531)), closes [#617](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/617)
* Update getting started prerequisites ([f002d04](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/f002d04b1b592be4f9cf1bdcd9cac5788746bdf4))

### [0.43.1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.43.0...v0.43.1) (2022-03-07)


### Bug Fixes

* **current-state:** Provide the message object so it can be used to look of msg properties ([62c4a39](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/62c4a391d7b5b273dad87717b11d32a505a2c0ed))

## [0.43.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.42.8...v0.43.0) (2022-02-24)


### Features

* Custom strings can be used in select2 selectors by using a # as the suffix ([e23ab9c](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e23ab9cfae9aeeb16fb33b3755cb71e177b389cf))

### [0.42.8](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.42.7...v0.42.8) (2022-02-20)


### Bug Fixes

* **call-service:** Don't add id to select2 if it is an empty string ([86e7551](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/86e75513fb8bdbd8c2a75364ac85d67bb064dced))


### Documentation

* **call-service:** Update tips and tricks and node docs with target info ([8073a88](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8073a88588e263714410b7134095910cc4e9cce3)), closes [#574](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/574)

### [0.42.7](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.42.6...v0.42.7) (2022-02-18)


### chore

* release 0.42.7 ([62203c6](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/62203c62a263f99080ea9fff201cdd828b93e3ba))

### [0.42.6](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.42.5...v0.42.6) (2022-02-18)


### Bug Fixes

* **call-service:** Check that select2 initialized before trying to read data ([07df6ca](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/07df6ca8fdb2f8407e3e543ac6fe96a0eae70c1c))

### [0.42.5](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.42.4...v0.42.5) (2022-02-17)


### Bug Fixes

* **call-service:** Send targets in the data field so HA doesn't automatically convert them to arrays ([d085ef4](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d085ef444f04d3f472180eae6e4e6f895c7a22eb)), closes [#584](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/584) [#582](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/582)
* **entity:** Select correct attribute type value ([581992b](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/581992bc5465b1375e61e2bd85d7fc58fe76250e)), closes [#583](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/583)


### Documentation

* **cookbook:** Update actionable notification subflow ([b28415e](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/b28415ebfe9eb2cb813054586250e9afb5020580))

### [0.42.4](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.42.3...v0.42.4) (2022-02-13)


### Bug Fixes

* **call-service:** Allow "all" to used in entity field ([c3bd333](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/c3bd3336575d3c95698ab7ebbccfc3629c185067))


### Documentation

* Add reference to minimum version of HA needed ([7a9865c](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/7a9865c6f7e7331801a47229f312fd926b83e1e3))

### [0.42.3](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.42.2...v0.42.3) (2022-02-12)


### Bug Fixes

* **events-state:** Fix html issue for the if state row ([227faa3](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/227faa39d05e06c4d4cd9be0364e5b35d33929f3))
* **time:** Use correct check when no matches are found ([7590bf0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/7590bf079b09127c47737d61c4193161c4179ee5)), closes [#576](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/576)

### [0.42.2](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.42.1...v0.42.2) (2022-02-12)


### Bug Fixes

* **call-service:** Convert all targets to strings if only 1 id ([64b3467](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/64b346774f1f98c6de6c818b73849d2a065b4bd2))

### [0.42.1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.42.0...v0.42.1) (2022-02-12)


### Bug Fixes

* **call-service:** If entity_id is a single id convert it to a string. Some services don't accept entity_id as an array ([25e1e86](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/25e1e866d9e5c34ac9f7df221c530cd36c05d5e3))

## [0.42.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.41.3...v0.42.0) (2022-02-11)


### ⚠ BREAKING CHANGES

* **wait-until:** Add entity selector
* substring filter type no longer parses comma delimited lists. Substrings with comma will be converted to arrays and the filter type changed to list
* Don't move resource files to the dist directory leave in the root folder so NR can find them
* **call-service:** The data field is no longer the last word for the entity id. The new target properties are. Home Assistant updates the data target properties from the target property.

### Features

* Add entity selector ([27880af](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/27880afa0253f51e499f3e671621b12fbb495dac))
* **button:** Move the button out of beta ([112d038](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/112d038035c9ec15381bca9fe6b7b97661f8a527))
* **call-service:** Add area and device selector ([8a33245](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8a3324562dcf8facf9185b57cde2a3f7033b5ba6))
* **call-service:** Filter entities based on service target ([57f59fa](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/57f59fafe21e677d891f01a107f64ff125862122))
* **events-state:** Add entity selector ([61b8ad1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/61b8ad1f538a4c0593da00881e48e7746353e718))
* **trigger-state:** Add entity selector ([c8dfbc2](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/c8dfbc270d83976b400913aafe2c9b2ebacab3ba))
* **wait-until:** Add entity selector ([27880af](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/27880afa0253f51e499f3e671621b12fbb495dac))


### Bug Fixes

* Add config node id to HA editor setup ([47f18d1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/47f18d16a5ecb46161f1d6c878f5816c5040ff88))
* Add node path to debug output ([721e061](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/721e0611a6b1b22ef9361284fed92212d705493d))
* Allow ${envVar} in select2 inputs ([a638cd0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/a638cd0912d17015f15135f81c5b0542766d39cf))
* **call-service:** Convert comma delimited entity id list to array ([87e8209](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/87e8209a72e78aee6e942255f726c244e4ff2b37))
* **call-service:** Fix migration of entity id to target ([29c260b](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/29c260b9148d063e6dd20924a9ab20c32d94f9fc))
* **call-service:** Fix parsing of data field ([8bf60f9](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8bf60f9ecd5b322f0c5972c53b507e0594881203))
* **device:** Add missing boolean type for the device capabilities ([2d0e37f](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/2d0e37f573f6b6a70c53aab6fd694a9489021813))
* **device:** Add missing integer type for the device capabilities ([2d0e37f](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/2d0e37f573f6b6a70c53aab6fd694a9489021813)), closes [#565](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/565)
* Don't move resource files to the dist directory leave in the root folder so NR can find them ([55dd39b](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/55dd39b737417f8b6b5a04d11aa248fb347616a6))
* **entity:** Only output state change when the state actually changes ([d6c6cf4](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d6c6cf472ce99834c2d255e407c139342a065ae6)), closes [#562](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/562)
* Fix circular dependencies ([b400bf3](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/b400bf38bd70e82765f68d20d2a0887cf3bef077))
* Fix filename case for hassAutocomplete ([b9fd34c](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/b9fd34cde5aaa834088f46962d326dfbcb57e39e))
* **migrations:** Delete properties with undefined values from the config ([d1ad8ae](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d1ad8aeeffab7c40ffde18bdd5ee37a6f3390e36))
* Stop css from polluting the global css scope ([227e940](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/227e94042f0eda501a0ce904750fe718466d492a)), closes [#552](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/552)
* **trigger-state:** Call haServer.init before entitySelector so it know which server to use ([b8487a4](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/b8487a428581e9f0eedb3860ed50c207bcbafc53))
* Update the HA service list on each update just not the first ([22f8c0a](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/22f8c0a0fa7183c4eea4eb4141263e11bb2b0657))


### Documentation

* **current-state:** Remove old node options and add For text ([ff40f75](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/ff40f757b416f9086e3df41e73f07f7856cd7826)), closes [#561](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/561)

### [0.41.3](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.41.2...v0.41.3) (2022-01-03)


### Bug Fixes

* **button:** Fix removal of event listeners ([a52acdb](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/a52acdbe46cd3a6c0cf34a990ecad44605fceb1e))
* **config-service:** Fix removal of event listeners ([7aabccb](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/7aabccb2d3ffecf81b8df9e03029fb86a9aa10d2))
* **entity-config:** Fix removal of event listeners ([79bdcb9](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/79bdcb953befc90d2c7615c7b6cbdbb8c4b83088))

### [0.41.2](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.41.1...v0.41.2) (2022-01-01)


### chore

* force release ([e2be391](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e2be3910c12782bf05420fb7bab5573598f9a8c1))

### [0.41.1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.41.0...v0.41.1) (2022-01-01)


### Bug Fixes

* **button:** Ignore unknown subscription ([4faad95](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/4faad95db7ac23041ba15ae28cdc1c94cc4221b5))

## [0.41.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.40.0...v0.41.0) (2022-01-01)


### Features

* **button:** Add button entity ([1f2fca0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/1f2fca057d1dce1390b039ef304d7fa1d421f7ae))


### Bug Fixes

* lint fixes ([77e97e0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/77e97e0152eac87fb20b484c0567c3cc2be35255))


### Documentation

* Fix typo ([#538](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/538)) ([afac5f8](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/afac5f8115938d1ca7c942de1888ba77e2edd61d))

## [0.40.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.39.0...v0.40.0) (2021-12-19)


### Features

* **entity:** Add state_class and last_reset to the sensor entity node ([156f4ad](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/156f4ad24a3fd506bfa9b028dbd0fecbc19f4567))


### Documentation

* Fix github branch reference ([335ad8a](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/335ad8aa96f9ce6a7cb1955c3848be5e77dd60b0))

## [0.39.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.38.2...v0.39.0) (2021-12-10)


### Features

* **current-state:** Add check to see how long entity has been in current state ([eac0c4a](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/eac0c4a51dd13292d7938850a71438eb5d15b70a))

### [0.38.2](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.38.1...v0.38.2) (2021-12-09)


### Bug Fixes

* Change the status date string to use h23. Fixes the quirk with en-US showing 24:xx instead of 00:xx. ([8efe502](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8efe50234b29f12a2c1f2e05b4acc42459cd2de5)), closes [#524](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/524)
* **events-state:** Check if state property exists before accessing it ([1e38d7f](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/1e38d7f3a44b50de11fab44b985c2741eb5d4a6b)), closes [#525](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/525)


### Documentation

* **cookbook:** Update Holiday Lights example ([73b1bf5](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/73b1bf5a13bf34a94e574ed4c5e554007f67cafa))
* **get-entities:** Move get-entities cookbook examples to the node page ([a9390c2](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/a9390c242a002fb408ae35dc271107faaa8d396f))
* **get-entities:** Remove link from cookbook and fix example links ([faec40f](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/faec40f1567e3a6cd7f160238f9abcf36cedfd23))

### [0.38.1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.38.0...v0.38.1) (2021-12-06)


### Bug Fixes

* **entity:** Catch errors while registering entity ([5d13aed](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/5d13aed08719a1e1258204138ed332effae5fac8))


### Documentation

* Fix typo ([#508](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/508)) ([8278d14](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8278d1422e7396e01c32feb617d4291813d6c6b9))

## [0.38.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.37.0...v0.38.0) (2021-11-06)


### Features

* **poll-state:** Enable dynamic interval  length ([f6904c4](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/f6904c4e1a2d3eaaeaf04de8a6efb2399c131b1f))


### Bug Fixes

* **entity:** Only save payload to disk if resend is enabled ([f847e11](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/f847e113b154495b20143a5c4964cd97020a4289))
* **get-entities:** Check if property exists before seeing if it starts with something ([8a5be79](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8a5be79ed2a672e57168a9d10a4bbf2c8583c213)), closes [#453](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/453)


### Documentation

* Add another example flow in the cookbook ([#504](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/504)) ([76c5987](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/76c5987a3710c40efc85722b2992bf4909d70c43))
* Fix cookbook entry HA restart ([3696c44](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/3696c44c9160deae4edb2f51b8d484f0267ebc7c)), closes [#505](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/505)

## [0.37.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.36.1...v0.37.0) (2021-10-27)


### Features

* Add heartbeat tracker to websocket connection ([090e8bf](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/090e8bfb2336cbb6ab7c8f3611bb5d7ad47c567d)), closes [#488](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/488)


### Bug Fixes

* Fix linting errors ([3bb743d](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/3bb743de49c76517e9dd51a422804d1a5031f6cb))

### [0.36.1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.36.0...v0.36.1) (2021-10-22)


### Bug Fixes

* Close old connection when config changes ([180e916](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/180e9167477b119a175ea4e9ca61436ff59fec18))
* Use correct hostname in logs ([180e916](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/180e9167477b119a175ea4e9ca61436ff59fec18)), closes [#447](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/447) [#430](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/430)


### Documentation

* Recommend removing Events: all node. ([#490](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/490)) ([5cf7af0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/5cf7af0491f41bb15862505a1eda39b8d447eaa6))

## [0.36.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.35.0...v0.36.0) (2021-10-18)


### Features

* **device:** Add select type for capabilities ([ea3339a](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/ea3339ab11a2a9a92b04b0bb783233fe27707c5b))


### Bug Fixes

* **device:** Send capabilities along with other action values ([ef8e1ae](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/ef8e1aed7abda37ed3747931785e9952963839a1))

## [0.35.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.34.0...v0.35.0) (2021-10-13)


### Features

* **tag:** Add ability to listen for all tags ([eac5921](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/eac5921e070c2e26ef950837fffd6c7ddbdb96fa))
* **tag:** Add output properties ([421b77c](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/421b77ca62f0ea4302c2890c2b54a833b48e4e32))
* **tag:** Remove beta status from tag node ([f5f8a82](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/f5f8a828d7f20fd5c097f165096737030291361c))
* **time:** Add custom outputs ([5d60ad6](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/5d60ad6d5df4877ed01260a7880dfc4a38eb6641))
* **time:** Add the ability to select which days of week to trigger on ([73ed3b0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/73ed3b05222f4c3487a4666d6cbb175ab63d9cd4))


### Bug Fixes

* **call-service:** Check for example before trying to load it ([bd54acf](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/bd54acfcd645c497663c968f5d28ba66c39f1b78))


### Documentation

* **call-service:** Wording change ([5feff91](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/5feff91106bc8c87b4b08a24d7f43fcdd5737469))
* **README:** Change build branch to main ([645317c](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/645317c688840bc15dc9c543d8a0fbe92437e74e))
* **Scrubber:** Remove console logs ([8adf96e](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8adf96ecaae17670c9ba2bb1958b0b372108f5fa))

## [0.34.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.33.1...v0.34.0) (2021-09-30)


### Features

* **device:** Add area name to device selector ([c7c6f26](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/c7c6f263cb6f3748eaf25b259d5fbb2858ea630c))


### Bug Fixes

* **device:** Only load the latest device data ([f88d21f](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/f88d21f3d5e4d363de474b6526a8ed59b9d2dfc4))
* Fix typo in beta warning ([1d7ca53](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/1d7ca535f518e6ab23c0b4cfbe3ec2461a878a37))
* **tag:** Display id if name doesn't exist ([bcab997](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/bcab99732a66a62c8fcdba1458d3abfa1754fac3))


### Documentation

* Add docs-only and info-panel-only components ([5383e97](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/5383e974c9cce930aa5adc01006777b0a3ad695b))
* **cookbook:** Update using date and time to show examples for the time node ([a07ad4d](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/a07ad4dbb58332c2b9c6e35382a65b6295b014b5))

### [0.33.1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.33.0...v0.33.1) (2021-05-30)


### Bug Fixes

* On integration event only enable node if it's not the trigger-state node ([0f2f18a](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/0f2f18a50dd84d18d4c40ba3a020b7666606f14e)), closes [#417](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/417)
* Only fire integration not loaded event when then integration is not loaded ([5cdc4ca](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/5cdc4cab219639e9641b12ee0740cb50e0ae8421)), closes [#404](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/404)

## [0.33.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.32.1...v0.33.0) (2021-05-26)


### Features

* **get-history:** Add friendly names to autocomplete for entity id ([e14d84f](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e14d84f8a69833f9abf0ed685ff44338cceae7cb))


### Bug Fixes

* **get-histry:** Use correct field id ([e14d84f](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e14d84f8a69833f9abf0ed685ff44338cceae7cb))

### [0.32.1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.32.0...v0.32.1) (2021-05-26)


### Bug Fixes

* Make all autocomplete comparisons non-case sensitive ([da591ac](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/da591aca21e065315f56e69d60f2c399f7a44d03))

## [0.32.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.31.6...v0.32.0) (2021-05-26)


### Features

* Add friendly names to autocomplete for entities ([#408](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/408)) ([77d2e5e](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/77d2e5e73fb99440b664447221425c93ef636c3f))

### [0.31.6](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.31.5...v0.31.6) (2021-05-25)


### Bug Fixes

* Handle promise rejection when user doesn't have tags component enabled in HA ([12f37dd](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/12f37ddbe5a77cffcf97d044d59cf2a3a4b44c1b))

### [0.31.5](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.31.4...v0.31.5) (2021-05-23)


### Bug Fixes

* **event-state:** Add missing data for JSONata outputs ([d4d4307](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d4d4307285827a5c26dcd9e8780417550f15a668))

### [0.31.4](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.31.3...v0.31.4) (2021-05-23)


### Bug Fixes

* **events-state:** Add output properties backend code ([a25c565](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/a25c5658b01dfcdfa777fadff89ea6e9b2b13a3a)), closes [#398](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/398)

### [0.31.3](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.31.2...v0.31.3) (2021-05-21)


### Bug Fixes

* **ui-device:** Make sortDevices more robust ([46f8973](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/46f897351fae47e878b01dc73f58050e8a924465)), closes [#396](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/396)

### [0.31.2](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.31.1...v0.31.2) (2021-05-20)


### Bug Fixes

* **config-server:** Fix loading of  Unauthorized SSL Certificates ([517cf39](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/517cf394687d1b28d54062eaa23c58076efa6bef))
* fix migrations for config-server not loading correct values when schema was false ([517cf39](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/517cf394687d1b28d54062eaa23c58076efa6bef))

### [0.31.1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.31.0...v0.31.1) (2021-05-19)


### Bug Fixes

* Fix status search and replace error ([c228278](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/c228278af6e2d944b150cd6c18893fe937c678db))

## [0.31.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.30.1...v0.31.0) (2021-05-19)


### Features

* Add $randomNumber and $sampleSize as JSONata helper functions ([b5b65bf](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/b5b65bf13c4b0c47a1821e23f7f504133c75c13c))
* Add device node ([b08fcbe](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/b08fcbe4031f0a12b785b63b114a28bd79915409))
* **api:** Add custom outputs ([da0187f](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/da0187fb796d5fc8c8ffaa4dedbcedfd2f3e6fc0))
* **call-service:** Add message queue ([58df3a0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/58df3a056d87fd7b666650e9902908ce0a116742))
* **current-state:** Add custom ouputs ([f4ecbb8](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/f4ecbb8fd88c76ca277cc2e08dc15e914ce276ec))
* **events-all:** Add custom outputs ([0a3fc23](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/0a3fc236e07307511ed2ff9ca0eda17725135b67))
* **events-state:** Add custom outputs ([aa07fb4](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/aa07fb4cbbcb07cc547655c19bbbab59929ab0e9))
* Make use of NR v1.0 async send and done ([d5b69f4](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d5b69f4a52c87cc610e45f33740e625acdac62db))
* **migrations:** Add config nodes to mass update ([5d23126](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/5d231264e8c2330b4d45577a1a6b274388ab2e3d))
* **tag:** Add tag node ([17585bb](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/17585bbcdd32b247aac774d773cb46b84e4bb650))
* **time:** Move time node to beta release ([27caacc](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/27caacc3ceacfe3d400a4c528ecaedbb20f45d1e))
* **webhook:** Add custom outputs ([5dff14b](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/5dff14bb98a2ec376b968a584550602334df277a))


### Bug Fixes

* **api:** add try catch for setCustomOutputs ([ee5189d](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/ee5189dbc28198e0f4474750e0a9bf36265026b4))
* Check for valid property for custom outputs ([f971856](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/f9718564605143674d0918c82ffc224d1d5b29aa))
* Check for valid server before processing input ([a86a9a6](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/a86a9a67ae734c3d82af069c9953706015ed22a8))
* check for valid server config before using it ([d7b322b](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d7b322b8bc970f3504958f85514ab6995960d5c6))
* **ci:** Don't lint included external libs ([8cd6735](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8cd6735de37c43efbca7f512aadf3e3401fb3589))
* destroy bonjour after finished using it ([eb2208f](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/eb2208fc2cb1a840c4aeeb29927c7962ab6c5f12))
* **entity-switch:** Remove unused declaration ([e6b15a0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e6b15a0335c7a236c6c3ab6c609ad65bae787e8c))
* Fix Comms import ([8c51877](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8c5187732bd2b80178767eb0f3c26d9d7b9311f1))
* **migration:** Move event-state for properties to a newer version ([de68154](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/de68154200e807a04c8eb51cafa66f8c12e0efec))
* **migrations:** make sure schema version is a number ([e1bc0f8](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e1bc0f80c64c43b77a5ab479d3804a87e30ffadc))
* **migrations:** swap conditional for default value ([996b9ef](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/996b9ef2f91a9217dc7e9019ce2ea0f5fe1e7b97))
* only trim spaces of server url if it exists ([f9ce69f](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/f9ce69fd3efbc841c9593d4ada852ce3a067a09f))
* **poll-state:** call correct error method ([5f7b1a8](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/5f7b1a8501e56068571da6a5d24dde5315819c8d))
* **poll-state:** Use correct element id for entity_id input ([0c2fe30](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/0c2fe305afcac9e86d8e7a7e32281173c2a1930a))
* request autocomplete results only if server actually changes ([27dc32a](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/27dc32a5513e4719b4145081908a9970736d57d7))
* **routes:** fix server id for getting integration version ([fc6c808](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/fc6c808921fc0f7b0d2a6f206d76b570d58ace88))
* **routes:** flatten out properties array ([45df3f1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/45df3f1cd09d2da72d3426fb3134003aad1434a5))
* **status:** check for valid homeAssistant before adding listeners ([c1d29ec](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/c1d29ec4d50e659e7cd08fc01692d914ae619191))
* **time:** Check jsonata length before attempting to find entity ids ([e3de59e](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e3de59e804e39bed42539ea46a07a1e873287a5d))
* **time:** use correct i18n errror message ([be3db24](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/be3db24e535d01be3f740ee7b9c97ad17bcba602))
* Use correct element id for update all button ([6bcf9a8](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/6bcf9a8dade2c92fe89199e04cbf1edf08191538))
* use the correct RED ([03bb7a0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/03bb7a0cb44d920ffcf199528aa1b3d67687f776))


### Documentation

* Add github discussions link to header ([dfa74a7](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/dfa74a795d5dc622eb83959e424b0fbc349d8533))
* Add new nodes to index ([7b305d0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/7b305d0f8ca6ca7400392eeadf8919897fba263a))
* Add new nodes to TOC ([9a73e86](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/9a73e865aee26acb754e869d12c423cea941281f))
* **cookbook:** Correct spelling ([28928b4](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/28928b4c8a6571c247b043781db0691000c535ed))
* **cookbook:** Update starting flow after HA reboot ([388b70a](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/388b70a148f8b1af0413347a6f13c5a1278512b5))
* **current-state:** add information about custom outputs ([e9fcb91](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e9fcb9113eb853eb6f29383eea3c05da70bcd6dc))
* **events-state:** Add custom output information ([e2a11a9](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e2a11a9e27b78b67a1c4f14bb272664599f184a2))

### [0.30.1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.30.0...v0.30.1) (2021-01-10)


### Bug Fixes

* **entity:** update getValue name change ([0531b86](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/0531b86f1f5fdef68dd96bcb203c42b3b4e406d6))

## [0.30.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.29.1...v0.30.0) (2021-01-10)


### Features

* **call-service:** Add load example data button ([2ef840b](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/2ef840b4a0de49ff0df2bd2293cb2eadd9090faf))
* **entity:** Add ability to have the switch entity output on state change ([703568e](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/703568e16094f2817ed53d0e4ecd592eae3dd331)), closes [#228](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/228)


### Documentation

* **cookbook:** Update vacation example ([f6080ca](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/f6080ca3ad9cfed55bb3f8006ad972504de95a8a))
* **guide:** Add call-service tips and tricks ([499ad96](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/499ad96068714bbab8511266e67c6750a1c73c83))
* Update holiday lights export to include autogeneration of HA helpers ([ddb5741](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/ddb57416b95f855c7853c99a68bb998bfc34bacb))
* Update README.md ([#325](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/325)) ([9fe6023](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/9fe6023e4babd2f7d5761b3df3178604f62f28c8))

### [0.29.1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.29.0...v0.29.1) (2021-01-02)


### Bug Fixes

* **call-service:** input_datetime entity list needs to be an array for multiple entities ([ae53a73](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/ae53a73a71532e54d68d8cba05903fb802a10c76)), closes [#323](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/323)
* **call-service:** input_number requires entity list to be an array for multiple entities ([cf64bed](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/cf64bedb2cffe2f80887bb8e60d2e43b2b639109))

## [0.29.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.28.0...v0.29.0) (2021-01-02)


### Features

* **scrubber:** Add the ability to replace all references of HA  server id with custom one ([4eb4323](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/4eb43237cf74255acaa9fe609971930f62d4b171))


### Bug Fixes

* **api:** revert unintended changes ([fb44429](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/fb4442959b7a0d481b0875a1ad7c7e9b55ff14cf))


### Documentation

* Add code copy ([8eb03c8](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8eb03c88090ec2eed438bd13037639ffe404d423))
* Fix link for use case [#2](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/2) JSON code ([#320](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/320)) ([4f168ca](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/4f168ca2d9f4deaf8babe576a2498c1d90b6ab2d))

## [0.28.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.27.9...v0.28.0) (2020-12-31)


### Features

* **time:** Add time node ([74d4415](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/74d4415671dd5645188a8a5e5c68b2514d4e11d5))


### Bug Fixes

* **entity:** check for current connectin before attempting to access it ([53cdb93](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/53cdb93f59b95c8d0978a81544480ff3f529fd72))
* validate base URL before passing it to websocket constructor ([94d603d](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/94d603d3d6fae45bb3b5ce13811c030be63dc941)), closes [#316](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/316)


### Documentation

* Fix TOC for render-template and time ([f4e4ce6](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/f4e4ce6ef396ec296c349051e82f36d40b3660c3))
* **cookbook:** Add use case [#2](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/2) to actionable notifications ([e1d4cab](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e1d4cabbc0c6697f2f6fe80726b294c77fc2e27e))
* Add actionalble notification subflow to cookbook ([51ad8f2](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/51ad8f2881af35e96473d87e2f18464b9c957554))
* Add discussions links ([61c31bd](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/61c31bd24913c3db3be1b4797f93b59d837cbe12))
* Add link to the discussion section for holiday lights ([c9c97b0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/c9c97b0cfabcec937536db46c3d37253e3666d3e))
* fix actionable notifications use case 01 to use trigger nodes ([ee37b9e](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/ee37b9e750a9d4677a8a2578a20be8ef7a3b5db1))
* Fix Daily alarm using Datetime Entity Example to account for leading zeros ([c3cde97](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/c3cde978f6ffb1e0b2673567f07966dfe99b0954))
* Update holiday lights example ([4aae90c](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/4aae90c431e330f21a6ae4972ff21ccfd698c61a))

### [0.27.9](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.27.8...v0.27.9) (2020-12-11)


### Bug Fixes

* check for valid value in list types of conditionals ([7fd9545](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/7fd95459d70f62577b38c4ae0360880b6b7e1dc8)), closes [#301](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/301)
* **events-state:** cast state before setting new/old state ([f49fd82](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/f49fd823952fe1c51b21c96fab919845b6dc3efe)), closes [#299](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/299)


### Documentation

* Add holiday light scheduler example ([5822c41](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/5822c411b93ba900988fae70248f6561aeb6db58))
* Update holiday light scheduler for WLED v0.11 ([0a6054c](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/0a6054c329abb3cd8952b9b4b0b5ab57169ea660))
* Update holiday lights example ([70aff6e](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/70aff6ea4804b956c0af608a92ebd5071829bfde))

### [0.27.8](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.27.7...v0.27.8) (2020-12-05)


### Bug Fixes

* ignore state_changed events that doesn't have a new_state ([85217fd](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/85217fd538286cdbfbab7a344ec0f6eea8e6738d)), closes [#297](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/297)

### [0.27.7](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.27.6...v0.27.7) (2020-12-03)


### Bug Fixes

* fix exposedNode has already been declared error ([aeceffa](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/aeceffaae9967543abcd7fccd29fcd253f2a96c5))

### [0.27.6](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.27.5...v0.27.6) (2020-12-01)


### Bug Fixes

* **event-state:** check if old state is valid before attempting to access state ([a16e964](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/a16e964c454a00367f4c8e300660bc5df01c7273))
* fix eslint and prettier changes ([8497b1a](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8497b1a0e98a02580baef5aa4cf6bc00d2806614))


### Documentation

* **cookbook:** Add starting a flow after HA restart example ([b82affd](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/b82affda5aca33aca2d4de753694ba934d855043))
* Add zone to node index page ([0b5407a](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/0b5407a3c0a6fec52c8a3c2d10b6063233bfe7b3))

### [0.27.5](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.27.4...v0.27.5) (2020-11-19)


### Bug Fixes

* **current-state:** Check the conditional before modify the message ([8154bbd](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/8154bbd765469453b6b540d572dec82ccac25fd8)), closes [#287](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/287)


### Documentation

* Correct REST and Websocket API links ([#280](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/280)) ([cf9d858](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/cf9d858ed0e4fd8ecb895d579e4c7b0fdf82a100))
* Fix cookbook link ([53cc484](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/53cc48457598f318f31eb80cc0873eeafe6e84f5))

### [0.27.4](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.27.3...v0.27.4) (2020-10-11)


### Bug Fixes

* **events-state:** fix logic when checking for valid event ([b6118a5](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/b6118a5ca91dcdcf310e95af22627b6c24ef87f6))

### [0.27.3](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.27.2...v0.27.3) (2020-10-11)


### Bug Fixes

* **events-state:** reset timer active flag when condition is false ([d119307](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d119307618e27d3d7044601a3614d678bf51b88b))

### [0.27.2](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.27.1...v0.27.2) (2020-10-11)


### Bug Fixes

* **events-state:** Don't reset for timer if state changes but condition is still true ([2735eb2](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/2735eb2d3766726b6f68e765f6e4425e60098a09)), closes [#277](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/277)


### Documentation

* **events-state:** Change some wording ([711f334](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/711f334b00879125b24808311c3fe22ac5724b52))

### [0.27.1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.27.0...v0.27.1) (2020-10-06)


### Bug Fixes

* **event-state:** Pass the correct level of the event to msg.data ([4676c08](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/4676c08c808bca1aebff0049fa7577dbcafca9bc))
* **event-state:** Use the correct clear for setTimeout ([db39c3d](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/db39c3df95bca1dcbc12cec103899f40c552e2b0))

## [0.27.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.26.1...v0.27.0) (2020-10-06)


### Features

* **event-state:** Add predefined ignore event types ([d70ba6f](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d70ba6f539e019db8b7ccee418347277eec6844e))
* **events-state:** Add for condition ([61021a8](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/61021a80aad0d47af7e51b9694e2e7630e0ee2f6))
* **zone:** Add enter or leave event type ([735437b](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/735437bac400c94ec404ee1083a7266dba3978ed))


### Bug Fixes

* **event-state:** Add default for unit ([1d66aca](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/1d66aca75de249717419494c909074f779bfa749))
* revert change to ignore state_changed with prev state was null ([4503856](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/4503856fb64975721e2cf40c6202ebc1a4f632e8)), closes [#271](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/271)

### [0.26.1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.26.0...v0.26.1) (2020-09-27)


### Bug Fixes

* **trigger-state:** fix autocomplete for entity id field ([6ce5d0d](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/6ce5d0dc0b998659aeb13bece30c1cf4ffa80400))

## [0.26.0](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.25.1...v0.26.0) (2020-09-27)


### Features

* **trigger-state:** conditions and custom outputs editable ([358c909](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/358c909363d801698e7a8cd2c83c416c84485beb)), closes [#221](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/221)
* **zone:** add ability to expose to HA ([a35a571](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/a35a5719977441e387fda6ef5149015646223410))
* Add zone node ([3ac9cf4](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/3ac9cf4c498057547d6c06f12f511b7d3e775680))


### Bug Fixes

* **zone:** update autocomplete source after new data received ([a6d6c29](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/a6d6c2968ab435a9c808679292952053cc01bd1e))
* fix conditional for null old_state ([ac9158e](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/ac9158e8241b934d91371199c8c81241cf11cf09))
* ignore state_changed event if old_state is null ([6f0a8b5](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/6f0a8b5d1f40b68f37b3ff1ea7651949c137049e)), closes [#266](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/266)

### [0.25.1](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.25.0...v0.25.1) (2020-09-12)


### Bug Fixes

* check isHomeAssistantRunning for output on connect ([64d1b45](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/64d1b45127819df31e5ffef314ef6a0f7125b8f5)), closes [#262](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/262)
* stop enabling trigger-state node on connection to HA ([cba1aad](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/cba1aadbbe3474a001e4787cf85fabde91ebd3ec)), closes [#261](https://www.github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/261)

## [0.25.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.24.1...v0.25.0) (2020-08-29)

### Bug Fixes

- **events-state:** Waiit until HA is running before outputting ([3e62ab7](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/3e62ab7c6c042149b9153657cae92523a35f2002)), closes [#248](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/248)

### Documentation

- Add another example to using datetime entities to trigger flows ([e6ca74e](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/e6ca74ea3050ed894d191c8e410af31ea9da887a))
- Add Using date and time entities to trigger flows ([2b5f228](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/2b5f2284f336ce5634412896f78a83a36a3b7f50))

### [0.24.1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.24.0...v0.24.1) (2020-08-08)

### Bug Fixes

- **wait-until:** Use the rendered template on event check ([5721ebb](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/5721ebbe4182f4c12839282252e3065ad6c362f4)), closes [#259](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/259)

## [0.24.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.23.0...v0.24.0) (2020-08-04)

### Features

- **events-all:** Add option to output events before HA state = running ([3f2e6ec](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/3f2e6ec6c858a9e1148f8df1b37ae05ee651a25f))

## [0.23.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.22.6...v0.23.0) (2020-08-02)

### Features

- Add extra data to the events:all output ([4212cac](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/4212cac8e86ca6ddfe9a30d90b46b5e2828367a2)), closes [#229](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/229)

### Bug Fixes

- Handle resubscribing after a disconnect ([93d396c](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/93d396cc4eca828b3d512db3f35e5586023311cc)), closes [#250](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/250)
- **trigger-state:** Only update HA when integration is loaded ([1c187a5](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/1c187a5f78cc658550248ac4a832c90be73a904f)), closes [#256](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/256)
- wait until NR integration is loaded ([42b02cb](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/42b02cb1c9139f365442bbbaa761aa7a0149d26c))

### Documentation

- add documentation for events: all changes ([6078302](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/6078302a08c93b60e3791e5ceac317f93c116101))

## [0.22.6](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.22.5...v0.22.6) (2020-06-25)

### Bug Fixes

- Wait until HA is in running state to emit events ([92cdb64](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/92cdb64335f88387acf046463fa1ae7448cbf33e)), closes [#246](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/246)
- Wait until integration is loaded before attempting to register entities ([1d8eb04](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/1d8eb04c71e2b51bbe78590595aa69e22977d2c9)), closes [#247](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/247)

## [0.22.5](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.22.4...v0.22.5) (2020-06-03)

## [0.22.4](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.22.3...v0.22.4) (2020-06-03)

## [0.22.3](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.22.2...v0.22.3) (2020-04-25)

### Bug Fixes

- **poll-state:** stop init() from overriding super.init() and being called twice ([0162db6](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/0162db632059dbc88857efeafcc245f79948c21e)), closes [#236](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/236)
- **trigger-state:** enable/disable inputs correctly update state of switch in HA ([b86e32a](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/b86e32a9355fa6a5f416ad3bfd324b832af05329)), closes [#233](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/233)

## [0.22.2](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.22.1...v0.22.2) (2020-04-03)

### Bug Fixes

- "NaN" for events-state-changed ([5aa5b71](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/5aa5b71e945ba6e3fd16063511d47e2fcbc31b7e))
- final final fix for NaN bug ([10325fa](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/10325fa7cfd6bc1dc0c7115a989c5a3d2a271d3e))
- Final fix for NaN ??? ([b363e27](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/b363e27659d8b0482b2de9f18899d4420d8cecef))
- null state for event and states data ([9dc1a7b](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/9dc1a7b01258a4aada1fb48614774329429f5cc2))

## [0.22.1](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.22.0...v0.22.1) (2020-03-30)

### Bug Fixes

- Revert HA websocket lib update ([d07ff35](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d07ff356511f55c16383ffd376a5a118d64c967b)), closes [#225](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/225)

# [0.22.0](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.21.5...v0.22.0) (2020-03-30)

### Bug Fixes

- Process msg property even when set to false ([7028eae](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/7028eaeb9e825ba9a492c5f61abe394f8cd929c9)), closes [#219](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/219)
- **trigger-state:** Restore default value for state_type ([4a26221](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/4a26221a1a2a2fcf3081e83fb110961013852835))
- Wait for persistent data to be loaded before registering with HA ([2f76691](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/2f7669144b10bf9940c11be3400e37590941dd30)), closes [#223](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/223)

### Features

- Improve colors to work better in dark themes ([d153070](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/d153070ca3bd00b303eeab2ee97ebb1a2dc524bf))

## [0.21.5](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.21.4...v0.21.5) (2020-03-09)

### Bug Fixes

- Use correct entity type when removing node from integration ([f842578](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/f842578ead04f61d76bf57c0bb046e51dfde3f90)), closes [#217](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/217)

## [0.21.4](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.21.3...v0.21.4) (2020-03-06)

## [0.21.3](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/compare/v0.21.2...v0.21.3) (2020-02-28)

### Bug Fixes

- **trigger-state:** Use correct entity id when checking against event entity_id ([c3e7729](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/commit/c3e7729245c946aa0c4d8f12f88e098d9e63939c))

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
