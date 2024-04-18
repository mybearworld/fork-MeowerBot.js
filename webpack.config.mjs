import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import fs from 'fs'

import pkg from 'webpack';
const { BannerPlugin } = pkg;

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  entry: {
    meower: {
      import: "./dist/index"
    },
    bot: {
      import: "./dist/ext/bot/index",
      dependOn: ['meower']
    },

  }, // Entry point of your compiled TypeScript code'

  output: {
    filename: '[name].bundle.js', // Output bundle file
    path: resolve(__dirname, 'dist/browser'), // Output directory
    library: {
      name: 'Meower',
      type: 'umd',
    },
    libraryTarget: 'umd',
    umdNamedDefine: true,
    publicPath: "./dist/index.js"
  },
  plugins: [
    new BannerPlugin({
      banner: () => {
        return fs.readFileSync(join(__dirname, 'LICENSE'), 'utf-8')
      }
    })
  ],
  resolveLoader: {
    modules: [
      join(__dirname, 'node_modules')
    ]
  },
  resolve: {
    modules: [
      join(__dirname, 'node_modules')
    ]
  },
  module: {

    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Use babel-loader to transpile JavaScript files
          options: {
            sourceType: "unambiguous",
            presets: ['@babel/preset-env'],
            plugins: [
              "@babel/plugin-transform-modules-amd",
            ]
          },

        }
      }
    ]
  },
}
