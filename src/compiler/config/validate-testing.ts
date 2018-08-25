import * as d from '../../declarations';


export function validateTesting(config: d.Config) {
  const testing = config.testing = config.testing || {};
  const path = config.sys.path;


  if (!Array.isArray(testing.moduleFileExtensions)) {
    testing.moduleFileExtensions = DEFAULT_MODULE_FILE_EXTENSIONS;
  }

  if (!Array.isArray(testing.testPathIgnorePatterns)) {
    testing.testPathIgnorePatterns = DEFAULT_IGNORE_PATTERNS.map(ignorePattern => {
      return config.sys.path.join(config.rootDir, ignorePattern);
    });

    config.outputTargets.forEach((outputTarget: d.OutputTargetWww) => {
      if (outputTarget.dir) {
        testing.testPathIgnorePatterns.push(outputTarget.dir);
      }
    });
  }

  if (typeof testing.setupTestFrameworkScriptFile !== 'string') {
    testing.setupTestFrameworkScriptFile = path.join(
      config.sys.compiler.packageDir, 'testing', 'jest.setupframework.js'
    );

  } else if (!path.isAbsolute(testing.setupTestFrameworkScriptFile)) {
    testing.setupTestFrameworkScriptFile = path.join(
      config.configPath,
      testing.setupTestFrameworkScriptFile
    );
  }

  if (typeof testing.testEnvironment !== 'string') {
    testing.testEnvironment = path.join(
      config.sys.compiler.packageDir, 'testing', 'jest.environment.js'
    );

  } else if (!path.isAbsolute(testing.testEnvironment)) {
    testing.testEnvironment = path.join(
      config.configPath,
      testing.testEnvironment
    );
  }

  testing.transform = testing.transform || {};

  if (typeof testing.transform[DEFAULT_TS_TRANSFORM] !== 'string') {
    testing.transform[DEFAULT_TS_TRANSFORM] = path.join(
      config.sys.compiler.packageDir, 'testing', 'jest.preprocessor.js'
    );

  } else if (!path.isAbsolute(testing.transform[DEFAULT_TS_TRANSFORM])) {
    testing.transform[DEFAULT_TS_TRANSFORM] = path.join(
      config.configPath,
      testing.transform[DEFAULT_TS_TRANSFORM]
    );
  }
}

const DEFAULT_TS_TRANSFORM = '^.+\\.(ts|tsx)$';

const DEFAULT_MODULE_FILE_EXTENSIONS = [
  'ts',
  'tsx',
  'js',
  'json'
];

const DEFAULT_IGNORE_PATTERNS = [
  '.vscode',
  '.stencil',
  'node_modules',
];
