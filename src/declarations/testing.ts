
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
  it(name: string, fn: any, timeout?: number): JestSpecData;
  specData: JestSpecData;
}


export interface JestSpecData {
  id: string;
  description: string;
  fullName: string;
  testPath: string;
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
  reporters?: string[];
  setupTestFrameworkScriptFile?: string;
  screenshotAdapter?: string;
  testEnvironment?: string;
  testMatch?: string[];
  testPathIgnorePatterns?: string[];
  testRegex?: string;
  transform?: {[key: string]: string };
}


export type ScreenshotAdapterPlugin = () => ScreenshotAdapter;


export interface ScreenshotAdapter {

  setup?(): Promise<void>;

  beforeScreenshot?(specData: TestSpecData): Promise<BeforeScreenshotResults> | BeforeScreenshotResults;

  commitScreenshot?(opts: TestScreenshotOptions): Promise<void>;

  teardown?(): Promise<void>;

}

export interface TestSpecData {
  testId: string;
  testPath: string;
  testDesc: string;
}

export interface BeforeScreenshotResults {
  testId: string;
  testDesc: string;
  skipScreenshot?: boolean;
}


export interface TestScreenshotOptions {
  testId: string;
  testPath: string;
  testDesc: string;

  /**
   * When true, takes a screenshot of the full scrollable page.
   * @default false
   */
  fullPage?: boolean;

  /**
   * Hides default white background and allows capturing screenshots with transparency.
   * @default false
   */
  omitBackground?: boolean;

  /**
   * An object which specifies clipping region of the page.
   */
  clip?: {
    /** The x-coordinate of top-left corner. */
    x: number;
    /** The y-coordinate of top-left corner. */
    y: number;
    /** The width. */
    width: number;
    /** The height. */
    height: number;
  };
}
