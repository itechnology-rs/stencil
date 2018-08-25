import * as d from '../declarations';
import { getLoaderFileName } from '../compiler/app/app-file-naming';
import { hasError, normalizePath } from '../compiler/util';
import { startPuppeteerBrowser } from './puppeteer/puppeteer-browser';
import * as puppeteer from 'puppeteer';


export class Testing implements d.Testing {
  isValid = false;
  compiler: d.Compiler;
  config: d.Config;
  devServer: d.DevServer;
  puppeteerBrowser: puppeteer.Browser;

  constructor(config: d.Config) {
    const { Compiler } = require('../compiler/index.js');

    this.compiler = new Compiler(setupTestingConfig(config));
    this.config = this.compiler.config;

    this.isValid = this.compiler.isValid;
  }

  async runTests() {
    if (!this.isValid || !this.compiler) {
      return;
    }

    const compiler = this.compiler;
    const config = this.config;
    const outputTarget = getOutputTarget(config);

    config.logger.info(config.logger.magenta('testing build'));

    const startupResults = await Promise.all([
      compiler.build(),
      compiler.startDevServer(),
      startPuppeteerBrowser(config)
    ]);

    const results = await startupResults[0];
    this.devServer = await startupResults[1];
    this.puppeteerBrowser = await startupResults[2];

    if (!config.watch && hasError(results && results.diagnostics)) {
      await this.destroy();
      process.exit(1);
    }

    const env: d.JestProcessEnv = process.env;
    env.__STENCIL_TEST_BROWSER_URL__ = this.devServer.browserUrl;
    env.__STENCIL_TEST_LOADER_SCRIPT_URL__ = getLoaderScriptUrl(config, outputTarget, this.devServer.browserUrl);
  }

  async destroy() {
    if (this.config) {
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
  let outputTarget = config.outputTargets.find(o => o.type === 'www') as d.OutputTargetWww;
  if (!outputTarget) {
    outputTarget = config.outputTargets.find(o => o.type === 'dist') as d.OutputTargetWww;
    if (!outputTarget) {
      throw new Error(`Test missing config output target`);
    }
  }
  outputTarget.serviceWorker = null;

  config.outputTargets = [outputTarget];

  return outputTarget;
}


function getLoaderScriptUrl(config: d.Config, outputTarget: d.OutputTargetWww, browserUrl: string) {
  let buildDir = config.sys.path.relative(outputTarget.dir, outputTarget.buildDir);
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
