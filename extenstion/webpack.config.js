const path = require("path");
const copyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin =require("mini-css-extract-plugin");

module.exports = {
  mode: "production",
  entry: {
    popup: path.resolve(__dirname, "src/js/popup.js"),
    script: path.resolve(__dirname, "src/js/script.js"),
  },
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "public"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(c|sc|sa)ss$/g,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ],
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css",
    }),
    new copyWebpackPlugin({
      patterns: [
        { from: "src/assets/", to: path.resolve(__dirname, "public") },
        { from: "src/index.html", to: path.resolve(__dirname, "public") },
      ],
    }),
  ],
};