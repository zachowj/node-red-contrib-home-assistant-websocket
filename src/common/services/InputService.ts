import { NodeMessage } from 'node-red';
import selectn from 'selectn';

enum Source {
    Config = 'config',
    Default = 'default',
    Message = 'message',
    Missing = 'missing',
}

interface InputProperty {
    configProp?: string;
    default?: any;
    messageProp: string | string[];
}

interface Inputs {
    [key: string]: InputProperty;
}

type Result = {
    key: string;
    value: any;
    source: Source;
};

export type Results = Record<string, Result>;

const defualtInputs: Inputs = {
    topic: { messageProp: 'topic' },
    payload: { messageProp: 'payload' },
};

export default class InputService {
    private readonly nodeConfig: Record<string, any>;

    constructor({ nodeConfig }: { nodeConfig: Record<string, any> }) {
        this.nodeConfig = nodeConfig;
    }

    // TODO: Add logic to block input if inputOptions.block is true
    parse(inputOptions: Inputs, msg: NodeMessage): Results {
        const parsedResult: Results = {};
        const inputs = { ...defualtInputs, ...inputOptions };

        for (const [fieldKey, fieldConfig] of Object.entries(inputs)) {
            // Find messageProp value if it's a string or Array
            // When it's an array lowest valid index takes precedent
            const messageProp = Array.isArray(fieldConfig.messageProp)
                ? fieldConfig.messageProp.reduce(
                      (val: string, cur: string) => val || selectn(cur, msg)
                  )
                : selectn(fieldConfig.messageProp, msg);

            // Try to load from message
            const result = {
                key: fieldKey,
                value: messageProp,
                source: Source.Message,
            };

            // If message missing value and node has config that can be used instead
            if (result.value === undefined && fieldConfig.configProp) {
                result.value = selectn(fieldConfig.configProp, this.nodeConfig);
                result.source = Source.Config;
            }

            if (
                result.value === undefined &&
                fieldConfig.default !== undefined
            ) {
                result.value = fieldConfig.default;
                result.source = Source.Default;
            }

            // If value not found in both config and message
            if (result.value === undefined) {
                result.source = Source.Missing;
            }

            // Assign result to config key value
            parsedResult[fieldKey] = result;
        }

        return parsedResult;
    }

    validate(schema: any, message: NodeMessage): void {
        // If validation for value is configured run validation, optionally throwing on failed validation
        // if (fieldConfig.validation) {
        //     const { error, value } = fieldConfig.validation.schema.validate(
        //         result.value,
        //         {
        //             convert: true,
        //         }
        //     );
        //     if (error && fieldConfig.validation.haltOnFail) throw error;
        //     result.validation = {
        //         error,
        //         value,
        //     };
        // }
    }
}
