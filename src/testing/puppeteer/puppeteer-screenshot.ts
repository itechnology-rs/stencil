import * as d from '../../declarations';
import * as pd from './puppeteer-declarations';


export function initScreenshot(page: pd.TestPage) {
  const screenshotConfigPath = (process.env as d.JestProcessEnv).__STENCIL_TEST_SCREENSHOT__;
  if (!screenshotConfigPath) {
    // screen shot not enabled, so don't bother creating all this
    page.testshot = () => Promise.resolve();
    return;
  }

  page.testshot = screenshot.bind(null, screenshotConfigPath, page);
}


export async function screenshot(page: pd.TestPage, _screenshotConfigPath: string, opts: pd.TestScreenshotOptions) {
  // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagescreenshotoptions
  (opts as any).encoding = 'binary';

  // const screenshotConfig: d.ScreenshotConfig = require(screenshotConfigPath);

  await page.screenshot(opts);
}
