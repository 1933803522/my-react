const { override, addLessLoader, addWebpackAlias } = require('customize-cra');
const path = require('path');

// Custom function to add extensions
const addExtensions = (extensions) => (config) => {
  // Ensure resolve and extensions arrays exist
  config.resolve = config.resolve || {};
  config.resolve.extensions = config.resolve.extensions || [];

  extensions.forEach(ext => {
    if (!config.resolve.extensions.includes(ext)) {
      // Add new extensions at the beginning to prioritize them
      config.resolve.extensions.unshift(ext);
    }
  });

  // For verification during development, you might want to log this.
  // console.log('Updated Webpack resolve extensions:', config.resolve.extensions);

  return config;
};

module.exports = override(
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
    },
  }),
  addWebpackAlias({
    '@': path.resolve(__dirname, 'src'),
  }),
  // Add .ts and .tsx to resolve.extensions
  addExtensions(['.ts', '.tsx'])
);
