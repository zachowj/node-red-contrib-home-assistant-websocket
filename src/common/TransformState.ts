export enum TransformType {
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

    transform(datatype: TransformType, value: string) {
        if (!datatype) return value;

        switch (datatype) {
            case TransformType.Number:
                return parseFloat(value);
            case TransformType.String:
                return value + '';
            case TransformType.Boolean:
                return !!value;
            case TransformType.Home_Assistant_Boolean: {
                const regex = `^(${this.#haBooleans})$`;
                return new RegExp(regex, 'i').test(value);
            }
            case TransformType.Regexp:
                return new RegExp(value);
            case TransformType.List:
                return value ? value.split(',').map((e) => e.trim()) : [];
            default:
                return value;
        }
    }
}
