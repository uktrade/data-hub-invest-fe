const webpack = require('webpack')
const prod = process.env.NODE_ENV === 'production'

module.exports = {
  devtool: prod ? 'hidden-source-map' : 'source-map',
  entry: {
    companyinvestmenttabform: './src/forms/companyinvestmenttabform',
    companyadd: './src/forms/companyadd',
    companyedit: './src/forms/companyedit',
    investment: './src/forms/investment',
    createinvestment: './src/forms/createinvestment',
    leftnav: './src/lib/leftnav',
    investment_details: './src/lib/pages/investment/details'
  },
  output: {
    path: 'build/javascripts',
    filename: '[name].bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: './babel_cache'
        }
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    modules: [
      'src',
      'node_modules'
    ]
  },
  plugins: prod ? [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }}),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      },
      sourceMap: false,
      dead_code: true
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.CommonsChunkPlugin('common.js')
  ] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.CommonsChunkPlugin('common.js')
  ]
}
