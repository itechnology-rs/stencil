import * as d from '../declarations';
import * as puppeteer from 'puppeteer';


declare const global: d.JestEnvironmentGlobal;

let sharedGlobalBrowser: puppeteer.Browser = null;


export async function setupTestPuppeteer() {
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
}


export async function teardownTestPuppeteer() {
  if (sharedGlobalBrowser) {
    await sharedGlobalBrowser.close();
    sharedGlobalBrowser = null;
  }
}


export async function newPage() {
  if (!global.__PUPPETEER_NEW_PAGE__) {
    throw new Error(`invalid jest environment for stencil puppeteer testing`);
  }

  const page: puppeteer.Page = await global.__PUPPETEER_NEW_PAGE__();

  Object.defineProperty(page, 'flush', {
    value: async function () {
      console.log('flush');
    }
  });

  page.on('pageerror', (e) => {
    console.error('pageerror', e);
  });

  page.on('console', (c) => {
    const type = c.type();
    if (type === 'error' || type === 'warning' || type === 'debug') {
      (console as any)[type]('console', type, c.text());
    } else {
      console.log('console', type, c.text());
    }
  });

  page.setContent = async (html: string) => {
    const env: d.JestProcessEnv = process.env;
    const loaderUrl = env.__STENCIL_TEST_LOADER_SCRIPT_URL__;

    const url = [
      `data:text/html;charset=UTF-8,`,
      `<script src="${loaderUrl}"></script>`,
      html
    ];

    await page.evaluateOnNewDocument(() => {
      window.addEventListener('appload', e => {
        console.log('appload', e);
        (window as any).stencilTestAppLoaded = true;
      });
    });

    const appLoaded = page.waitForFunction('window.stencilTestAppLoaded');

    await page.goto(url.join(''), {
      waitUntil: 'load'
    });

    await appLoaded;
  };

  return page;
}


export function newBrowserPage(browser: puppeteer.Browser) {
  return browser.newPage();
}


export async function closePages(pages: puppeteer.Page[]) {
  if (Array.isArray(pages)) {
    await Promise.all(pages.map(async page => {
      await page.close();
    }));
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
