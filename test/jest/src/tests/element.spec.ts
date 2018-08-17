import { newPage } from '../../../../dist/testing';


describe('@Element', () => {

  it('should read the host elements attribute', async () => {
    const page = await newPage();

    await page.setContent(`
      <element-cmp host-element-attr="Marty McFly"></element-cmp>
    `);

    expect(await page.$eval('element-cmp', elm => elm.textContent)).toEqual('Hello, my name is Marty McFly');
  });

});
