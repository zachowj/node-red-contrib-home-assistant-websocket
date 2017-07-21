const nodeUtils = module.exports = {};
const dateFns = require('date-fns')

nodeUtils.setConnectionStatus = function (node, isConnected, err) {
    // Only update if state changes and we don't have an error to display
    if (!err && node._state.isConnected === isConnected) { return; }
    if (err) { node.error(`Connection error occured with the home-assistant server: ${JSON.stringify(err)}`); }

    if (isConnected) { node.status({ fill: 'green', shape: 'ring', text: 'Connected' });  }
    else {
        const statusMsg = (err) ? `Disconnected (error encountered)` : 'Disconnected';
        node.status({ fill: 'red', shape: 'ring', text: statusMsg });
    }

    node._state.isConnected = isConnected;
};

nodeUtils.formatDate = (date) => dateFns.format(date, 'MM/DD/YYYY h:mm:ss A')


const FLASH_DEFAULTS = {
    flashTimeout:  1200,
    flashInterval: 200,
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
        const show = (status) ? { fill: 'blue', shape: 'dot' } : {};
        node.status(show);
        status = !status;
    }, opts.flashInterval);

    setTimeout(() => {
        clearInterval(flash);
        // If something is to be shown after the status is cleared
        if (opts.appendMsg || opts.showDateTime || opts.status.text) {
            let statusMsg = opts.appendMsg;

            if (opts.showDateTime) {
                statusMsg = nodeUtils.formatDate(new Date());
                statusMsg = opts.appendMsg
                    ? statusMsg + `: ${opts.appendMsg}`
                    : statusMsg;
            }
            if (!opts.status.text) { opts.status.text = statusMsg; }

            node.status(opts.status);
        // Else just clear status
        } else {
            node.status({});
        }
        // Callback hook
        if (cb) { cb(node); }
    }, opts.flashTimeout);
};
