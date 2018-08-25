import * as d from '../../declarations';
import * as pd from './puppeteer-declarations';
import { initPageEvents } from './puppeteer-events';
import { TestElement } from './puppeteer-utils';
import * as puppeteer from 'puppeteer';


declare const global: d.JestEnvironmentGlobal;


export async function newPage() {
  if (!global.__PUPPETEER_NEW_PAGE__) {
    throw new Error(`invalid jest environment for stencil puppeteer testing`);
  }

  const page: pd.TestPage = await global.__PUPPETEER_NEW_PAGE__();

  await initPageEvents(page);

  page.q = (lightDomSelector) => new TestElement(page, lightDomSelector);

  page.waitForQueue = waitForQueue.bind(null, page);

  page.on('console', consoleMessage);
  page.on('pageerror', pageError);

  page.setContent = (html: string) => setContent(page, html);

  return page;
}


async function setContent(page: pd.TestPage, html: string) {
  // NODE CONTEXT
  const loaderUrl = (process.env as d.JestProcessEnv).__STENCIL_TEST_LOADER_SCRIPT_URL__;

  const url = [
    `data:text/html;charset=UTF-8,`,
    `<script src="${loaderUrl}"></script>`,
    html
  ];

  // resolves once the stencil app has finished loading
  const appLoaded = page.waitForFunction('window.stencilAppLoaded');

  // NODE CONTEXT
  await page.goto(url.join(''), {
    waitUntil: 'load'
  });

  // NODE CONTEXT
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
