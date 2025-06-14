module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        jest: true
    },
    extends: 'airbnb', // 使用 eslint-config-airbnb
    parser: 'babel-eslint', // 增强语法识别能力
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 2020,
        sourceType: 'module'
    },
    settings: {
        "import/resolver": {
            "alias": {
                    "map": [
                        ["@", './src'],
                        ["@@", './src/visualPageEditor']
                    ]
                }       
            },
            'import/core-modules': ['react-split'],
    },
    globals: {
        Log: true
    },
    rules: {
    // 这里可以根据需要对 airbnb 的规则进行修改
        'max-len': ['error', {code: 200, "ignoreStrings": true,"ignoreComments": true,"ignoreTrailingComments": true, "ignoreUrls": true}],
        'react/prop-types': 0,
        'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
        'react/jsx-indent': [2, 4],
        'react/jsx-indent-props': [2, 4],
        'jsx-a11y/click-events-have-key-events': 0,
        'jsx-a11y/no-static-element-interactions': 0,
        'jsx-a11y/no-noninteractive-element-interactions': 0,
        'react/jsx-props-no-spreading': 0,
        'jsx-a11y/anchor-is-valid': 0,
        'react/destructuring-assignment': 0,
        'arrow-body-style': 0,
        'arrow-parens': 0,
        'import/prefer-default-export': 0,
        'import/no-cycle': 0,
        'react/forbid-prop-types': 0,
        'jsx-a11y/label-has-associated-control': 0,
        'no-unused-vars': ['off', { vars: 'all', args: 'none', ignoreRestSiblings: false }],
        'no-use-before-define': 0,
        semi: [2, 'never'],
        indent: ['error', 4, { 'SwitchCase': 0 }],
        'comma-dangle': ['error', 'never'],
        'react/no-array-index-key': [0],
        radix: [0, "as-needed"],
        "linebreak-style": [0, "unix"],
        "no-console": ["error", { allow: ["warn", "error", "log", "dir"] }],
        "react/button-has-type": 0,
        camelcase: 'off',
        'template-curly-spacing': 0,
        'no-octal-escape': 0,
    }
}
