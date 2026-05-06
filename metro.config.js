// const { getDefaultConfig } = require("expo/metro-config");
// const { withNativeWind } = require("nativewind/metro");

// const config = getDefaultConfig(__dirname);

// module.exports = withNativeWind(config, {
//   input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
//   forceWriteFileSystem: true,
// });


const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(projectRoot, "node_modules/react-native-css-interop/.cache"),
];

module.exports = withNativeWind(config, {
  input: "./global.css",
});
