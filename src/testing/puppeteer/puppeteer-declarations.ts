import * as puppeteer from 'puppeteer';


export interface NavigationOptions {
  /**
   * Maximum navigation time in milliseconds, pass 0 to disable timeout.
   * @default 30000
   */
  timeout?: number;
  /**
   * When to consider navigation succeeded.
   * @default load Navigation is consider when the `load` event is fired.
   */
  waitUntil?: LoadEvent | LoadEvent[];
}


export type LoadEvent =
  | 'appload'
  | 'load'
  | 'domcontentloaded'
  | 'networkidle0'
  | 'networkidle2';


export interface TestPage extends puppeteer.Page {
  /**
   * Testing query for one element. Uses queryselector() to
   * find the first element that matches the selector
   * within the webpage's light dom.
   * @param lightDomSelector Light Dom querySelector
   */
  q(lightDomSelector: string): QueryTestElement;

  waitForEvent(selector: 'window' | 'document' | string, eventName: string, opts?: WaitForEventOptions): Promise<CustomEvent>;
  waitForQueue(): Promise<void>;
}


export interface QueryTestElement extends TestElementUtils {
  /**
   * Selects an element within the host element's shadow root. Uses
   * "hostElm.shadowRoot.querySelector()" if the "shadowDomSelector"
   * argument is supplied. Otherwise it'll use the shadowRoot element itself.
   * @param shadowDomSelector Shadow Dom querySelector
   */
  shadow(shadowDomSelector?: string): TestElementUtils;
}


export interface TestElementUtils {
  getProperty(propName: string): Promise<any>;
  setProperty(propName: string, propValue: any): Promise<void>;

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
