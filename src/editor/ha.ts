import { EditorNodeInstance } from 'node-red';

import { HassNodeProperties } from './types';
import { isCurrentVersion, versionCheckOnEditPrepare } from './version';

export enum NodeCategory {
    Config = 'config',
    HomeAssistant = 'home_assistant',
    HomeAssistantDeprecated = 'home_assistant_deprecated',
    HomeAssistantEntities = 'home_assistant_entities',
}

export enum NodeColor {
    Action = '#46B1EF',
    Alpha = '#E78BB9',
    Api = '#7CDFFD',
    Beta = '#77DD77',
    Data = '#5BCBF7',
    Deprecated = '#A6BBCF',
    Event = '#399CDF',
    HaBlue = '#41BDF5',
}

const setup = (node: EditorNodeInstance<HassNodeProperties>) => {
    $('#dialog-form, #node-config-dialog-edit-form').addClass('home-assistant');
    versionCheckOnEditPrepare(node);
};

const alphaWarning = (id: number) => {
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

const betaWarning = (id: number) => {
    const alert = $.parseHTML(`
            <div class="ui-state-error ha-beta-box">
                Beta version: Config should be stable and hopefully not too many bugs.
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

function labelStyle(this: EditorNodeInstance<HassNodeProperties>) {
    const classes: string[] = [];

    if (!isCurrentVersion(this)) {
        classes.push('ha-node-label-legacy');
    }
    if (this.name) classes.push('node_label_italic');

    return classes.join(' ');
}

export default {
    alphaWarning,
    betaWarning,
    labelStyle,
    setup,
};
