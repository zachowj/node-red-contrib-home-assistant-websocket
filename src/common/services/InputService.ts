import Joi from 'joi';
import { NodeMessage } from 'node-red';
import selectn from 'selectn';

import { NodeProperties } from '../../types/nodes';

export enum DataSource {
    Config = 'config',
    Default = 'default',
    Message = 'message',
    Missing = 'missing',
}

export type NodeInputs = Record<
    string,
    {
        configProp?: string;
        default?: any;
        messageProp: string | string[];
    }
>;

interface ParsedMessageValues {
    key: string;
    value: any;
    source: DataSource;
}

export type ParsedMessage = Record<string, ParsedMessageValues>;

export default class InputService<C extends NodeProperties> {
    readonly #inputs: NodeInputs;
    readonly #nodeConfig: C;
    readonly #schema: Joi.ObjectSchema;

    constructor({
        inputs,
        nodeConfig,
        schema,
    }: {
        inputs: NodeInputs;
        nodeConfig: C;
        schema: Joi.ObjectSchema;
    }) {
        this.#inputs = inputs;
        this.#nodeConfig = nodeConfig;
        this.#schema = schema;
    }

    // TODO: Add logic to block input if inputOptions.block is true
    parse(msg: NodeMessage): ParsedMessage {
        const parsedResult: ParsedMessage = {};

        for (const [fieldKey, fieldConfig] of Object.entries(this.#inputs)) {
            // Find messageProp value if it's a string or Array
            // When it's an array lowest valid index takes precedent
            const props = Array.isArray(fieldConfig.messageProp)
                ? fieldConfig.messageProp
                : [fieldConfig.messageProp];
            const messageProp = props.reduce(
                (val, cur) => val ?? selectn(cur, msg),
                undefined
            );

            // Try to load from message
            const result: ParsedMessageValues = {
                key: fieldKey,
                value: messageProp,
                source: DataSource.Message,
            };

            // If message missing value and node has config that can be used instead
            if (result.value === undefined && fieldConfig.configProp) {
                result.value = selectn(
                    fieldConfig.configProp,
                    this.#nodeConfig
                );
                result.source = DataSource.Config;
            }

            if (
                result.value === undefined &&
                fieldConfig.default !== undefined
            ) {
                result.value = fieldConfig.default;
                result.source = DataSource.Default;
            }

            // If value not found in both config and message
            if (result.value === undefined) {
                result.source = DataSource.Missing;
            }

            // Assign result to config key value
            parsedResult[fieldKey] = result;
        }

        return parsedResult;
    }

    validate(parsedMessage: ParsedMessage): boolean {
        const schemaObject = this.parsedMessageToSchemaObject(parsedMessage);
        const { error } = this.#schema.validate(schemaObject);
        if (error) throw error;

        return true;
    }

    private parsedMessageToSchemaObject(
        parsedMessage: ParsedMessage
    ): Record<string, any> {
        const schemaObject: Record<string, any> = {};
        for (const [key, value] of Object.entries(parsedMessage)) {
            schemaObject[key] = value.value;
        }
        return schemaObject;
    }
}
