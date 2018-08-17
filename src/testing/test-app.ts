import * as d from '../declarations';
import { getLoaderFileName } from '../compiler/app/app-file-naming';
import { normalizePath } from '../compiler/util';


let compiler: d.Compiler = null;
let devServer: d.DevServer = null;

export async function setupTestApp(config: d.Config) {
  console.log('');

  const { Compiler } = require('../compiler/index.js');

  compiler = new Compiler(config);

  if (!compiler.isValid) {
    return;
  }

  let outputTarget = config.outputTargets.find(o => o.type === 'www') as d.OutputTargetWww;
  if (!outputTarget) {
    outputTarget = config.outputTargets.find(o => o.type === 'dist') as d.OutputTargetWww;
    if (!outputTarget) {
      throw new Error(`Jest test missing config output target`);
    }
  }

  compiler.config.outputTargets = config.outputTargets = [outputTarget];

  const devServerPromise = compiler.startDevServer();

  await compiler.build();

  devServer = await devServerPromise;

  const env: d.JestProcessEnv = process.env;
  env.__STENCIL_TEST_ROOT_DIR__ = config.rootDir;
  env.__STENCIL_TEST_BROWSER_URL__ = devServer.browserUrl;
  env.__STENCIL_TEST_LOADER_SCRIPT_URL__ = getLoaderScriptUrl(config, outputTarget, devServer.browserUrl);
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


export async function teardownTestApp() {
  if (compiler) {
    compiler.config.sys.destroy();
    compiler = null;
  }
  if (devServer) {
    await devServer.close();
    devServer = null;
  }
}
