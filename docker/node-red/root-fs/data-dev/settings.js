module.exports = {
    uiPort:              process.env.PORT || 1880,
    mqttReconnectTime:   15000,
    serialReconnectTime: 15000,
    debugMaxLength:      1000,
    debugUseColors:      true,
    flowFilePretty:      true,


    // context.global.os for example
    functionGlobalContext: { os: require('os') },
    paletteCategories:     ['home_assistant', 'subflows', 'input', 'output', 'function', 'social', 'mobile', 'storage', 'analysis', 'advanced'],
    logging:               {
        console: {
            level:   'debug',
            metrics: false,
            audit:   false
        }
    }
}
