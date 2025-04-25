/* eslint-disable @typescript-eslint/no-require-imports */
const { version } = require('./package.json');
const withPWA = require('next-pwa')({
  disable: process.env.BUILD_ENV !== 'production',
  dest: 'public',
  register: false,
  skipWaiting: true,
  buildExcludes: [/app-build-manifest\.json$/],
});

module.exports = withPWA({
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
  env: {
    APP_VERSION: version,
    APP_BUILD_TIME: new Date().toISOString(),
  },
});