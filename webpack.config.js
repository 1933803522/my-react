const path = require('path')

module.exports = {
    // 入口文件
    entry: './src/components/addPluginComponent/plugin/devPlugin.js',
    // 打包出口文件
    output: {
        library: {
            name: 'chase',
            type: 'umd'
        },
        filename: 'plugin.bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            // 配置对js后缀文件做react组件化处理
            {
                test: /\.js?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react']
                    }
                }
            },
            // 配置对css样式文件处理
            {
                test: /\.css?$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    // 排除对react module包的打包处理, react在开发组件内用parentReact
    externals: {
        react: {
            commonjs: 'react', // CommonJS 模块
            commonjs2: 'react', // CommonJS 模块
            amd: 'react', // AMD 模块
            root: 'React' // 全局变量访问
        }
    }
}
