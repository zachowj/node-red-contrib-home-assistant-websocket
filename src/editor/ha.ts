import { EditorNodeInstance, EditorRED } from 'node-red';

import { isCurrentVersion } from './nodeversion';
import { HassNodeProperties } from './types';

declare const RED: EditorRED;

export const nodeColors = {
    action: '#46B1EF',
    alpha: '#E78BB9',
    api: '#7CDFFD',
    beta: '#77DD77',
    data: '#5BCBF7',
    event: '#399CDF',
    haBlue: '#41BDF5',
};

export const alphaWarning = (id: number) => {
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

export const betaWarning = (id: number) => {
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

export const i18n = (id: string, args?: Record<string, string | number>) => {
    const namespace = 'node-red-contrib-home-assistant-websocket/all';
    let text = RED._(`${namespace}:${id}`, args);
    if (text.indexOf('\n') !== -1) {
        text = text
            .split('\n')
            .map((line) => `<p>${line}</p>`)
            .join('');
    }

    return text;
};

export function labelStyle(this: EditorNodeInstance<HassNodeProperties>) {
    const classes: string[] = [];

    if (!isCurrentVersion(this)) {
        classes.push('ha-node-label-legacy');
    }
    if (this.name) classes.push('node_label_italic');

    return classes.join(' ');
}
