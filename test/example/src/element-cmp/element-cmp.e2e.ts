import { newTestPage } from '../../../../dist/testing';


describe('@Element', () => {

  it('should read the host elements attribute', async () => {
    // create a new puppeteer page
    const page = await newTestPage({ html: `
      <element-cmp host-element-attr="Marty McFly"></element-cmp>
    `});

    // with page.find() select the "element-cmp" element (uses querySelector)
    // then get the selected element's textContent, which is all async
    const textContent = await page.find('element-cmp').getText();
    expect(textContent).toBe('Hello, my name is Marty McFly');

    await page.find('element-cmp').setText('Hello, my name is Doc Brown');

    expect(await page.find('element-cmp').getText()).toBe('Hello, my name is Doc Brown');
  });

});
