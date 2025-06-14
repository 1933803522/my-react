// eslint-disable-next-line import/no-extraneous-dependencies
const { override, addLessLoader, addWebpackAlias } = require('customize-cra')
const path = require('path')

module.exports = override(
    addLessLoader({
        lessOptions: {
            javascriptEnabled: true
        }
    }),
    addWebpackAlias({
        '@': path.resolve(__dirname, 'src')
    })
)
