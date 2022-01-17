import { Options } from 'select2';

export interface Select2Data {
    id: string;
    text: string;
    selected: boolean;
    title?: string;
}

export const select2DefaultOptions: Options = {
    theme: 'nodered',
    templateResult: (item: any) => {
        return $(
            `<div>${item.text}${
                item.title ? `<p class="sublabel">${item.title}</p>` : ''
            }</div>`
        );
    },
    matcher: (params: any, data: any) => {
        if (params.term == null || params.term.trim() === '') {
            return data;
        }

        const term = params.term.toLowerCase();

        if (typeof data.text === 'undefined') {
            return null;
        }

        if (
            data.text?.toLowerCase().indexOf(term) > -1 ||
            data?.title?.toLowerCase().indexOf(term) > -1
        ) {
            return data;
        }

        return null;
    },
};
