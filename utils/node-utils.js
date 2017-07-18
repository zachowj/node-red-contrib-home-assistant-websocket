const nodeUtils = module.exports = {};

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
