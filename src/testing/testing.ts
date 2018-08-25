import * as d from '../declarations';
import { getLoaderFileName } from '../compiler/app/app-file-naming';
import { hasError, normalizePath } from '../compiler/util';
import { runJest } from './jest/jest-runner';
import { startPuppeteerBrowser } from './puppeteer/puppeteer-browser';
import * as path from 'path';
import * as puppeteer from 'puppeteer';


export class Testing implements d.Testing {
  isValid = false;
  compiler: d.Compiler;
  config: d.Config;
  devServer: d.DevServer;
  puppeteerBrowser: puppeteer.Browser;
  jestConfigPath: string;

  constructor(config: d.Config) {
    const { Compiler } = require('../compiler/index.js');

    this.compiler = new Compiler(setupTestingConfig(config));
    this.config = this.compiler.config;

    this.isValid = this.compiler.isValid;

    if (this.isValid) {
      if (!config.flags.spec && !config.flags.e2e) {
        config.logger.error(`Testing requires either the --spec or --e2e command line flags, or both. For example, to run unit tests, use the command: stencil test --spec`);
        this.isValid = false;
      }
    }

  }

  async runTests() {
    if (!this.isValid || !this.compiler) {
      return;
    }

    const compiler = this.compiler;
    const config = this.config;
    const { isValid, outputTarget } = getOutputTarget(config);
    if (!isValid) {
      this.isValid = false;
      return;
    }

    const msg: string[] = [];
    if (config.flags.e2e) {
      msg.push('e2e');
    }
    if (config.flags.spec) {
      msg.push('spec');
    }
    config.logger.info(config.logger.magenta(`testing ${msg.join(' and ')} files`));

    const startupResults = await Promise.all([
      compiler.build(),
      compiler.startDevServer(),
      startPuppeteerBrowser(config),
      setupJestConfig(config),
    ]);

    const results = startupResults[0];
    this.devServer = startupResults[1];
    this.puppeteerBrowser = startupResults[2];
    this.jestConfigPath = startupResults[3];

    if (!config.watch && hasError(results && results.diagnostics)) {
      await this.destroy();
      process.exit(1);
    }

    if (this.devServer) {
      const env: d.JestProcessEnv = process.env;
      env.__STENCIL_TEST_BROWSER_URL__ = this.devServer.browserUrl;
      config.logger.debug(`dev server browserUrl: ${env.__STENCIL_TEST_BROWSER_URL__}`);

      env.__STENCIL_TEST_LOADER_SCRIPT_URL__ = getLoaderScriptUrl(config, outputTarget, this.devServer.browserUrl);
      config.logger.debug(`dev server loader script: ${env.__STENCIL_TEST_LOADER_SCRIPT_URL__}`);
    }

    await runJest(config, this.jestConfigPath);
  }

  async destroy() {
    if (this.config) {
      if (this.jestConfigPath) {
        try {
          // await this.config.sys.fs.unlink(this.jestConfigPath);
        } catch (e) {}
      }

      this.config.sys.destroy();
      this.config = null;
    }

    if (this.devServer) {
      await this.devServer.close();
      this.devServer = null;
    }

    if (this.puppeteerBrowser) {
      await this.puppeteerBrowser.close();
      this.puppeteerBrowser = null;
    }

    this.compiler = null;
  }

}


async function setupJestConfig(config: d.Config) {
  const jestConfigPath = path.join(config.rootDir, STENCIL_JEST_CONFIG);

  config.logger.debug(`jest config: ${jestConfigPath}`);

  await config.sys.fs.writeFile(
    jestConfigPath,
    JSON.stringify(config.testing, null, 2)
  );

  return jestConfigPath;
}


function setupTestingConfig(config: d.Config) {
  config.buildEs5 = false;
  config.devMode = true;
  config.maxConcurrentWorkers = 1;
  config.validateTypes = false;

  config.flags = config.flags || {};
  config.flags.serve = false;
  config.flags.open = false;

  return config;
}

function getOutputTarget(config: d.Config) {
  let isValid = true;

  let outputTarget = config.outputTargets.find(o => o.type === 'www') as d.OutputTargetWww;
  if (!outputTarget) {
    outputTarget = config.outputTargets.find(o => o.type === 'dist') as d.OutputTargetWww;
    if (!outputTarget) {
      config.logger.error(`Test missing config output target`);
      isValid = false;
    }
  }
  outputTarget.serviceWorker = null;

  config.outputTargets = [outputTarget];

  return { isValid, outputTarget };
}


function getLoaderScriptUrl(config: d.Config, outputTarget: d.OutputTargetWww, browserUrl: string) {
  let buildDir = path.relative(outputTarget.dir, outputTarget.buildDir);
  buildDir = normalizePath(buildDir);

  if (browserUrl.endsWith('/')) {
    browserUrl = browserUrl.substring(0, browserUrl.length - 1);
  }
  if (buildDir.startsWith('/')) {
    buildDir = buildDir.substring(1);
  }
  if (buildDir.endsWith('/')) {
    buildDir = buildDir.substring(0, buildDir.length - 1);
  }

  return `${browserUrl}/${buildDir}/${getLoaderFileName(config)}`;
}


const STENCIL_JEST_CONFIG = '.stencil.jest.config.json';
