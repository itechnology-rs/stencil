const path = require('path');


module.exports = {
  globalSetup: path.join(__dirname, 'jest-global-setup.js'),
  globalTeardown: path.join(__dirname, 'jest-global-teardown.js'),
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'json'
  ],
  setupTestFrameworkScriptFile: path.join(__dirname, 'jest-setup-test-framework.js'),
  testEnvironment: path.join(__dirname, 'jest-environment.js'),
  testPathIgnorePatterns: [
    '/.stencil',
    '/dist',
    '/node_modules',
    '/www'
  ],
  testRegex: '/src/.*\\.spec\\.(ts|tsx|js)$',
  transform: {
    '^.+\\.(ts|tsx)$': path.join(__dirname, 'jest-preprocessor.js')
  }
};
