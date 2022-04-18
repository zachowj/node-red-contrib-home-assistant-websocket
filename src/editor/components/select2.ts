import { Options, SearchOptions } from 'select2';

import { containsMustache } from '../../helpers/mustache';
import { isNodeRedEnvVar } from '../../helpers/utils';
import { isjQuery } from '../utils';

export enum Tags {
    Any,
    Custom,
    None,
}

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

export const createSelect2Options = ({
    multiple = false,
    tags = Tags.None,
    customTags = [],
    displayIds = false,
    data,
}: {
    multiple?: boolean;
    tags?: Tags;
    customTags?: string[];
    displayIds?: boolean;
    data?: Select2Data[];
}) => {
    const opts = {
        ...select2DefaultOptions,
        data: data,
        multiple: multiple,
        dropdownAutoWidth: true,
    };

    opts.tags = tags === Tags.Any || tags === Tags.Custom;

    if (tags === Tags.Custom) {
        // Only allow custom entities if they contain mustache tags
        opts.createTag = (params: SearchOptions) => {
            // Allow custom ids to be created when user uses # as a suffix
            if (params.term.endsWith('#')) {
                const id = params.term.substring(0, params.term.length - 1);
                return {
                    id: id,
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
        };
    }

    if (displayIds) {
        opts.templateSelection = (selection) => {
            return selection.id.toString();
        };
    }

    return opts;
};

// Create select2 data list of ids that don't exist in the current list
export const createCustomIdListByProperty = <T>(
    ids: string | string[],
    list: T[],
    opts?: {
        property?: string;
        includeUnknownIds?: boolean;
    }
) => {
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
                    id: id,
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
