module.exports = {
    root: true,
    extends: ['standard', 'plugin:prettier/recommended'],
    parserOptions: { sourceType: 'module' },
    env: { browser: true },
    rules: {
        'prettier/prettier': ['error', { tabWidth: 4, singleQuote: true }]
    }
};
