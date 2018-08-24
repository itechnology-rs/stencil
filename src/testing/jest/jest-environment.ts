import * as d from '../../declarations';
import * as customExpect from '../expect';
import { connectBrowser, newBrowserPage } from '../puppeteer/puppeteer-browser';
import { getDefaultBuildConditionals } from '../../build-conditionals';
import { spyOnEvent } from '../utils';
const NodeEnvironment = require('jest-environment-node');


export class JestEnvironment extends NodeEnvironment {
  private global: d.JestEnvironmentGlobal;
  private browser: any = null;
  private pages: any[] = [];


  constructor(config: any) {
    super(config);
  }

  async setup() {
    this.global.__PUPPETEER_NEW_PAGE__ = this.newPuppeteerPage.bind(this);
  }

  async newPuppeteerPage() {
    if (!this.browser) {
      // load the browser and page on demand
      this.browser = await connectBrowser();
    }

    const page = await newBrowserPage(this.browser);

    this.pages.push(page);

    return page;
  }

  async teardown() {
    await super.teardown();

    await Promise.all(this.pages.map(async page => {
      await page.close();
    }));

    this.pages.length = 0;

    this.browser = null;
  }

}


declare const global: d.JestEnvironmentGlobal;

export function jestSetupTestFramework() {
  global.__BUILD_CONDITIONALS__ = getDefaultBuildConditionals();
  global.Context = {};
  global.h = h;
  global.resourcesUrl = '/build';
  global.spyOnEvent = spyOnEvent;
  expect.extend(customExpect);
}
