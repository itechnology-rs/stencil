import { newPage } from '../../../../dist/testing';


describe('@Event', () => {

  it('should fire custom event w/ no options', async () => {
    const page = await newPage();

    await page.setContent(`
      <event-cmp></event-cmp>
    `);

    const myWindowEventPromise = page.waitForEvent('window', 'myWindowEvent');

    await page.$eval('event-cmp', (elm: any) => elm.methodThatFiresMyWindowEvent(88));

    const myWindowEvent: CustomEvent = await myWindowEventPromise;

    expect(myWindowEvent.bubbles).toEqual(true);
    expect(myWindowEvent.cancelBubble).toEqual(false);
    expect(myWindowEvent.cancelable).toEqual(true);
    expect(myWindowEvent.composed).toEqual(true);
    expect(myWindowEvent.currentTarget).toEqual({ serializedWindow: true });
    expect(myWindowEvent.defaultPrevented).toEqual(false);
    expect(myWindowEvent.detail).toEqual(88);
    expect(myWindowEvent.eventPhase).toEqual(3);
    expect(myWindowEvent.isTrusted).toEqual(false);
    expect(myWindowEvent.returnValue).toEqual(true);
    expect(myWindowEvent.srcElement).toEqual({ serializedElement: true, tagName: 'EVENT-CMP' });
    expect(myWindowEvent.target).toEqual({ serializedElement: true, tagName: 'EVENT-CMP' });
    expect(myWindowEvent.timeStamp).toBeDefined();
    expect(myWindowEvent.type).toEqual('myWindowEvent');


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

  //   element.methodThatFiresEventWithOptions();

  //   const ev = await myEventPromise;

  //   expect(ev.type).toBe('my-event-with-options');
  //   expect(ev.bubbles).toBe(false);
  //   expect(ev.cancelable).toBe(false);
  //   expect(ev.detail).toEqual({ mph: 88 });
  // });

});
