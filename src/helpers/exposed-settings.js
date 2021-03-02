const { getCurrentVersion } = require('../migrations');
const { toCamelCase } = require('./utils');

function getExposedSettings(type) {
    const name = toCamelCase(type).replace(/-/g, '');

    const expose = {
        settings: {
            [`${name}Version`]: {
                value: getCurrentVersion(type),
                exportable: true,
            },
        },
    };

    if (type === 'server') {
        expose.credentials = {
            host: { type: 'text' },
            access_token: { type: 'text' },
        };
    }

    return expose;
}

module.exports = {
    getExposedSettings,
};
