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
    },
    plugins: ['sort-requires'],
};
