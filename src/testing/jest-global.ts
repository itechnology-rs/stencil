import * as d from '../declarations';
import { getDefaultBuildConditionals } from '../build-conditionals';
import { h } from '../renderer/vdom/h';
import { spyOnEvent } from './utils';
import * as customExpect from './expect';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as puppeteer from 'puppeteer';


let browser: puppeteer.Browser = null;
declare const global: d.JestEnvironmentGlobal;


export async function jestGlobalSetup() {
  browser = await puppeteer.launch();

  await setBrowserWSEndpoint(browser.wsEndpoint());
}


export async function jestGlobalTeardown() {
  try {
    await removeBrowserWSEndpoint();
  } catch (e) {}

  if (!browser) {
    return;
  }

  await browser.close();
}


export function jestSetupTestFramework() {
  global.__BUILD_CONDITIONALS__ = getDefaultBuildConditionals();
  global.Context = {};
  global.h = h;
  global.resourcesUrl = '/build';
  global.spyOnEvent = spyOnEvent;
  expect.extend(customExpect);
}


export function getBrowserWSEndpoint() {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(BROWSER_WS_ENDPOINT_PATH, 'utf8', (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });
}

function setBrowserWSEndpoint(wsEndpoint: string) {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(BROWSER_WS_ENDPOINT_PATH, wsEndpoint, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function removeBrowserWSEndpoint() {
  return new Promise<void>((resolve, reject) => {
    fs.unlink(BROWSER_WS_ENDPOINT_PATH, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

const BROWSER_WS_ENDPOINT_PATH = path.join(os.tmpdir(), 'jest-browser-ws-endpoint.log');
