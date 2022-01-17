import * as haData from './data';
import { isjQuery } from './utils';

interface HassAutocompleteOptions {
    serverId: string;
    type: haData.AutocompleteType;
}

const DEFAULT_OPTIONS: HassAutocompleteOptions = {
    serverId: '#node-input-server',
    type: 'entities',
};

export function hassAutocomplete({
    root,
    options,
}: {
    root: string | JQuery;
    options?: Partial<HassAutocompleteOptions>;
}) {
    const $root: JQuery = (isjQuery(root) ? root : $(root as string)) as JQuery;
    const settings: HassAutocompleteOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
    };

    const serverId = $(settings.serverId).val() as string;
    const type = settings.type;
    $root
        .autocomplete({
            source: (
                request: { term: string },
                response: (arg0: { value: any; label: any }[]) => void
            ) => {
                const term = request.term.toLowerCase();
                const data = haData
                    .getAutocompleteData(serverId, type)
                    .filter((item) => {
                        return (
                            item.value.toLowerCase().includes(term) ||
                            item.label.toLowerCase().includes(term)
                        );
                    });
                response(data);
            },
            minLength: 0,
        })
        // @ts-ignore - DefinitelyTyped is missing this method
        .autocomplete('instance')._renderItem = (
        ul: JQuery,
        item: { label: string; value: string }
    ) => {
        return $('<li>')
            .append(
                `<div>${item.label}<p class="sublabel">${item.value}</p></div>`
            )
            .appendTo(ul);
    };
}
