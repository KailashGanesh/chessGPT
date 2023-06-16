const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    background: './src/scripts/background.ts',
    content: './src/scripts/content.ts',
    popup: './src/scripts/popup.ts',
    overlay: './src/scripts/overlay.ts',
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'scripts/[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/popup.html', to: '.' },
        { from: 'src/manifest.json', to: '.' },
        { from: 'src/images', to: 'images' },
        { from: 'src/css', to: 'css' },
      ],
    }),
  ],
};

