import { NodeCredentials } from 'node-red';

import { Credentials } from '../homeAssistant';
import { getCurrentVersion } from '../migrations';
import { toCamelCase } from './utils';

type Options = {
    credentials?: NodeCredentials<Credentials>;
    settings: {
        [key: string]: {
            value: number;
            exportable: boolean;
        };
    };
};

export function getExposedSettings(type: string) {
    const name = toCamelCase(type).replace(/-/g, '');

    const expose: Options = {
        settings: {
            [`${name}Version`]: {
                value: getCurrentVersion(type),
                exportable: true,
            },
        },
    };

    if (type === 'server') {
        expose.credentials = {
            host: { type: 'text' },
            access_token: { type: 'text' },
        };
    }

    return expose;
}
