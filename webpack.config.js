const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const DashboardPlugin = require('webpack-dashboard/plugin');

const merge = require('webpack-merge');
const parts = require('./webpack.parts');

const PATHS = {
    charts: path.join(__dirname, 'src/charts'),
    lib: path.join(__dirname, 'lib'),
    build: path.join(__dirname, 'dist'),
    umd: path.join(__dirname, 'lib/umd'),
    esm: path.join(__dirname, 'lib/esm'),
};

const BUNDLE = path.join(__dirname, 'src/charts/index.js');
const CHARTS = {
    stackedArea: `${PATHS.charts}/stackedArea/StackedAreaComponent.js`,
    legend: `${PATHS.charts}/legend/LegendComponent.js`,
    tooltip: `${PATHS.charts}/tooltip/TooltipComponent.js`,
};


// Configurations
const commonSplittedConfig = merge([
    {
        entry: CHARTS,
        output: {
            path: PATHS.lib,
            filename: '[name].js',
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: 'Webpack demo',
            }),
            // If you require a missing module and then `npm install` it, you still have
            // to restart the development server for Webpack to discover it. This plugin
            // makes the discovery automatic so you don't have to restart.
            // See https://github.com/facebookincubator/create-react-app/issues/186
            new WatchMissingNodeModulesPlugin(path.resolve('node_modules')),
            new DashboardPlugin({port: process.env.PORT}),
        ],
        externals: {
            'react/addons': true,
            'react/lib/ExecutionEnvironment': true,
            'react/lib/ReactContext': true,
        },
    },
    parts.lintJavaScript({
        include: PATHS.charts,
        options: {
            emitWarning: true,
        },
    }),
]);

const developmentConfig = merge([
    parts.devServer({
        host: process.env.HOST,
        port: process.env.PORT,
    }),
    {
        output: {
            devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
        },
    },
    parts.babelLoader(),
    parts.generateSourceMaps({ type: 'cheap-module-eval-source-map' }),
]);

const libraryUMDConfig = merge([
    parts.clean(PATHS.lib),
    commonSplittedConfig,
    {
        output: {
            path: PATHS.umd,
            filename: '[name].min.js',
            library: ['britecharts-react', '[name]'],
            libraryTarget: 'umd'
        },
    },
    parts.babelLoader(),
    parts.generateSourceMaps({ type: 'source-map' }),
    parts.bundleTreeChart(),
    parts.minifyJavaScript(),
]);

const libraryESMConfig = merge([
    parts.clean(PATHS.lib),
    commonSplittedConfig,
    {
        output: {
            path: PATHS.esm,
            filename: '[name].min.js',
        },
    },
    parts.generateSourceMaps({ type: 'source-map' }),
    parts.minifyJavaScript(),
]);

const bundleConfig = merge([
    parts.clean(PATHS.build),
    {
        entry: {
            'britecharts-react': BUNDLE,
        },
        output: {
            path: PATHS.build,
            filename: 'britecharts-react.min.js',
            library: ['britecharts-react'],
            libraryTarget: 'umd',
        },
    },
    parts.babelLoader(),
    parts.generateSourceMaps({ type: 'source-map' }),
    parts.minifyJavaScript(),
]);


module.exports = (env) => {
    console.log('%%%%%%%% env', env);

    if (env === 'production') {
        return [
            libraryESMConfig,
            libraryUMDConfig,
            bundleConfig,
        ];
    }

    return merge(commonSplittedConfig, developmentConfig);
};
