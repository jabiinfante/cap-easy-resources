const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = (mode) => ({
  entry: "./src/index.ts",
  stats: {
    errorDetails: true,
  },
  devtool: mode.development ? "eval" : undefined,
  mode: mode.development ? "development" : "production",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /rx\.lite\.aggregates\.js/,
        use: "imports-loader?define=>false",
      },
    ],
  },
  target: "node",
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "rxjs/operators": path.resolve(
        __dirname,
        "node_modules/rxjs/_esm5/operators/"
      ),
    },
  },
  externalsPresets: {
    node: true,
  },
  externals: nodeExternals({
    modulesFromFile: {
      fileName: "package.json",
      includeInBundle: ["devDependencies"],
      excludeFromBundle: ["dependencies"],
    }
  }),
  optimization: {
    nodeEnv: "production",
    sideEffects: true,
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "build"),
  },
});
