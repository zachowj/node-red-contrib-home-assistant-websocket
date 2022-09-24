export enum DataType {
    Boolean = 'bool',
    Home_Assistant_Boolean = 'habool',
    List = 'list',
    Number = 'num',
    Regexp = 're',
    String = 'str',
}

export default class TransformState {
    readonly #haBooleans: string;

    constructor(haBooleans = 'y|yes|true|on|home|open') {
        this.#haBooleans = haBooleans;
    }

    transform(datatype: DataType, value: string) {
        if (!datatype) return value;

        switch (datatype) {
            case DataType.Number:
                return parseFloat(value);
            case DataType.String:
                return value + '';
            case DataType.Boolean:
                return !!value;
            case DataType.Home_Assistant_Boolean: {
                const regex = `^(${this.#haBooleans})$`;
                return new RegExp(regex, 'i').test(value);
            }
            case DataType.Regexp:
                return new RegExp(value);
            case DataType.List:
                return value ? value.split(',').map((e) => e.trim()) : [];
            default:
                return value;
        }
    }
}
