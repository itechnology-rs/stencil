
export interface ScreenshotConfig {

}


export interface E2EData {
  appName: string;
  masterSnapshotId: string;
  snapshots: E2ESnapshot[];
}


export interface E2ESnapshot {
  id: string;
  desc?: string;
  commitUrl?: string;
  imagesDir?: string;
  dataDir?: string;
  appRootDir?: string;
  packageDir?: string;
  timestamp: number;
  screenshots?: E2EScreenshot[];
  compilerVersion?: string;
  appName?: string;
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
