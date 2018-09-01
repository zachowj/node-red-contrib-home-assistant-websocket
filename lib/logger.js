'use strict';
const prettyPrint = true;

const pinoOpts = {
    level:       'trace',
    name:        'node-home-assistant',
    safe:        true,
    prettyPrint: prettyPrint
};
module.exports = require('pino')(pinoOpts);

