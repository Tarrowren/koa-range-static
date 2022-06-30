import { rm } from "fs/promises";
import { resolve } from "path";
import TerserPlugin from "terser-webpack-plugin";
import { promisify } from "util";
import webpack from "webpack";

const mode =
  process.env.NODE_ENV === "production" ? "production" : "development";

if (mode === "production") {
  await rm(resolve("dist"), { recursive: true });
}

const stats = await promisify(webpack)([
  {
    target: "node",
    mode,
    entry: resolve("src", "index.ts"),
    output: {
      path: resolve("dist"),
      filename: "index.js",
      libraryTarget: "commonjs2",
    },
    resolve: {
      extensions: [".ts"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: "ts-loader",
          include: resolve("src"),
          options: {
            transpileOnly: mode !== "production",
          },
        },
      ],
    },
    devtool: mode === "production" ? false : "nosources-source-map",
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
  },
]);

console.log(stats.toString({ chunks: false, colors: true }));
