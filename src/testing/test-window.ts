import * as d from '../declarations';
import * as puppeteer from 'puppeteer';


declare const global: d.JestEnvironmentGlobal;


export class TestWindow {
  private hasLoaded = false;

  window: Window = null;
  document: Document = null;
  history: History = null;
  location: Location = null;
  navigator: Navigator = null;
  CustomEvent: typeof CustomEvent = null;
  Event: typeof Event = null;
  URL: typeof URL = null;

  async load(opts: d.TestWindowLoadOptions) {
    validateTestWindowLoadOptions(this.hasLoaded, opts);
    this.hasLoaded = true;

    if (typeof opts.html === 'string') {
      const testPage = await global.createTestPage();

      await loadHtml(testPage.page, opts);

      await initTestWindowProperties(this, testPage, testPage.page);

      this.content = () => (testPage.page as puppeteer.Page).content();
    }
  }

  async flush() {
    throw new Error(`TestWindow has not loaded`);
  }

  async content(): Promise<string> {
    throw new Error(`TestWindow has not loaded`);
  }

}


async function loadHtml(page: puppeteer.Page, opts: d.TestWindowLoadOptions) {
  const url = [
    `data:text/html;charset=UTF-8,`,
    opts.html
  ];

  await page.goto(url.join(''), {
    waitUntil: 'load'
  });

}


async function initTestWindowProperties(testWindow: TestWindow, testPage: d.JestTestPage, page: puppeteer.Page) {
  let windowHandle = await page.evaluateHandle(() => window);

  Object.defineProperty(testWindow, 'window', {
    get: () => {
      return windowHandle.getProperty('window');
    }
  });

  Object.defineProperty(testWindow, 'document', {
    get: () => {
      return windowHandle.getProperty('document');
    }
  });

  testPage.close = async () => {
    await windowHandle.dispose();
    windowHandle = null;

    delete testWindow.window;
    delete testWindow.document;
    delete testWindow.document;
    delete testWindow.history;
    delete testWindow.location;
    delete testWindow.navigator;
    delete testWindow.CustomEvent;
    delete testWindow.Event;
    delete testWindow.URL;
  };
}


function validateTestWindowLoadOptions(hasLoaded: boolean, opts: d.TestWindowLoadOptions) {
  if (hasLoaded) {
    throw new Error(`TestWindow load() cannot be called more than once on the same instance`);
  }

  if (!opts) {
    throw new Error('missing TestWindow load() options');
  }

  if (!opts.components) {
    throw new Error(`missing TestWindow load() components: ${opts}`);
  }

  if (!Array.isArray(opts.components)) {
    throw new Error(`TestWindow load() components must be an array: ${opts}`);
  }

  if (typeof opts.html !== 'string') {
    throw new Error(`TestWindow load() html must be a string: ${opts}`);
  }
}
