module.exports = {
    root:          true,
    extends:       'standard',
    parserOptions: { sourceType: 'module' },
    env:           { browser: true },
    rules: {
        'arrow-parens':                0,
        'space-before-function-paren': 0,
        'no-warning-comments':         [0, { 'terms': [ 'todo', 'fixme' ], 'location': 'start' }],
        'generator-star-spacing':      0,
        semi:   ['error', 'always', { 'omitLastInOneLineBlock': true }],
        // Because ocd
        'standard/object-curly-even-spacing': 0,
        'indent': [1, 4, {
            VariableDeclarator: { var: 1, let: 1, const: 1 }
        }],
        // 'key-spacing': [1, { 'align': 'value' } ],
        'no-multi-spaces': [ 0, {
            exceptions: { Property: true, VariableDeclarator: true, ImportDeclaration: true }
        }],
        'max-len':     [1, 200, 4, { ignoreComments: true }],
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
