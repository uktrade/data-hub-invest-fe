const webpack = require('webpack')
const prod = process.env.NODE_ENV === 'production'

module.exports = {
  devtool: prod ? 'hidden-source-map' : 'source-map',
  entry: {
    contactform: './src/forms/contactform.js',
    interactionform: './src/forms/interactionform.js',
    companyinvestmenttabform: './src/forms/companyinvestmenttabform',
    companyadd: './src/forms/companyadd',
    companyedit: './src/forms/companyedit'
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
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM'
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
