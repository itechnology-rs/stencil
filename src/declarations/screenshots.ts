
export interface ScreenshotConfig {
  screenshotConnector?: string;
}


export interface E2EApp {
  snapshots: E2ESnapshot[];
}


export interface E2ESnapshot {
  id: string;
  desc?: string;
  commitUrl?: string;
  imagesDir?: string;
  dataDir?: string;
  rootDir?: string;
  packageDir?: string;
  timestamp: number;
  screenshots?: E2EScreenshot[];
}


export interface E2EScreenshot {
  id: string;
  desc: string;
  image: string;
  hash?: string;
}


export interface ScreenshotConnector {
  generate(snapshot: E2ESnapshot): Promise<void>;
}
