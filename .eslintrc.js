module.exports = {
    root: true,
    extends: [
        'standard',
        'plugin:prettier/recommended',
        'plugin:mocha/recommended',
        'plugin:chai-friendly/recommended',
    ],
    parserOptions: { sourceType: 'module' },
    env: { browser: true, mocha: true },
    rules: {
        'prettier/prettier': ['error'],
        'sort-requires/sort-requires': 2,
        'no-prototype-builtins': 'off',
    },
    plugins: ['sort-requires'],

    overrides: [
        {
            files: ['**/*.ts'],
            extends: [
                'standard',
                'plugin:prettier/recommended',
                'plugin:mocha/recommended',
                'plugin:chai-friendly/recommended',
                'plugin:@typescript-eslint/recommended',
            ],
            parser: '@typescript-eslint/parser',
            rules: {
                'prettier/prettier': 'error',
                'simple-import-sort/imports': 'error',
                'simple-import-sort/exports': 'error',
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/ban-ts-comment': [
                    2,
                    {
                        'ts-ignore': 'allow-with-description',
                    },
                ],
                'no-prototype-builtins': 'off',
            },
            plugins: ['simple-import-sort', '@typescript-eslint'],
        },
    ],
};
