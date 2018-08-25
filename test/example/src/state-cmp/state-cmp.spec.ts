import { newTestPage } from '../../../../dist/testing';


describe('@State', () => {

  it('should render all weekdays', async () => {
    // create a new puppeteer page
    const page = await newTestPage({ html: `
      <state-cmp></state-cmp>
    `});

    const divsCounts = await page.$$eval('.day-button', btns => btns.length);
    expect(divsCounts).toEqual(7);
  });

});
