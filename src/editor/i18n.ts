import { EditorRED } from 'node-red';

declare const RED: EditorRED;

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
