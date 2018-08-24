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

  $(selector: string): Promise<TestElementHandle | null>;

  // goto(url: string, options?: NavigationOptions): Promise<puppeteer.Response | null>;
  waitForEvent(selector: 'window' | 'document' | string, eventName: string, opts?: WaitForEventOptions): Promise<CustomEvent>;
  waitForQueue(): Promise<void>;
}


export interface TestElementHandle extends puppeteer.ElementHandle {
  then(): puppeteer.ElementHandle;
  attr(attrName: string, attrValue?: string): Promise<string>;
  text(text?: string): Promise<string>;
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
