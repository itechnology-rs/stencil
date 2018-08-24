import { newPage } from '../../../../dist/testing';


describe('goto root url', () => {

  it('should navigate to the index.html page', async () => {
    // create a new puppeteer page
    const page = await newPage();

    // go to the root webpage
    await page.goto('/');

    // select the "element-cmp" element within the page (same as querySelector)
    // and once it's received, then return the element's "textContent" property
    const textContent = await page.$eval('element-cmp', elm => elm.textContent);
    expect(textContent).toEqual('Hello, my name is Marty McFly');
  });

});
