import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { glob } from 'glob';
import fs from 'fs'

import pkg from 'webpack';
const {BannerPlugin} = pkg;

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  entry: {
     meower: {
      import: "./dist/index"
     },
     /*meower_ext: {
      dependOn: "meower",
      import: resolve("./dist/ext/index.js")
     }*/
  }, // Entry point of your compiled TypeScript code'

  output: {
    filename: '[name].bundle.js', // Output bundle file
    path: resolve(__dirname, 'browser-dist'), // Output directory
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
      }),
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
