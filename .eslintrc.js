module.exports = {
    root: true,
    parserOptions: { sourceType: 'module' },
    env: { browser: true },
    extends: [
        'standard',
        'plugin:prettier/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@vitest/legacy-recommended',
    ],
    parser: '@typescript-eslint/parser',
    rules: {
        'prettier/prettier': 'error',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': [
            'error',
            { caughtErrors: 'none' },
        ],
        '@typescript-eslint/ban-ts-comment': [
            2,
            {
                'ts-ignore': 'allow-with-description',
            },
        ],
        'no-prototype-builtins': 'off',
    },
    plugins: ['simple-import-sort', '@typescript-eslint'],
    overrides: [
        {
            files: ['**/*.js'],
            extends: ['standard', 'plugin:prettier/recommended'],
            rules: {
                'prettier/prettier': ['error'],
                'sort-requires/sort-requires': 2,
                'no-prototype-builtins': 'off',
                '@typescript-eslint/no-require-imports': 'off',
                '@typescript-eslint/no-var-requires': 'off',
            },
            plugins: ['sort-requires'],
        },
    ],
};
