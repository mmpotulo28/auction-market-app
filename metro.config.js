const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { getDefaultConfig } = require('expo/metro-config');

const config = getSentryExpoConfig(__dirname, getDefaultConfig(__dirname));

// Add resolver configuration for lucide-react-native
config.resolver = {
  ...config.resolver,
  resolverMainFields: ['react-native', 'browser', 'main'],
  platforms: ['ios', 'android', 'native', 'web']
};

module.exports = config;
