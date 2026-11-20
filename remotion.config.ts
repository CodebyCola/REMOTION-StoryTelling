/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import path from "node:path";

Config.setRspack(true);
Config.overrideRspackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...config.resolve?.alias,
      "@engine": path.resolve("src/engine"),
      "@topics": path.resolve("src/topics"),
    },
  },
}));
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
