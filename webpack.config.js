const path = require("path");
const { DefinePlugin } = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const isProd = process.env.NODE_ENV === "production";
const outputPath = path.resolve(__dirname, "build");
const publicPath = "/public/";

/** @type {import('webpack').Configuration} */
const config = {
  mode: isProd ? "production" : "development",
  devtool: isProd ? false : "inline-source-map",
  entry: {
    index: "./src/index.tsx"
  },
  output: {
    filename: isProd ? "[name].bundle.[contenthash:8].js" : "[name].bundle.js",
    path: outputPath,
    publicPath: isProd ? publicPath : "/",
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/i,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      // https://stackoverflow.com/a/68273109/6277806
      {
        test: /\.s?css$/i,
        use: [
          isProd ? MiniCssExtractPlugin.loader : "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 2,
              sourceMap: !isProd
            }
          },
          "postcss-loader",
          {
            loader: "sass-loader",
            options: {
              // Prefer `dart-sass`
              implementation: require("sass"),
              sourceMap: !isProd
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource"
      },
    ]
  },
  resolve: {
    alias: {
      "@/components": path.resolve(__dirname, 'src/components/'),
      "@/utils": path.resolve(__dirname, 'src/utils.ts')
    },
    extensions: [".tsx", ".ts", ".jsx", ".js"]
  },
  plugins: [
    new DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
    new CopyPlugin({
      patterns: [
        "public/favicon.ico",
        "public/logo192.png",
        "public/logo512.png",
        "public/manifest.json",
        "public/robots.txt"
      ]
    })
  ],
  optimization: {
    // https://blog.csdn.net/weixin_42349568/article/details/124229170
    nodeEnv: false,
    runtimeChunk: "single"
  }
};

const HtmlWebpackPluginConfig = {
  publicPath: isProd ? publicPath : "/",
  template: path.resolve(__dirname, "public/index.html"),
  favicon: path.resolve(__dirname, "public/favicon.ico")
};

if (isProd) {
  config.plugins.push(new HtmlWebpackPlugin(
    Object.assign({
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }, HtmlWebpackPluginConfig)
  ));
  config.plugins.push(new MiniCssExtractPlugin({
    filename: "main.[contenthash:8].css"
  }));
  config.optimization.splitChunks = {
    chunks: "all",
    maxInitialRequests: Infinity,
    minSize: 0,
    cacheGroups: {
      reactSuite: {
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: "react-suite"
      },
      vendor: {
        test: /[\\/]node_modules[\\/](!react)(!react-dom)[\\/]/,
        name: "vendor"
      }
    }
  }
} else {
  config.plugins.push(new HtmlWebpackPlugin(HtmlWebpackPluginConfig));
  config.devServer = {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT),
    static: outputPath,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    hot: true
  };
  config.watchOptions = {
    ignored: /node_modules/,
    aggregateTimeout: 500, // delay before reloading
    poll: 1000 // enable polling since fsevents are not supported in docker
  };
}

module.exports = config;
