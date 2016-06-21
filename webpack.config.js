  'use strict';

var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');
var ENV = process.env.npm_lifecycle_event;
var isProd = ENV === 'build';

module.exports = (function makeWebpackConfig () {
  var config = {};

  config.entry = {
    app: './src/app/app.js',
    vendor: ['angular', 'angular-route','angular-resource']
  };

  config.output = {
    path: path.resolve(__dirname, './dist'),
    publicPath: isProd ? '' : 'http://localhost:8080/',
    filename: isProd ? 'js/[name].[hash].js' : 'js/[name].bundle.js',
    chunkFilename: isProd ? 'js/[name].[hash].js' : 'js/[name].bundle.js'
  };

  if (isProd) {
    config.devtool = 'source-map';
  } else {
    config.devtool = 'eval-source-map';
  }

  config.resolve = {
    modulesDirectories: [
      'node_modules',
      'src/app'
    ]
  };

  config.module = {
    preLoaders: [],
    loaders: [
      // Javascript loaders
      {
        test: /\.js$/,
        loaders: ['ng-annotate', 'babel'],
        exclude: /node_modules/
      },
      // Images loaders
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
        loader: 'file?name=[name].[ext]?[hash]'
      },
      // HTML loaders
      { test: /\.html$/, loader: 'raw', exclude: /node_modules/ }
    // {
    //   test: /\.html$/,
    //   loader: 'ngtemplate?relativeTo=' + (path.resolve(__dirname, './src')) + '/!html',
    //   exclude: /index\.html/
    // }
    ]
  };

  config.plugins = [];

  config.plugins.push(
    new HtmlWebpackPlugin({
      hash: true,
      template: './src/_public/index.html',
      inject: 'body'
    })
  );

  // Build Version
  if (isProd) {

    // extract css to styles.css
    config.module.loaders.push({
      test: /\.(css|scss)$/,
      loader: ExtractTextPlugin.extract ("css?sourceMap!sass?sourceMap"),
       exclude: /http/,
    })

    config.plugins.push( new ExtractTextPlugin(
      "ExtractTextPlugin",
      "css/styles.css", { allChunks: true }
    ));

    config.plugins.push(
      new webpack.NoErrorsPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
      new CopyWebpackPlugin( [
          { from: path.resolve(__dirname, './src/_public/data'), to: 'data' },
          { from: path.resolve(__dirname, './src/_public/img'), to: 'img' }
        ],
        { ignore: ['*.html'] }
      )
    );

  }
  // Live Reload Version
  else {
    config.module.loaders.push({
      test: /\.(css|scss)$/,
      loaders: [ 'style', 'css?sourceMap', 'sass?sourceMap' ]
    });

  }

  config.devServer = {
    contentBase: './src/_public',
    stats: 'minimal'
  };

  return config;
}());