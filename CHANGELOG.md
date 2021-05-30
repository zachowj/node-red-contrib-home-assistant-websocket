# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
