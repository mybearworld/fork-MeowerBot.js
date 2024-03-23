import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { glob } from 'glob';
import fs from 'fs'


import pkg from 'webpack';
const {BannerPlugin} = pkg;

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {

  entry: {
     main: ["./dist/index.js"],
     meower: glob.sync(join(__dirname, './dist/**/*.js'))
  }, // Entry point of your compiled TypeScript code
  output: {
    filename: '[name].bundle.js', // Output bundle file
    path: resolve(__dirname, 'browser-dist'), // Output directory
    library: '@meower-media/meower',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  plugins: [
      new BannerPlugin({
        banner: () => {
          return fs.readFileSync(join(__dirname, 'LICENSE'), 'utf-8')
        } 
      }),
    ],

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
