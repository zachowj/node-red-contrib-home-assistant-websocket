import { Options, SearchOptions } from 'select2';

import { containsMustache, isNodeRedEnvVar } from '../../helpers/utils';
import { isjQuery } from '../utils';

export enum Tags {
    Any = 'any',
    Custom = 'custom',
    None = 'none',
}

export enum Select2AjaxEndpoints {
    Entities = 'entitiesSelect2',
}

export interface Select2Data {
    id: string;
    text: string;
    selected: boolean;
    title?: string;
}

interface Select2AjaxOptions {
    endpoint: Select2AjaxEndpoints;
    serverId?: string;
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

export const createSelect2Options = ({
    multiple = false,
    tags = Tags.None,
    customTags = [],
    displayIds = false,
    data,
    ajax,
}: {
    multiple?: boolean;
    tags?: Tags;
    customTags?: string[];
    displayIds?: boolean;
    data?: Select2Data[];
    ajax?: Select2AjaxOptions;
}) => {
    const opts = {
        ...select2DefaultOptions,
        data,
        multiple,
        dropdownAutoWidth: true,
    };

    if (ajax?.serverId) {
        opts.ajax = {
            url: `homeassistant/${ajax.endpoint}/${ajax.serverId}`,
            dataType: 'json',
            delay: 250,
        };
    }
    opts.tags = tags === Tags.Any || tags === Tags.Custom;

    if (tags === Tags.Custom) {
        // Only allow custom entities if they contain mustache tags
        opts.createTag = (params: SearchOptions) => {
            // Allow custom ids to be created when user uses # as a suffix
            if (params.term.endsWith('#')) {
                const id = params.term.substring(0, params.term.length - 1);
                return {
                    id,
                    text: id,
                };
            }
            // Check for valid mustache tags or env var
            if (
                containsMustache(params.term) ||
                isNodeRedEnvVar(params.term) ||
                customTags.includes(params.term)
            ) {
                return {
                    id: params.term,
                    text: params.term,
                };
            }

            return null;
        };
    }

    if (displayIds) {
        opts.templateSelection = (selection) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return selection.id!.toString();
        };
    }

    return opts;
};

// Create select2 data list of ids that don't exist in the current list
export const createCustomIdListByProperty = <T>(
    ids: string | string[] | undefined,
    list: T[],
    opts?: {
        property?: string;
        includeUnknownIds?: boolean;
    }
) => {
    if (!ids) {
        return [];
    }

    return (Array.isArray(ids) ? ids : [ids]).reduce(
        (acc: Select2Data[], id: string) => {
            const propertyId = (item: T) =>
                opts?.property ? item[opts?.property] : item;
            if (
                ((opts?.includeUnknownIds && id) ||
                    containsMustache(id) ||
                    isNodeRedEnvVar(id)) &&
                !list.find((item) => propertyId(item) === id)
            ) {
                acc.push({
                    id,
                    text: id,
                    selected: true,
                });
            }
            return acc;
        },
        []
    );
};

export const isSelect2Initialized = (
    selector: JQuery<HTMLElement> | string
): boolean => {
    const $selector = (
        isjQuery(selector) ? selector : $(selector as string)
    ) as JQuery;
    return $selector.hasClass('select2-hidden-accessible');
};

declare global {
    interface JQuery {
        maximizeSelect2Height: () => void;
    }
}
