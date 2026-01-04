const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for Node.js core modules for Supabase realtime
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  events: require.resolve('events'),
  stream: require.resolve('readable-stream'),
  buffer: require.resolve('buffer'),
  process: require.resolve('process/browser'),
  crypto: require.resolve('crypto-browserify'),
  https: require.resolve('https-browserify'),
  http: require.resolve('http-browserify'),
  net: require.resolve('net'),
  tls: require.resolve('tls-browserify'),
  url: require.resolve('url'),
  util: require.resolve('util'),
  zlib: require.resolve('browserify-zlib'),
};

module.exports = config;
