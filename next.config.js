/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  output: "standalone",
  reactCompiler: true,
  devIndicators: {},
  allowedDevOrigins: ["192.168.1.23", "localhost:3000"],
};

export default config;
