

export interface E2ESnapshot {
  snapshotId: string;
  rootDir: string;
  imagesDir: string;
  dataDir: string;
  timestamp: number;
  screenshots?: E2EScreenshot[];
}


export interface E2EScreenshot {
  id: string;
  desc: string;
  hash: string;
  image: string;
}


export interface ScreenshotAdaptor {
  generate(snapshot: E2ESnapshot): Promise<void>;
}
