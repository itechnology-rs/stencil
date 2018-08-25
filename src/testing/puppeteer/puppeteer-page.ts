import * as d from '../../declarations';
import * as pd from './puppeteer-declarations';
import { initPageEvents } from './puppeteer-events';
import { TestElement } from './puppeteer-utils';
import * as puppeteer from 'puppeteer';


declare const global: d.JestEnvironmentGlobal;


export async function newTestPage(opts: pd.NewTestPageOptions = {}) {
  if (!global.__NEW_TEST_PAGE__) {
    throw new Error(`invalid jest environment for stencil puppeteer testing`);
  }

  const page: pd.TestPage = await global.__NEW_TEST_PAGE__();

  await initPageEvents(page);

  page.q = (lightDomSelector) => new TestElement(page, lightDomSelector);

  page.waitForQueue = waitForQueue.bind(null, page);

  page.on('console', consoleMessage);
  page.on('pageerror', pageError);

  if (typeof opts.html === 'string') {
    await setTestContent(page, opts.html);

  } else if (typeof opts.url === 'string') {
    await gotoTest(page, opts.url);

  } else {
    page.gotoTest = gotoTest.bind(null, page);
    page.setTestContent = setTestContent.bind(null, page);
  }

  return page;
}


async function gotoTest(page: pd.TestPage, url: string) {
  if (typeof url !== 'string') {
    throw new Error('invalid gotoTest() url');
  }

  if (!url.startsWith('/')) {
    throw new Error('gotoTest() url must start with /');
  }

  const browserUrl = (process.env as d.JestProcessEnv).__STENCIL_TEST_BROWSER_URL__;
  if (typeof browserUrl !== 'string') {
    throw new Error('invalid gotoTest() browser url');
  }

  // resolves once the stencil app has finished loading
  const appLoaded = page.waitForFunction('window.stencilAppLoaded');

  url = browserUrl + url.substring(1);

  await page.goto(url, {
    waitUntil: 'load'
  });

  await appLoaded;
}


async function setTestContent(page: pd.TestPage, html: string) {
  if (typeof html !== 'string') {
    throw new Error('invalid setTestContent() html');
  }

  const loaderUrl = (process.env as d.JestProcessEnv).__STENCIL_TEST_LOADER_SCRIPT_URL__;
  if (typeof loaderUrl !== 'string') {
    throw new Error('invalid setTestContent() loader script url');
  }

  const url = [
    `data:text/html;charset=UTF-8,`,
    `<script src="${loaderUrl}"></script>`,
    html
  ];

  // resolves once the stencil app has finished loading
  const appLoaded = page.waitForFunction('window.stencilAppLoaded');

  await page.goto(url.join(''), {
    waitUntil: 'load'
  });

  await appLoaded;
}


async function waitForQueue(page: pd.TestPage) {
  await page.evaluate(() => {
    return new Promise(resolve => {
      window.requestAnimationFrame(resolve);
    });
  });
}


function consoleMessage(c: puppeteer.ConsoleMessage) {
  const type = c.type();
  if (typeof (console as any)[type] === 'function') {
    (console as any)[type](c.text());
  } else {
    console.log(type, c.text());
  }
}


function pageError(msg: string) {
  console.error('pageerror', msg);
}
