
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
}


export interface JestProcessEnv {
  __STENCIL_ROOT_DIR__?: string;
  __STENCIL_BROWSER_URL__?: string;
  __STENCIL_LOADER_SCRIPT_URL__?: string;
  __STENCIL_BROWSER_WS_ENDPOINT__?: string;
  __STENCIL_SCREENSHOT_ADAPTER__?: string;
  __STENCIL_SNAPSHOT_ID__?: string;
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
  setup?(screenshotData: ScreenshotSetupData): Promise<void>;
  commitScreenshot?(commitData: CommitScreenshotData): Promise<void>;
  teardown?(screenshotData: ScreenshotSetupData): Promise<void>;
}


export interface ScreenshotSetupData {
  rootDir: string;
  snapshotId: string;
  screenshotAdapter: string;
}


export interface CommitScreenshotData {
  testId: string;
  rootDir: string;
  snapshotId: string;
  description: string;
  hash: string;
  screenshot: Buffer;
  type: string;
}


export interface BeforeScreenshotResults {
  skipScreenshot?: boolean;
}


export interface TestScreenshotOptions {
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
