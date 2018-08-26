import * as d from '../../declarations';
import { connectBrowser, newBrowserPage } from '../puppeteer/puppeteer-browser';
const NodeEnvironment = require('jest-environment-node');


export class JestEnvironment extends NodeEnvironment {
  private global: d.JestEnvironmentGlobal;
  private browser: any = null;
  private pages: any[] = [];


  constructor(config: any) {
    super(config);
  }

  async setup() {
    this.global.__NEW_TEST_PAGE__ = this.newPuppeteerPage.bind(this);
  }

  async newPuppeteerPage() {
    if (!this.browser) {
      // load the browser and page on demand
      this.browser = await connectBrowser();
    }

    if (!this.browser) {
      return null;
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
