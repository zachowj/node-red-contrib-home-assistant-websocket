import { inputSchema } from '../../../../src/nodes/api';
import { testSchema } from '../../../helpers/inputSchema';

testSchema(
    'api',
    inputSchema,
    [
        ['missing optional fields', {}],
        [
            'http request',
            {
                protocol: 'http',
                method: 'post',
                path: '',
                dataType: 'json',
                data: null,
                location: 'payload',
                locationType: 'msg',
                responseType: 'json',
                outputProperties: [1, {}],
            },
        ],
        [
            'websocket request',
            {
                protocol: 'websocket',
                method: 'get',
                dataType: 'jsonata',
                locationType: 'none',
                responseType: 'arraybuffer',
            },
        ],
        ['text response', { responseType: 'text' }],
    ],
    [
        ['unknown protocol', { protocol: 'mqtt' }],
        ['unknown method', { method: 'patch' }],
        ['invalid path', { path: 1 }],
        ['invalid data type', { dataType: 'msg' }],
        ['empty location', { location: '' }],
        ['invalid location type', { locationType: 'json' }],
        ['invalid response type', { responseType: 'xml' }],
        ['invalid output properties', { outputProperties: {} }],
        ['unknown field', { extra: true }],
    ],
);
