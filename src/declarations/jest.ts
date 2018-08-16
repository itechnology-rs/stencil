import * as d from '.';

declare global {
  namespace jest {
    interface Matchers<R> {
      toEqualHtml(html: string): void;
      toHaveClasses(classlist: string[]): void;
      toMatchClasses(classlist: string[]): void;
      toHaveAttributes(attributes: { [attr: string]: string }): void;
      toMatchAttributes(attributes: { [attr: string]: string }): void;
      toHaveProperties(properties: { [prop: string]: any }): void;
    }
  }
}


export interface JestEnvironmentGlobal {
  __BUILD_CONDITIONALS__: d.BuildConditionals;
  Context: any;
  createTestPage: () => Promise<JestTestPage>;
  h: any;
  resourcesUrl: string;
  spyOnEvent: (el: Node, eventName: string) => jest.Mock<{}>;
}


export interface JestTestPage {
  page: any;
  close?: () => Promise<void>;
}


export interface TestWindowLoadOptions {
  components: any[];
  html: string;
}
