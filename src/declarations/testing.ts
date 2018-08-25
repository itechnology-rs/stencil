
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
  __BUILD_CONDITIONALS__: any;
  __NEW_TEST_PAGE__: () => Promise<any>;
  Context: any;
  loadTestWindow: (testWindow: any) => Promise<void>;
  h: any;
  resourcesUrl: string;
  spyOnEvent: (el: Node, eventName: string) => jest.Mock<{}>;
}


export interface JestProcessEnv {
  __STENCIL_TEST_BROWSER_URL__?: string;
  __STENCIL_TEST_LOADER_SCRIPT_URL__?: string;
  __STENCIL_TEST_BROWSER_WS_ENDPOINT__?: string;
  __STENCIL_TEST_SCREENSHOT__?: string;
}


export interface Testing {
  isValid: boolean;
  runTests(): Promise<void>;
  destroy(): Promise<void>;
}


export interface TestingConfig {
  moduleFileExtensions?: string[];
  setupTestFrameworkScriptFile?: string;
  screenshotAdapter?: string;
  testEnvironment?: string;
  testPathIgnorePatterns?: string[];
  transform?: {[key: string]: string };
}
