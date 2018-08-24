import * as pd from './puppeteer-declarations';
import * as puppeteer from 'puppeteer';


export function initPageUtils(page: pd.TestPage) {
  const $ = page.$.bind(page);

  page.$ = (selector) => addHandleUtils(page, $(selector));
}


function addHandleUtils(page: pd.TestPage, elmHandlePromise: Promise<puppeteer.ElementHandle>) {
  const rtnElmHandle = {
    // promise trick so that the standard page.$() works as expected
    then: elmHandlePromise,

    // also return these methods within return promise object
    // jQuery how i love thee
    attr: attr.bind(null, page, elmHandlePromise),
    html: html.bind(null, page, elmHandlePromise),
    text: text.bind(null, page, elmHandlePromise)

  } as any;

  return rtnElmHandle;
}


async function attr(page: pd.TestPage, elmHandlePromise: Promise<puppeteer.ElementHandle>) {
  const elmHandle = await elmHandlePromise;

  if (arguments.length > 3) {
    return page.evaluate((elm: HTMLElement, attrName: string, attrValue: string) => {
      elm.setAttribute(attrName, attrValue);
    }, elmHandle, arguments[2], arguments[3]);
  }

  return page.evaluate((elm: HTMLElement, attrName: string) => {
    return elm.getAttribute(attrName);
  }, elmHandle, arguments[2]);
}


async function html(page: pd.TestPage, elmHandlePromise: Promise<puppeteer.ElementHandle>) {
  const elmHandle = await elmHandlePromise;

  if (arguments.length > 2) {
    return page.evaluate((elm: HTMLElement, setInnerHtml: string) => {
      elm.innerHTML = setInnerHtml;
    }, elmHandle, arguments[2]);
  }

  return page.evaluate((elm: HTMLElement) => {
    return elm.innerHTML;
  }, elmHandle);
}


async function text(page: pd.TestPage, elmHandlePromise: Promise<puppeteer.ElementHandle>) {
  const elmHandle = await elmHandlePromise;

  if (arguments.length > 2) {
    return page.evaluate((elm: HTMLElement, setText: string) => {
      elm.textContent = setText;
    }, elmHandle, arguments[2]);
  }

  return page.evaluate((elm: HTMLElement) => {
    return elm.textContent;
  }, elmHandle);
}
