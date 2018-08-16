import * as d from '../declarations';
import { getBrowserWSEndpoint } from './jest-global';
import * as puppeteer from 'puppeteer';
const NodeEnvironment = require('jest-environment-node');


export class JestEnvironment extends NodeEnvironment {
  private global: d.JestEnvironmentGlobal;
  private browser: puppeteer.Browser = null;
  private testPages: d.JestTestPage[] = [];


  constructor(config: any) {
    super(config);
  }

  async setup() {
    this.global.createTestPage = this.createTestPage.bind(this);
  }

  async createTestPage() {
    if (!this.browser) {
      // load the browser and page on demand
      this.browser = await this.loadBrowser();
    }

    const page = await this.browser.newPage();

    const testPage: d.JestTestPage = {
      page: page
    };

    this.testPages.push(testPage);

    return testPage;
  }

  async loadBrowser() {
    const browserWSEndpoint = await getBrowserWSEndpoint();

    const connectOpts: puppeteer.ConnectOptions = {
      browserWSEndpoint: browserWSEndpoint,
      ignoreHTTPSErrors: true
    };

    return await puppeteer.connect(connectOpts);
  }

  async teardown() {
    await super.teardown();

    await Promise.all(this.testPages.map(async testPage => {
      if (testPage.close) {
        await testPage.close();
        testPage.close = null;
      }

      if (testPage.page) {
        await (testPage.page as puppeteer.Page).close();
        testPage.page = null;
      }
    }));

    this.testPages.length = 0;

    this.browser = null;
  }

}
