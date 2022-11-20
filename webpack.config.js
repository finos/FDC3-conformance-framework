const path = require("path");
const webpack = require("webpack");

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: {
    'v1.2': "./src/test/v1.2/index.ts",
    'v2.0': "./src/test/v2.0/index.ts"
  },
  devtool: "source-map",
  output: {
    library: {
      name: "fdc3Compliance",
      type: "umd",
    },
    filename: 'fdc3-compliance-[name].js',
    globalObject: 'this',
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
