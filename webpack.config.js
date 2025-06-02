const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/", // ✅ This line is required for correct asset loading
    clean: true,
  },

  devtool: "eval-source-map", // Better source maps for debugging
  resolve: {
    extensions: [".js", ".jsx"], // Allow omitting .js and .jsx in imports
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, "public"), // ⬅️ Point to static assets folder, not dist
      publicPath: "/",
    },
    historyApiFallback: true,
    compress: true,
    port: 8080,
    hot: true,
    open: true,
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Correct regex for JS/JSX files
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, "src"),
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, "src/index.html"),
      filename: "index.html",
    }),
  ],
};
