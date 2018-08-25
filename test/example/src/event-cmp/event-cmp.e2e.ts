import { newTestPage } from '../../../../dist/testing';


describe('@Event', () => {

  it('should fire custom event on window', async () => {
    // create a new puppeteer page
    // and load the page with html content
    const page = await newTestPage({ html: `
      <event-cmp></event-cmp>
    `});

    // add an event listener on window BEFORE we fire off the event
    // do not "await" on the event's response since it hasn't been fired yet
    // only get the promise of waiting on the event which we'll "await" the data later
    // the first argument of "page.waitForEvent()" can be either "window", "document"
    // or an element selector (it uses querySelector)
    const myWindowEventPromise = page.waitForEvent('window', 'myWindowEvent');

    // select the "event-cmp" element within the page (same as querySelector)
    // and once it's received, then call the component's "methodThatFiresMyWindowEvent()" method
    // when calling the method it is executing it within the browser's context
    // we're using the @Method here to manually trigger an event from the component for testing
    await page.$eval('event-cmp', (elm: any) => elm.methodThatFiresMyWindowEvent(88));

    // now that the method has been fired, the component's event fired too
    // let's now "await" on receiving the event that was just triggered
    const myWindowEvent = await myWindowEventPromise;

    // the event has been received, test we have the correct values
    expect(myWindowEvent.bubbles).toEqual(true);
    expect(myWindowEvent.cancelBubble).toEqual(false);
    expect(myWindowEvent.cancelable).toEqual(true);
    expect(myWindowEvent.composed).toEqual(true);
    expect(myWindowEvent.defaultPrevented).toEqual(false);
    expect(myWindowEvent.detail).toEqual(88);
    expect(myWindowEvent.eventPhase).toEqual(3);
    expect(myWindowEvent.isTrusted).toEqual(false);
    expect(myWindowEvent.returnValue).toEqual(true);
    expect(myWindowEvent.timeStamp).toBeDefined();
    expect(myWindowEvent.type).toEqual('myWindowEvent');

    // notice these are mocked objects, not the actual window, document or HTML Element objects
    // since the event is serialized between node and the browser they need to be mocked
    expect(myWindowEvent.currentTarget).toEqual({ serializedWindow: true });
    expect(myWindowEvent.srcElement).toEqual({ serializedElement: true, tagName: 'EVENT-CMP' });
    expect(myWindowEvent.target).toEqual({ serializedElement: true, tagName: 'EVENT-CMP' });
  });

  it('should fire custom event on document', async () => {
    const page = await newTestPage({ html: `
      <event-cmp></event-cmp>
    `});

    const myDocumentEventPromise = page.waitForEvent('document', 'myDocumentEvent');

    await page.$eval('event-cmp', (elm: any) => elm.methodThatFiresMyDocumentEvent());

    const myDocumentEvent = await myDocumentEventPromise;

    expect(myDocumentEvent.bubbles).toEqual(true);
    expect(myDocumentEvent.cancelBubble).toEqual(false);
    expect(myDocumentEvent.cancelable).toEqual(true);
    expect(myDocumentEvent.composed).toEqual(true);
    expect(myDocumentEvent.currentTarget).toEqual({ serializedDocument: true });
    expect(myDocumentEvent.defaultPrevented).toEqual(false);
    expect(myDocumentEvent.detail).toEqual(null);
    expect(myDocumentEvent.eventPhase).toEqual(3);
    expect(myDocumentEvent.isTrusted).toEqual(false);
    expect(myDocumentEvent.returnValue).toEqual(true);
    expect(myDocumentEvent.srcElement).toEqual({ serializedElement: true, tagName: 'EVENT-CMP' });
    expect(myDocumentEvent.target).toEqual({ serializedElement: true, tagName: 'EVENT-CMP' });
    expect(myDocumentEvent.timeStamp).toBeDefined();
    expect(myDocumentEvent.type).toEqual('myDocumentEvent');
  });

  it('should fire custom event w/ no options', async () => {
    const page = await newTestPage({ html: `
      <event-cmp></event-cmp>
    `});

    const myEventWithOptionsPromise = page.waitForEvent('event-cmp', 'my-event-with-options');

    await page.$eval('event-cmp', (elm: any) => elm.methodThatFiresEventWithOptions());

    const myEventWithOptions = await myEventWithOptionsPromise;

    expect(myEventWithOptions.type).toBe('my-event-with-options');
    expect(myEventWithOptions.bubbles).toBe(false);
    expect(myEventWithOptions.cancelable).toBe(false);
    expect(myEventWithOptions.detail).toEqual({ mph: 88 });
  });

});
