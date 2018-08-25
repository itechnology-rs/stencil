import * as pd from './puppeteer-declarations';
import * as puppeteer from 'puppeteer';


export class TestElement implements pd.QueryTestElement {
  handlePromise: Promise<puppeteer.ElementHandle>;

  constructor(private page: pd.TestPage, lightDomSelector: string) {
    this.handlePromise = page.$(lightDomSelector);
  }

  shadow(shadowRootSelector: string) {
    return new ShadowDomElementUtils(this.page, this.handlePromise, shadowRootSelector);
  }

  async getProperty(propName: string) {
    return this.page.evaluate((elm: any, propName: string) => {
      return elm[propName];
    }, await this.handlePromise, propName);
  }

  async setProperty(propName: string, propValue: any) {
    return this.page.evaluate((elm: any, propName: string, propValue: any) => {
      elm[propName] = propValue;
    }, await this.handlePromise, propName, propValue);
  }

  async getAttribute(attrName: string) {
    return this.page.evaluate((elm: HTMLElement, attrName: string) => {
      return elm.getAttribute(attrName);
    }, await this.handlePromise, attrName);
  }

  async getAttributes() {
    return this.page.evaluate((elm: HTMLElement) => {
      const rtn: {[attrName: string]: any } = {};

      for (let i = 0; i < elm.attributes.length; i++) {
        const attr = elm.attributes.item(i);
        rtn[attr.name] = attr.nodeValue;
      }

      return rtn;
    }, await this.handlePromise);
  }

  async setAttribute(attrName: string, attrValue: string) {
    return this.page.evaluate((elm: HTMLElement, attrName: string, attrValue: string) => {
      elm.setAttribute(attrName, attrValue);
    }, await this.handlePromise, attrName, attrValue);
  }

  async setAttributes(attrs: {[attrName: string]: any }) {
    return this.page.evaluate((elm: HTMLElement, attrs: {[attrName: string]: any }) => {
      Object.keys(attrs).forEach(attrName => {
        elm.setAttribute(attrName, attrs[attrName]);
      });
    }, await this.handlePromise, attrs);
  }

  async removeAttribute(attrName: string) {
    return this.page.evaluate((elm: HTMLElement, attrName: string) => {
      elm.removeAttribute(attrName);
    }, await this.handlePromise, attrName);
  }

  async removeAttributes(attrs: string[]) {
    return this.page.evaluate((elm: HTMLElement, attrs: string[]) => {
      attrs.forEach(attrName => {
        elm.removeAttribute(attrName);
      });
    }, await this.handlePromise, attrs);
  }

  async hasAttribute(attrName: string) {
    return this.page.evaluate((elm: HTMLElement, attrName: string) => {
      return elm.hasAttribute(attrName);
    }, await this.handlePromise, attrName);
  }

  async getClasses() {
    return this.page.evaluate((elm: HTMLElement) => {
      const classes: string[] = [];
      for (let i = 0; i < elm.classList.length; i++) {
        classes.push(elm.classList.item(i));
      }
      return classes;
    }, await this.handlePromise);
  }

  async setClasses(classes: string[]) {
    return this.page.evaluate((elm: HTMLElement, classes: string[]) => {
      for (let i = 0; i < elm.classList.length; i++) {
        const className = elm.classList.item(i);
        if (!classes.includes(className)) {
          elm.classList.remove(className);
        }
      }
      classes.forEach(className => {
        elm.classList.add(className);
      });
    }, await this.handlePromise, classes);
  }

  async addClass(...classNames: string[]) {
    return this.page.evaluate((elm: HTMLElement, ...classNames: string[]) => {
      classNames.forEach(className => {
        elm.classList.add(className);
      });
    }, await this.handlePromise, classNames);
  }

  async removeClass(...classNames: string[]) {
    return this.page.evaluate((elm: HTMLElement, ...classNames: string[]) => {
      classNames.forEach(className => {
        elm.classList.remove(className);
      });
    }, await this.handlePromise, classNames);
  }

  async hasClass(className: string) {
    return this.page.evaluate((elm: HTMLElement, className: string) => {
      return elm.classList.contains(className);
    }, await this.handlePromise, className);
  }

  async getHtml() {
    return this.page.evaluate((elm: HTMLElement) => {
      return elm.innerHTML;
    }, await this.handlePromise);
  }

  async setHtml(innerHTML: string) {
    return this.page.evaluate((elm: HTMLElement, innerHTML: string) => {
      elm.innerHTML = innerHTML;
    }, await this.handlePromise, innerHTML);
  }

  async getText() {
    return this.page.evaluate((elm: HTMLElement) => {
      return elm.textContent;
    }, await this.handlePromise);
  }

  async setText(textContent: string) {
    return this.page.evaluate((elm: HTMLElement, textContent: string) => {
      elm.textContent = textContent;
    }, await this.handlePromise, textContent);
  }

}


export class ShadowDomElementUtils implements pd.TestElementUtils {

  constructor(private page: pd.TestPage, private handlePromise: Promise<puppeteer.ElementHandle>, private shadowRootSelector: string) {
  }

