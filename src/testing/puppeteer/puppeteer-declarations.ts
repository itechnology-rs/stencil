import * as d from '../../declarations';
import * as puppeteer from 'puppeteer';


export interface NewTestPageOptions {
  url?: string;
  html?: string;
}


export interface TestPage extends puppeteer.Page {
  /**
   * Testing query for one element. Uses queryselector() to
   * find the first element that matches the selector
   * within the webpage's light dom.
   * @param lightDomSelector Light Dom querySelector
   */
  find(lightDomSelector: string): FindTestElement;

  gotoTest(url: string, options?: Partial<puppeteer.NavigationOptions>): Promise<puppeteer.Response | null>;

  e2eScreenshot(uniqueDescription: string, opts?: d.TestScreenshotOptions): Promise<void>;

  setTestContent(html: string): Promise<void>;

  waitForEvent(selector: 'window' | 'document' | string, eventName: string, opts?: WaitForEventOptions): Promise<CustomEvent>;
  waitForQueue(): Promise<void>;
}


export interface FindTestElement extends TestElementUtils {
  /**
   * Selects an element within the host element's shadow root. Uses
   * "hostElm.shadowRoot.querySelector()" if the "shadowDomSelector"
   * argument is supplied. Otherwise it'll use the shadowRoot element itself.
   * @param shadowDomSelector Shadow Dom querySelector
   */
  shadow(shadowDomSelector?: string): TestElementUtils;
}


export interface TestElementUtils {
  getProperty<T>(propName: string): Promise<T>;
  setProperty(propName: string, propValue: any): Promise<void>;
  setProperties(props: {[propName: string]: any }): Promise<void>;

  getAttribute(attrName: string): Promise<string>;
  getAttributes(): Promise<{[attrName: string]: any}>;
  setAttribute(attrName: string, attrValue?: string): Promise<void>;
  setAttributes(attrs: { [attrName: string]: any }): Promise<void>;
  removeAttribute(attrName: string): Promise<string>;
  removeAttributes(attrNames: string[]): Promise<string>;
  hasAttribute(attrName: string): Promise<boolean>;

  getClasses(): Promise<string[]>;
  setClasses(classNames: string[]): Promise<void>;

  addClass(...classNames: string[]): Promise<void>;
  removeClass(...classNames: string[]): Promise<void>;
  hasClass(className: string): Promise<boolean>;

  getHtml(): Promise<string>;
  setHtml(value: string): Promise<void>;

  getText(): Promise<string>;
  setText(value: string): Promise<void>;
}


export interface WaitForEventOptions {
  timeout?: number;
}


export interface WaitForEvent {
  selector: string;
  eventName: string;
  resolve: (ev: any) => void;
  cancelRejectId: any;
}


export interface BrowserContextEvent {
  selector: string;
  eventName: string;
  event: any;
}


export interface BrowserWindow extends Window {
  stencilOnEvent(ev: BrowserContextEvent): void;
  stencilSerializeEvent(ev: CustomEvent): any;
  stencilSerializeEventTarget(target: any): any;
  stencilAppLoaded: boolean;
}
