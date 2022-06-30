import register from "@babel/register";

register({
  cache: false,
  extensions: [".ts"],
  presets: ["@babel/preset-typescript", "@babel/preset-env"],
});
