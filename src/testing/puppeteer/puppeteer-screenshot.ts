import * as d from '../../declarations';
import * as pd from './puppeteer-declarations';
import * as puppeteer from 'puppeteer';
import * as crypto from 'crypto';


declare const global: d.JestEnvironmentGlobal;


export function initScreenshot(page: pd.TestPage) {
  const screenshotAdapterPath = (process.env as d.JestProcessEnv).__STENCIL_TEST_SCREENSHOT__;
  if (!screenshotAdapterPath) {
    // screen shot not enabled, so don't bother creating all this
    page.e2eScreenshot = () => Promise.resolve();
    return;
  }

  page.e2eScreenshot = screenshot.bind(page, page, screenshotAdapterPath);
}


export async function screenshot(page: pd.TestPage, screenshotAdapterPath: string, opts: d.TestScreenshotOptions) {
  const plugin: d.ScreenshotAdapterPlugin = require(screenshotAdapterPath);

  const adapter = plugin();

  const testSpecData: d.TestSpecData = {
    testId: opts.testId ? opts.testId : createTestId(global.specData),
    testDesc: opts.testDesc ? opts.testDesc : global.specData.fullName,
    testPath: global.specData.testPath
  };

  if (typeof adapter.beforeScreenshot === 'function') {
    const rtn: any = adapter.beforeScreenshot(Object.assign({}, testSpecData));
    if (rtn) {
      let results: d.BeforeScreenshotResults;

      if (typeof rtn.then === 'function') {
        results = await rtn;
      } else {
        results = rtn;
      }

      if (results) {
        if (results.skipScreenshot) {
          return;
        }
        if (typeof results.testId === 'string') {
          testSpecData.testId = results.testId;
        }
        if (typeof results.testDesc === 'string') {
          testSpecData.testDesc = results.testDesc;
        }
      }
    }
  }

  const screenshotOpts: puppeteer.ScreenshotOptions = {
    fullPage: opts.fullPage,
    omitBackground: opts.omitBackground,
  };
  if (opts.clip) {
    screenshotOpts.clip = {
      x: opts.clip.x,
      y: opts.clip.y,
      width: opts.clip.width,
      height: opts.clip.height
    };
  }

  await page.screenshot(screenshotOpts);
}

function createTestId(specData: d.JestSpecData) {
  const testId = `${specData.fullName}-${specData.id}`;

  return crypto.createHash('md5')
               .update(testId)
               .digest('base64')
               .replace(/\W/g, '')
               .substr(0, 14)
               .toLowerCase();
}
