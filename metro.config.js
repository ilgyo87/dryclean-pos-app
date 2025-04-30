const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const path = require('path');

// Create a more comprehensive blacklist to avoid duplicate symbols
const blacklist = exclusionList([
  // Exclude specific paths that may cause duplicate symbols
  /#current-cloud-backend\/.*/,
  /amplify\/#current-cloud-backend\/.*/,
  // Exclude nested node_modules with duplicate React/React Native
  /node_modules\/.*\/node_modules\/react-native\/.*/,
  /node_modules\/.*\/node_modules\/react\/.*/,
  // Exclude duplicate AWS Amplify modules
  /node_modules\/.*\/node_modules\/@aws-amplify\/.*/,
  // Exclude duplicate React DOM (often causes conflicts)
  /node_modules\/.*\/node_modules\/react-dom\/.*/,
]);

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  
  config.resolver.blacklistRE = blacklist;
  config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];
  config.resolver.disableHierarchicalLookup = true;
  
  return config;
})();