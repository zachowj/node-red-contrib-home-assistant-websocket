/* global $: false */
// eslint-disable-next-line no-unused-vars
const ha = (function () {
    const nodeColors = {
        action: '#46B1EF',
        alpha: '#E78BB9',
        api: '#7CDFFD',
        beta: '#77DD77',
        data: '#5BCBF7',
        event: '#399CDF',
        haBlue: '#41BDF5',
    };

    const alphaWarning = (id) => {
        const alert = $.parseHTML(`
            <div class="ui-state-error ha-alpha-box">
                Alpha version: At this point anything could change or not work.
                <br />
                Found an issue? Post it in
                <a
                    href="https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues"
                    target="_blank"
                    rel="noreferrer"
                >
                    issues
                </a>
                . Have questions or comments? Post them
                <a
                    href="https://github.com/zachowj/node-red-contrib-home-assistant-websocket/discussions/${id}"
                    target="_blank"
                    rel="noreferrer"
                >
                    here
                </a>
                .
            </div>
        `);

        return alert;
    };

    const betaWarning = (id) => {
        const alert = $.parseHTML(`
            <div class="ui-state-error ha-beta-box">
                Beta version: Config should be stable and hopefully not to many bugs.
                <br />
                Found an issue? Post it in
                <a
                    href="https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues"
                    target="_blank"
                    rel="noreferrer"
                >
                    issues
                </a>
                . Have questions or comments? Post them
                <a
                    href="https://github.com/zachowj/node-red-contrib-home-assistant-websocket/discussions/${id}"
                    target="_blank"
                    rel="noreferrer"
                >
                    here
                </a>
                .
            </div>
        `);

        return alert;
    };

    return {
        alphaWarning,
        betaWarning,
        nodeColors,
    };
})();
