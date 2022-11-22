const path = require("path");
const webpack = require("webpack");

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: {
    'fdc3-compliance-v1.2': "./src/test/v1.2/index.ts",
    'channel-v1.2': "./src/mock/v1.2/channel.ts",
    'general-v1.2': "./src/mock/v1.2/general.ts",
    'intent-a-v1.2': "./src/mock/v1.2/intent-a.ts",
    'intent-b-v1.2': "./src/mock/v1.2/intent-b.ts",
    'intent-c-v1.2': "./src/mock/v1.2/intent-c.ts",
    'fdc3-compliance-v2.0': "./src/test/v2.0/index.ts",
    'channel-v2.0': "./src/mock/v2.0/channel.ts",
    'general-v2.0': "./src/mock/v2.0/general.ts",
    'metadata-v2.0': "./src/mock/v2.0/metadata.ts",
  },
  devtool: "source-map",
  output: {
    filename: '[name].js',
    //globalObject: 'this',
    path: path.resolve(__dirname, "./dist/lib"),
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: [path.resolve(__dirname, "/node_modules/")],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      util: require.resolve("util/"),
      stream: require.resolve("stream-browserify/"),
      buffer: require.resolve("buffer/"),
      window: false,
    },
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};
