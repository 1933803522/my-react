module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        jest: true
    },
    // Use @babel/eslint-parser for JS files, and @typescript-eslint/parser for TS files via overrides.
    // The main parser will be @typescript-eslint/parser due to airbnb-typescript.
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json', // Required for airbnb-typescript and type-aware linting rules
    },
    extends: [
        'airbnb',
        'airbnb-typescript', // Integrates Airbnb rules with TypeScript
        // Add 'prettier' or other formatting related configs last if they are used
    ],
    settings: {
        "import/resolver": {
            "alias": {
                "map": [
                    ["@", './src'],
                    ["@@", './src/visualPageEditor']
                ],
                // Add .ts and .tsx to extensions for alias resolver
                "extensions": [".js", ".jsx", ".json", ".ts", ".tsx"]
            },
            // Add eslint-import-resolver-typescript for .ts/.tsx files
            "typescript": {
                "alwaysTryTypes": true, // try to resolve types under @types folder
                "project": "./tsconfig.json",
            }
        },
        'import/parsers': { // Tell eslint-plugin-import to use typescript-eslint parser for .ts/.tsx files
          '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/core-modules': ['react-split'],
    },
    globals: {
        Log: true
    },
    rules: {
        // Existing rules from the original file:
        'max-len': ['error', {code: 200, "ignoreStrings": true,"ignoreComments": true,"ignoreTrailingComments": true, "ignoreUrls": true}],
        'react/prop-types': 0, // Often turned off in TypeScript projects as types handle this
        'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.tsx'] }], // Added .tsx
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
        'import/prefer-default-export': 0, // airbnb-typescript might handle this differently, review if needed
        'import/no-cycle': 0,
        'react/forbid-prop-types': 0,
        'jsx-a11y/label-has-associated-control': 0,
        'no-unused-vars': 'off', // @typescript-eslint/no-unused-vars is used instead by airbnb-typescript
        '@typescript-eslint/no-unused-vars': ['warn', { vars: 'all', args: 'none', ignoreRestSiblings: false }], // Example, adjust as needed
        'no-use-before-define': 'off', // Often replaced by @typescript-eslint/no-use-before-define
        '@typescript-eslint/no-use-before-define': ['error'], // Or ['off'] if preferred
        semi: [2, 'never'],
        indent: 'off', // Let Prettier or editor handle this, or use @typescript-eslint/indent
        // '@typescript-eslint/indent': ['error', 4, { 'SwitchCase': 0 }], // if you want ESLint to handle TS indent
        'comma-dangle': ['error', 'never'],
        'react/no-array-index-key': [0],
        radix: [0, "as-needed"],
        "linebreak-style": [0, "unix"],
        "no-console": ["error", { allow: ["warn", "error", "log", "dir"] }],
        "react/button-has-type": 0,
        camelcase: 'off', // In TypeScript, often prefer @typescript-eslint/naming-convention
        'template-curly-spacing': 0,
        'no-octal-escape': 0,

        // It's good practice to turn off ESLint rules that are handled by TypeScript or might conflict with @typescript-eslint rules.
        // airbnb-typescript handles many of these, but some might need explicit configuration.
        // For example, if using @typescript-eslint/indent, turn off base indent.
        // 'indent': 'off', (already did this)

        // Rules from airbnb-typescript might make some of the above redundant or conflicting.
        // For example, airbnb-typescript already sets many @typescript-eslint rules.
        // It's best to start with a minimal set of overrides after extending airbnb-typescript
        // and add specific rules back if needed.

        // Let's simplify the rules section initially, relying more on airbnb and airbnb-typescript defaults.
        // We can add back specific overrides if linting errors show they are needed.
        // The 'no-unused-vars' and 'no-use-before-define' are important to handle correctly with their @typescript-eslint counterparts.
    },
    overrides: [
        {
            files: ['*.js', '*.jsx'],
            parser: '@babel/eslint-parser', // Use babel-parser for JS files
            parserOptions: {
                ecmaFeatures: { jsx: true },
                ecmaVersion: 2020,
                sourceType: 'module',
            },
            rules: {
                // JS-specific rules can go here if needed
                // For example, if @typescript-eslint/no-unused-vars is too strict for JS:
                // '@typescript-eslint/no-unused-vars': 'off',
                // 'no-unused-vars': ['warn', { vars: 'all', args: 'none', ignoreRestSiblings: false }],
            }
        },
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                // TypeScript specific rule adjustments
                'react/prop-types': 'off', // Not needed in TypeScript
                 // Ensure existing no-unused-vars and no-use-before-define are off for TS files
                'no-unused-vars': 'off',
                'no-use-before-define': 'off',
                '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
                '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: true, variables: true, enums: true, typedefs: true }],
                // Potentially relax some very strict airbnb rules for TS if needed
                'import/prefer-default-export': 'off', // Common preference in TS projects
                '@typescript-eslint/explicit-function-return-type': 'off', // Can be verbose
                'react/require-default-props': 'off', // Not as critical with TypeScript optional types
            }
        }
    ]
};
