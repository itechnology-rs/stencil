import { newPage } from '../../../../dist/testing';


describe('@Element', () => {

  it('should read the host elements attribute', async () => {
    // create a new puppeteer page
    const page = await newPage();

    // load the page with html content
    await page.setContent(`
      <element-cmp host-element-attr="Marty McFly"></element-cmp>
    `);

    // with page.q() select the "element-cmp" element (uses querySelector)
    // then get the selected element's textContent, which is all async
    const textContent = await page.q('element-cmp').getText();
    expect(textContent).toBe('Hello, my name is Marty McFly');

    await page.q('element-cmp').setText('Hello, my name is Doc Brown');

    expect(await page.q('element-cmp').getText()).toBe('Hello, my name is Doc Brown');
  });

});
