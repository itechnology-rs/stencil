import * as pd from './puppeteer-declarations';


export async function initPageEvents(page: pd.TestPage) {
  const waitForEvents: pd.WaitForEvent[] = [];

  await page.exposeFunction('stencilOnEvent', (browserEvent: pd.BrowserContextEvent) => {
    // NODE CONTEXT
    nodeContextEvents(waitForEvents, browserEvent);
  });

  page.waitForEvent = (selector, eventName, opts = {}) => {
    // NODE CONTEXT
    return waitForEvent(page, waitForEvents, selector, eventName, opts);
  };

  await page.evaluateOnNewDocument(browserContextEvents);
}


export function waitForEvent(page: pd.TestPage, waitForEvents: pd.WaitForEvent[], selector: string, eventName: string, opts: pd.WaitForEventOptions) {
  // NODE CONTEXT
  return new Promise<any>(async (resolve, reject) => {
    const timeout = (typeof opts.timeout === 'number' ? opts.timeout : 30000);

    const cancelRejectId = setTimeout(reject, timeout);

    waitForEvents.push({
      selector: selector,
      eventName: eventName,
      resolve: resolve,
      cancelRejectId: cancelRejectId
    });

    if (selector === 'window' || selector === 'document') {
      // add window or document event listener
      await page.evaluate((selector, eventName) => {
        // BROWSER CONTEXT
        (selector === 'document' ? document : window).addEventListener(eventName, (ev: any) => {
          (window as pd.BrowserWindow).stencilOnEvent({
            selector: selector,
            eventName: eventName,
            event: (window as pd.BrowserWindow).stencilSerializeEvent(ev)
          });
        });
      }, selector, eventName);

    } else {
      // add element event listener
      await page.$eval(selector, (elm: any, selector: string, eventName: string) => {
        // BROWSER CONTEXT
        elm.addEventListener(eventName, (ev: any) => {
          (window as pd.BrowserWindow).stencilOnEvent({
            selector: selector,
            eventName: eventName,
            event: (window as pd.BrowserWindow).stencilSerializeEvent(ev)
          });
        });
      }, selector, eventName);
    }
  });
}


function nodeContextEvents(waitForEvents: pd.WaitForEvent[], browserEvent: pd.BrowserContextEvent) {
  // NODE CONTEXT
  const waitForEventData = waitForEvents.find(waitData => {
    return (
      waitData.selector === browserEvent.selector &&
      waitData.eventName === browserEvent.eventName
    );
  });

  if (waitForEventData) {
    clearTimeout(waitForEventData.cancelRejectId);
    waitForEventData.resolve(browserEvent.event);
  }
}


function browserContextEvents() {
  // BROWSER CONTEXT

  window.addEventListener('appload', () => {
    // BROWSER CONTEXT
    (window as pd.BrowserWindow).stencilAppLoaded = true;
  });

  (window as pd.BrowserWindow).stencilSerializeEventTarget = (target: any) => {
    // BROWSER CONTEXT
    if (!target) {
      return null;
    }
    if (target === window) {
      return { serializedWindow: true };
    }
    if (target === document) {
      return { serializedDocument: true };
    }
    if (target.tagName) {
      return {
        tagName: target.tagName,
        serializedElement: true
      };
    }
    return null;
  };

  (window as pd.BrowserWindow).stencilSerializeEvent = (orgEv: any) => {
    // BROWSER CONTEXT
    return {
      bubbles: orgEv.bubbles,
      cancelBubble: orgEv.cancelBubble,
      cancelable: orgEv.cancelable,
      composed: orgEv.composed,
      currentTarget: (window as pd.BrowserWindow).stencilSerializeEventTarget(orgEv.currentTarget),
      defaultPrevented: orgEv.defaultPrevented,
      detail: orgEv.detail,
      eventPhase: orgEv.eventPhase,
      isTrusted: orgEv.isTrusted,
      returnValue: orgEv.returnValue,
      srcElement: (window as pd.BrowserWindow).stencilSerializeEventTarget(orgEv.srcElement),
      target: (window as pd.BrowserWindow).stencilSerializeEventTarget(orgEv.target),
      timeStamp: orgEv.timeStamp,
      type: orgEv.type
    };
  };
}
