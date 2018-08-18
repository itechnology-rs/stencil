import * as d from '../declarations';
import * as fs from 'fs';
import * as path from 'path';


export function setupTestConfig() {
  const nodeSys = require('../sys/node/index.js');

  const sys: d.StencilSystem = new nodeSys.NodeSystem();
  const logger: d.Logger = new nodeSys.NodeLogger();

  let config: d.Config = null;

  const stencilDir = findStencilRootDir();
  config = sys.loadConfigFile(stencilDir);

  if (!config.rootDir) {
    config.rootDir = stencilDir;
  }

  config.sys = sys;
  config.logger = logger;

  config.buildEs5 = false;
  config.devMode = true;
  config.maxConcurrentWorkers = 1;
  config.validateTypes = false;

  config.flags = config.flags || {};
  config.flags.serve = false;
  config.flags.open = false;

  config.flags.debug = process.argv.includes('--debug');

  return config;
}


function findStencilRootDir() {
  const cwd = process.cwd();
  let dir = path.resolve(cwd);
  const rootDir = path.parse(dir).root;

  while (true) {
    if (isStencilRootDir(dir)) {
      return dir;
    }

    if (dir === rootDir) {
      return cwd;
    }

    dir = path.dirname(dir);
  }
}


function isStencilRootDir(dir: string) {
  return CONFIGS.some(configName => {
    try {
      const configFilePath = path.join(dir, configName);
      fs.accessSync(configFilePath);
      return true;

    } catch (e) {}
    return false;
  });
}

const CONFIGS = ['stencil.config.ts', 'stencil.config.js', 'tsconfig.json', 'package.json'];
