import * as d from '../../declarations';
import * as puppeteer from 'puppeteer';


export class NodePrerender {
  private browser: puppeteer.Browser = null;

  async init(config: d.Config) {
    config.logger.debug(`init chrome instance`);

    // start the browser
    this.browser = await puppeteer.launch(LAUNCH_OPTIONS);

    config.logger.debug(`chrome started`);
  }


  async render(config: d.Config, url: string) {
    // create a instance for the resultset
    const renderResult = new d.();

    // set the url to the result
    renderResult.url = url;

    try {
      // check if chrome is already available
      if (!this.browser) {
        await this.init(config);
      }

      // create a new tab
      const page: puppeteer.Page = await this.browser.newPage();

      config.logger.debug(`go to: ${url}`);

      // get browser errors (if they occur)
      page.on('error', err => {
        // push the errors to the renderResults
        renderResult.errors.push(err);
      });

      // get errors on the page (if they occur)
      page.on('pageerror', pageerr => {
        // push the errors to the renderResults
        renderResult.errors.push(pageerr);
      });

      // go to the url
      await page.goto(url, { waitUntil: 'networkidle0'});

      // inspect the document
      await page.evaluate(() => {

      });

      // close the tab in the browser
      await page.close();

      // set the html to the resultset
      renderResult.html = htmlresult;


    } catch (err) {
      // push the erors to the renderResult
      renderResult.errors.push(err);
    }

    return renderResult;
  }

  async destroy() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

}


async function applyPlugins() {

}


const LAUNCH_OPTIONS: puppeteer.LaunchOptions = {
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ],
  headless: true
};
