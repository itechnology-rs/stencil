import * as d from '../../declarations';


export function validateScreenshot(config: d.Config) {
  const screenshot = config.screenshot = config.screenshot || {};

  if (config.flags && config.flags.e2e && config.flags.screenshot) {

    if (typeof config.flags.screenshotConnector === 'string') {
      let screenshotConnector = config.flags.screenshotConnector;
      if (!config.sys.path.isAbsolute(screenshotConnector)) {
        screenshotConnector = config.sys.path.join(config.cwd, screenshotConnector);
      }
      screenshot.screenshotConnector = screenshotConnector;

    } else if (typeof screenshot.screenshotConnector !== 'string') {
      screenshot.screenshotConnector = config.sys.path.join(
        config.sys.compiler.packageDir, 'screenshot', 'screenshot.connector.default.js'
      );
    }

  } else {
    screenshot.screenshotConnector = null;
  }

}
