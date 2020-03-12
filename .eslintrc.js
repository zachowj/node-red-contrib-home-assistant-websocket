module.exports = {
    root: true,
    extends: ['standard', 'plugin:prettier/recommended'],
    parserOptions: { sourceType: 'module' },
    env: { browser: true, mocha: true },
    rules: {
        'prettier/prettier': ['error'],
        'sort-requires/sort-requires': 2
    },
    globals: {
        RED: 'readonly',
        $: 'readonly',
        exposeNode: 'readonly',
        haServer: 'readonly',
        ifState: 'readonly',
        nodeVersion: 'readonly'
    },
    plugins: ['sort-requires']
};
