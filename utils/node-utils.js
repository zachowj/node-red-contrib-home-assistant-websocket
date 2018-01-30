'use strict';
const nodeUtils = module.exports = {};
const dateFns = require('date-fns');

nodeUtils.setConnectionStatus = function (node, isConnected, err) {
    if (err) { node.error(`Connection error occured with the home-assistant server: ${JSON.stringify(err)}`) }

    if (isConnected) {
        node.status({ fill: 'green', shape: 'dot', text: 'Connected' });
    } else {
        const statusMsg = (err) ? 'Disconnected (error encountered)' : 'Disconnected';
        node.status({ fill: 'red', shape: 'ring', text: statusMsg });
    }

    node._state.isConnected = isConnected;
};
nodeUtils.flashFlowHaltedStatus = (node, opts = {}) => nodeUtils.flashStatus(node, Object.assign({}, { status: { fill: 'yellow', shape: 'dot' }, showDateTime: true, appendMsg: 'Halted Flow' }, opts));
nodeUtils.flashAttentionStatus =  (node, opts = {}) => nodeUtils.flashStatus(node, Object.assign({}, { status: { fill: 'blue', shape: 'dot' }}, opts));

nodeUtils.formatDate = (date) => dateFns.format(date, 'ddd, h:mm:ss A');

const FLASH_DEFAULTS = {
    flashTimeout:  1500,
    flashInterval: 250,
    showDateTime:  true,
    appendMsg:     null,
    status:        {
        fill:  'blue',
        shape: 'dot'
    }
};

nodeUtils.flashStatus = function (node, opts, cb) {
    opts = Object.assign({}, FLASH_DEFAULTS, opts);

    let status = false;
    const flash = setInterval(() => {
        let show = {};
        if (status) {
            show = opts.status || { fill: 'blue', shape: 'dot' };
        }

        node.status(show);
        status = !status;
    }, opts.flashInterval);

    setTimeout(() => {
        clearInterval(flash);
        // If something is to be shown after the status is cleared
        if (opts.appendMsg || opts.showDateTime || opts.status.text) {
            let statusMsg, dateTime;

            if (opts.showDateTime) {
                dateTime = nodeUtils.formatDate(new Date());
                statusMsg = `@ ${dateTime}`;
            }

            if (opts.appendMsg) {
                statusMsg = `${opts.appendMsg} ${statusMsg || ''}`;
            }

            // Allow direct override
            if (!opts.status.text) { opts.status.text = statusMsg }

            node.status(opts.status);
        // Else just clear status
        } else {
            node.status({});
        }
        // Callback hook
        if (cb) { cb(node) }
    }, opts.flashTimeout);
};
