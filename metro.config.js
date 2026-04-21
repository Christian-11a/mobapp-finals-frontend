const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase JS SDK v9+ uses .cjs files.
// Metro needs to be configured to handle these correctly.
config.resolver.sourceExts.push('cjs');
config.resolver.sourceExts.push('mjs');

// Removing unstable_enablePackageExports as it's enabled by default in modern Expo
 // and setting it to false breaks modern package resolutions (like Reanimated or Firebase).

module.exports = config;
