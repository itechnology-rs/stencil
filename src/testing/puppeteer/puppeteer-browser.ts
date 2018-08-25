import * as d from '../../declarations';
import * as puppeteer from 'puppeteer';


let sharedGlobalBrowser: puppeteer.Browser = null;


export async function setupTestPuppeteer(config: d.Config) {
  // sharedGlobalBrowser is only availabe here,
  // but it not available to jest tests since they'll
  // be in different threads

  // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions
  sharedGlobalBrowser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: false
  });

  const env: d.JestProcessEnv = process.env;
  env.__STENCIL_TEST_BROWSER_WS_ENDPOINT__ = sharedGlobalBrowser.wsEndpoint();

  if (typeof config.screenshot === 'string') {
    env.__STENCIL_TEST_SCREENSHOT__ = config.screenshot;
  }
}


export async function teardownTestPuppeteer() {
  if (sharedGlobalBrowser) {
    await sharedGlobalBrowser.close();
    sharedGlobalBrowser = null;
  }
}


export async function connectBrowser() {
  // the reason we're connecting to the browser from
  // a web socket is because jest probably has us
  // in a different thread, this is also why this function
  // cannot use the sharedGlobalBrowser variable
  const env: d.JestProcessEnv = process.env;

  const connectOpts: puppeteer.ConnectOptions = {
    browserWSEndpoint: env.__STENCIL_TEST_BROWSER_WS_ENDPOINT__,
    ignoreHTTPSErrors: true
  };

  return await puppeteer.connect(connectOpts);
}


export function newBrowserPage(browser: puppeteer.Browser) {
  return browser.newPage();
}
