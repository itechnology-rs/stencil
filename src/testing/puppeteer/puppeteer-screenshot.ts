import * as d from '../../declarations';
import * as pd from './puppeteer-declarations';
import * as puppeteer from 'puppeteer';
import * as crypto from 'crypto';


export function initTestPageScreenshot(page: pd.TestPage) {
  const screenshotAdapterPath = (process.env as d.JestProcessEnv).__STENCIL_SCREENSHOT_ADAPTER__;
  if (!screenshotAdapterPath) {
    // screen shot not enabled, so don't bother creating all this
    page.e2eScreenshot = () => Promise.resolve();
    return;
  }

  page.e2eScreenshot = screenshot.bind(page, page, screenshotAdapterPath);
}


export async function setupScreenshots(config: d.Config, snapshotId: string) {
  const data: d.ScreenshotSetupData = {
    rootDir: config.rootDir,
    snapshotId: snapshotId,
    screenshotAdapter: config.testing.screenshotAdapter
  };

  if (data.screenshotAdapter) {
    const plugin: d.ScreenshotAdapterPlugin = require(data.screenshotAdapter);

    const adapter = plugin();

    if (adapter && typeof adapter.setup === 'function') {
      await adapter.setup(data);
    }
  }

  return data;
}


export async function teardownScreenshots(data: d.ScreenshotSetupData) {
  if (data.screenshotAdapter) {
    const plugin: d.ScreenshotAdapterPlugin = require(data.screenshotAdapter);

    const adapter = plugin();

    if (adapter && typeof adapter.teardown === 'function') {
      await adapter.teardown(data);
    }
  }
}


export async function screenshot(page: pd.TestPage, screenshotAdapterPath: string, uniqueDescription: string, opts: d.TestScreenshotOptions = {}) {
  const plugin: d.ScreenshotAdapterPlugin = require(screenshotAdapterPath);

  const adapter = plugin();

  const buf = await page.screenshot(createPuppeteerScreenshopOptions(opts));

  const hash = crypto.createHash('md5')
                     .update(buf)
                     .digest('base64')
                     .replace(/\W/g, '');

  const env = (process.env) as d.JestProcessEnv;

  const commitData: d.CommitScreenshotData = {
    testId: createTestId(uniqueDescription),
    snapshotId: env.__STENCIL_SNAPSHOT_ID__,
    rootDir: env.__STENCIL_ROOT_DIR__,
    description: uniqueDescription,
    screenshot: buf,
    hash: hash,
    type: 'png'
  };

  if (typeof adapter.commitScreenshot === 'function') {
    const rtn = adapter.commitScreenshot(commitData);
    if (rtn && typeof rtn.then === 'function') {
      await rtn;
    }
  }
}


function createPuppeteerScreenshopOptions(opts: d.TestScreenshotOptions) {
  const puppeteerOpts: puppeteer.ScreenshotOptions = {
    type: 'png',
    fullPage: opts.fullPage,
    omitBackground: opts.omitBackground
  };

  if (opts.clip) {
    puppeteerOpts.clip = {
      x: opts.clip.x,
      y: opts.clip.y,
      width: opts.clip.width,
      height: opts.clip.height
    };
  }
  (puppeteerOpts as any).encoding = 'binary';

  return puppeteerOpts;
}


function createTestId(uniqueDescription: string) {
  return crypto.createHash('md5')
               .update(uniqueDescription)
               .digest('base64')
               .replace(/\W/g, '')
               .substr(0, 12);
}