  async getProperty(propName: string) {
    return this.page.evaluate((hostElm, shadowRootSelector, propName: string) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (!elm) {
        return null;
      }
      return elm[propName];
    }, await this.handlePromise, this.shadowRootSelector, propName);
  }

  async setProperty(propName: string, propValue: any) {
    return this.page.evaluate((hostElm, shadowRootSelector, propName: string, propValue: any) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (elm) {
        elm[propName] = propValue;
      }
    }, await this.handlePromise, this.shadowRootSelector, propName, propValue);
  }

  async getAttribute(attrName: string) {
    return this.page.evaluate((hostElm, shadowRootSelector, attrName: string) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (!elm) {
        return null;
      }
      return elm.getAttribute(attrName);
    }, await this.handlePromise, this.shadowRootSelector, attrName);
  }

  async getAttributes() {
    return this.page.evaluate((hostElm: HTMLElement, shadowRootSelector) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (!elm) {
        return null;
      }

      const rtn: {[attrName: string]: any } = {};

      for (let i = 0; i < elm.attributes.length; i++) {
        const attr = elm.attributes.item(i);
        rtn[attr.name] = attr.nodeValue;
      }

      return rtn;
    }, await this.handlePromise, this.shadowRootSelector);
  }

  async setAttribute(attrName: string, attrValue: string) {
    return this.page.evaluate((hostElm, shadowRootSelector, attrName: string, attrValue: string) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (elm) {
        elm.setAttribute(attrName, attrValue);
      }
    }, await this.handlePromise, this.shadowRootSelector, attrName, attrValue);
  }

  async setAttributes(attrs: {[attrName: string]: any }) {
    return this.page.evaluate((hostElm, shadowRootSelector, attrs: {[attrName: string]: any }) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (!elm) {
        return;
      }

      Object.keys(attrs).forEach(attrName => {
        elm.setAttribute(attrName, attrs[attrName]);
      });
    }, await this.handlePromise, this.shadowRootSelector, attrs);
  }

  async removeAttribute(attrName: string) {
    return this.page.evaluate((hostElm, shadowRootSelector, attrName: string) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (elm) {
        elm.removeAttribute(attrName);
      }
    }, await this.handlePromise, this.shadowRootSelector, attrName);
  }

  async removeAttributes(attrs: string[]) {
    return this.page.evaluate((hostElm, shadowRootSelector, attrs: string[]) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (elm) {
        attrs.forEach(attrName => {
          elm.removeAttribute(attrName);
        });
      }
    }, await this.handlePromise, this.shadowRootSelector, attrs);
  }

  async hasAttribute(attrName: string) {
    return this.page.evaluate((hostElm, shadowRootSelector, attrName: string) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (!elm) {
        return null;
      }

      return elm.hasAttribute(attrName);
    }, await this.handlePromise, this.shadowRootSelector, attrName);
  }

  async getClasses() {
    return this.page.evaluate((hostElm, shadowRootSelector) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (!elm) {
        return null;
      }

      const classes: string[] = [];
      for (let i = 0; i < elm.classList.length; i++) {
        classes.push(elm.classList.item(i));
      }

      return classes;
    }, await this.handlePromise, this.shadowRootSelector);
  }

  async setClasses(classes: string[]) {
    return this.page.evaluate((hostElm, shadowRootSelector, classes: string[]) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (!elm) {
        return;
      }

      for (let i = 0; i < elm.classList.length; i++) {
        const className = elm.classList.item(i);
        if (!classes.includes(className)) {
          elm.classList.remove(className);
        }
      }

      classes.forEach(className => {
        elm.classList.add(className);
      });
    }, await this.handlePromise, this.shadowRootSelector, classes);
  }

  async addClass(...classNames: string[]) {
    return this.page.evaluate((hostElm, shadowRootSelector, ...classNames: string[]) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (!elm) {
        return;
      }

      classNames.forEach(className => {
        elm.classList.add(className);
      });
    }, await this.handlePromise, this.shadowRootSelector, classNames);
  }

  async removeClass(...classNames: string[]) {
    return this.page.evaluate((hostElm, shadowRootSelector, ...classNames: string[]) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (!elm) {
        return;
      }

      classNames.forEach(className => {
        elm.classList.remove(className);
      });
    }, await this.handlePromise, this.shadowRootSelector, classNames);
  }

  async hasClass(className: string) {
    return this.page.evaluate((hostElm, shadowRootSelector, className: string) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (!elm) {
        return null;
      }

      return elm.classList.contains(className);
    }, await this.handlePromise, this.shadowRootSelector, className);
  }

  async getHtml() {
    return this.page.evaluate((hostElm, shadowRootSelector) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (!elm) {
        return null;
      }

      return elm.innerHTML;
    }, await this.handlePromise, this.shadowRootSelector);
  }

  async setHtml(innerHTML: string) {
    return this.page.evaluate((hostElm, shadowRootSelector, innerHTML: string) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (!elm) {
        return;
      }

      elm.innerHTML = innerHTML;
    }, await this.handlePromise, this.shadowRootSelector, innerHTML);
  }

  async getText() {
    return this.page.evaluate((hostElm, shadowRootSelector) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (!elm) {
        return null;
      }

      return elm.textContent;
    }, await this.handlePromise, this.shadowRootSelector);
  }

  async setText(textContent: string) {
    return this.page.evaluate((hostElm, shadowRootSelector, textContent: string) => {
      const elm = shadowRootSelector ? hostElm.shadowRoot.querySelector(shadowRootSelector) : hostElm.shadowRoot;
      if (!elm) {
        return;
      }

      elm.textContent = textContent;
    }, await this.handlePromise, this.shadowRootSelector, textContent);
  }

}
