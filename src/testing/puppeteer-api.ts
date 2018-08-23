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

  const page: TestPage = await global.__PUPPETEER_NEW_PAGE__();

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
    // NODE CONTEXT
    const env: d.JestProcessEnv = process.env;
    const loaderUrl = env.__STENCIL_TEST_LOADER_SCRIPT_URL__;

    const url = [
      `data:text/html;charset=UTF-8,`,
      `<script src="${loaderUrl}"></script>`,
      html
    ];

    const waitForEvents: WaitForEvent[] = [];

    await page.exposeFunction('stencilOnEvent', (browserEvent: BrowserContextEvent) => {
      // NODE CONTEXT
      nodeContextEvents(waitForEvents, browserEvent);
    });

    page.waitForEvent = (selector, eventName, opts = {}) => {
      // NODE CONTEXT
      return waitForEvent(page, waitForEvents, selector, eventName, opts);
    };

    // resolves once the stencil app has finished loading
    const appLoaded = page.waitForFunction('window.stencilAppLoaded');

    await page.evaluateOnNewDocument(browserContextEvents);

    // NODE CONTEXT
    await page.goto(url.join(''), {
      waitUntil: 'load'
    });

    // NODE CONTEXT
    await appLoaded;
  };

  return page;
}


function waitForEvent(page: TestPage, waitForEvents: WaitForEvent[], selector: string, eventName: string, opts: WaitForEventOptions) {
  // NODE CONTEXT
  return new Promise<any>(async (resolve, reject) => {
    const timeout = (typeof opts.timeout === 'number' ? opts.timeout : 30000);

    const cancelRejectId = setTimeout(reject, timeout);

    waitForEvents.push({
      selector: selector,
      eventName: eventName,
      resolve: resolve,
      cancelRejectId: cancelRejectId
    });

    if (selector === 'window' || selector === 'document') {
      // add window or document event listener
      await page.evaluate((selector, eventName) => {
        // BROWSER CONTEXT
        (selector === 'document' ? document : window).addEventListener(eventName, (ev: any) => {
          (window as BrowserWindow).stencilOnEvent({
            selector: selector,
            eventName: eventName,
            event: (window as BrowserWindow).stencilSerializeEvent(ev)
          });
        });
      }, selector, eventName);

    } else {
      // add element event listener
      await page.$eval(selector, (elm: any, selector: string, eventName: string) => {
        // BROWSER CONTEXT
        elm.addEventListener(eventName, (ev: any) => {
          (window as BrowserWindow).stencilOnEvent({
            selector: selector,
            eventName: eventName,
            event: (window as BrowserWindow).stencilSerializeEvent(ev)
          });
        });
      }, selector, eventName);
    }
  });
}

function nodeContextEvents(waitForEvents: WaitForEvent[], browserEvent: BrowserContextEvent) {
  // NODE CONTEXT
  const waitForEventData = waitForEvents.find(waitData => {
    return (
      waitData.selector === browserEvent.selector &&
      waitData.eventName === browserEvent.eventName
    );
  });

  if (waitForEventData) {
    clearTimeout(waitForEventData.cancelRejectId);
    waitForEventData.resolve(browserEvent.event);
  }
}


function browserContextEvents() {
  // BROWSER CONTEXT

  window.addEventListener('appload', () => {
    // BROWSER CONTEXT
    (window as BrowserWindow).stencilAppLoaded = true;
  });

  (window as BrowserWindow).stencilSerializeEventTarget = (target: any) => {
    // BROWSER CONTEXT
    if (!target) {
      return null;
    }
    if (target === window) {
      return { serializedWindow: true };
    }
    if (target === document) {
      return { serializedDocument: true };
    }
    if (target.tagName) {
      return {
        tagName: target.tagName,
        serializedElement: true
      };
    }
    return null;
  };

  (window as BrowserWindow).stencilSerializeEvent = (orgEv: any) => {
    // BROWSER CONTEXT
    return {
      bubbles: orgEv.bubbles,
      cancelBubble: orgEv.cancelBubble,
      cancelable: orgEv.cancelable,
      composed: orgEv.composed,
      currentTarget: (window as BrowserWindow).stencilSerializeEventTarget(orgEv.currentTarget),
      defaultPrevented: orgEv.defaultPrevented,
      detail: orgEv.detail,
      eventPhase: orgEv.eventPhase,
      isTrusted: orgEv.isTrusted,
      returnValue: orgEv.returnValue,
      srcElement: (window as BrowserWindow).stencilSerializeEventTarget(orgEv.srcElement),
      target: (window as BrowserWindow).stencilSerializeEventTarget(orgEv.target),
      timeStamp: orgEv.timeStamp,
      type: orgEv.type
    };
  };
}


interface WaitForEvent {
  selector: string;
  eventName: string;
  resolve: (ev: any) => void;
  cancelRejectId: any;
}

interface BrowserContextEvent {
  selector: string;
  eventName: string;
  event: any;
}

interface BrowserWindow extends Window {
  stencilOnEvent(ev: BrowserContextEvent): void;
  stencilSerializeEvent(ev: CustomEvent): any;
  stencilSerializeEventTarget(target: any): any;
  stencilAppLoaded: boolean;
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


export interface TestPage extends puppeteer.Page {
  waitForEvent(selector: 'window' | 'document' | string, eventName: string, opts?: WaitForEventOptions): Promise<CustomEvent>;
}

export interface WaitForEventOptions {
  timeout?: number;
}
