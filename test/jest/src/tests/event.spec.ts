import { newPage } from '../../../../dist/testing';


describe('@Event', () => {

  it('should fire custom event w/ no options', async () => {
    const page = await newPage();

    await page.setContent(`
      <event-cmp></event-cmp>
    `);

    // const myEventPromise = new Promise<UIEvent>(resolve => {
    //   element.addEventListener('myEvent', (ev: UIEvent) => {
    //     resolve(ev);
    //   });
    // })

    // element.methodThatFiresMyEvent();

    // const ev = await myEventPromise;

    // expect(ev.type).toBe('myEvent');
    // expect(ev.bubbles).toBe(true);
    // expect(ev.cancelable).toBe(true);
    // expect(ev.detail).toBe(true);
  });

  // it('should fire custom event w/ options', async () => {
  //   const window = new TestWindow();
  //   const element = await window.load({
  //     components: [EventCmp],
  //     html: '<event-cmp></event-cmp>'
  //   });

  //   const myEventPromise = new Promise<UIEvent>(resolve => {
  //     element.addEventListener('my-event-with-options', (ev: UIEvent) => {
  //       resolve(ev);
  //     });
  //   })

  //   element.fireEventWithOptions();

  //   const ev = await myEventPromise;

  //   expect(ev.type).toBe('my-event-with-options');
  //   expect(ev.bubbles).toBe(false);
  //   expect(ev.cancelable).toBe(false);
  //   expect(ev.detail).toEqual({ mph: 88 });
  // });

});
