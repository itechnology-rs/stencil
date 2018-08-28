import * as d from '../../declarations';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';


export async function startE2ESnapshot(config: d.Config) {
  const env = (process.env) as d.E2EProcessEnv;

  const snapshotId = getSnapshotId();
  config.logger.debug(`test e2e snapshot id: ${snapshotId}`);

  const tmpDir = config.sys.details.tmpDir;

  const imagesDir = config.sys.path.join(tmpDir, IMAGES_CACHE_DIR);
  try {
    await config.sys.fs.mkdir(imagesDir);
  } catch (e) {}

  env.__STENCIL_SCREENSHOT_IMAGES_DIR__ = imagesDir;

  const dataDir = config.sys.path.join(tmpDir, DATA_CACHE_DIR);
  try {
    await config.sys.fs.mkdir(dataDir);
  } catch (e) {}

  const snapshotDataDir = config.sys.path.join(dataDir, snapshotId);
  try {
    await config.sys.fs.mkdir(snapshotDataDir);
  } catch (e) {}

  env.__STENCIL_SCREENSHOT_DATA_DIR__ = snapshotDataDir;

  const snapshot: d.E2ESnapshot = {
    id: snapshotId,
    desc: env.STENCIL_SNAPSHOT_DESC || '',
    commitUrl: env.STENCIL_SNAPSHOT_COMMIT_URL || '',
    imagesDir: imagesDir,
    dataDir: dataDir,
    timestamp: Date.now()
  };

  return snapshot;
}


export async function writeE2EScreenshot(screenshot: Buffer, uniqueDescription: string) {
  const env = (process.env) as d.E2EProcessEnv;

  const hash = crypto.createHash('md5')
                     .update(screenshot)
                     .digest('base64');

  const cleanedHash = hash.replace(/\\/g, '~')
                          .replace(/\+/g, '_')
                          .replace(/\=/g, '');

  const imageName = `${cleanedHash}.png`;
  const imagePath = path.join(env.__STENCIL_SCREENSHOT_IMAGES_DIR__, imageName);

  const imageExists = await fileExists(imagePath);
  if (!imageExists) {
    await writeFile(imagePath, screenshot);
  }

  const id = getTestId(uniqueDescription);
  const dataName = `${id}.json`;
  const dataPath = path.join(env.__STENCIL_SCREENSHOT_DATA_DIR__, dataName);

  const screenshotData: d.E2EScreenshot = {
    id: id,
    desc: uniqueDescription,
    hash: hash,
    image: imageName
  };

  await writeFile(dataPath, JSON.stringify(screenshotData));
}


export async function completeE2EScreenshots(config: d.Config, results: d.E2ESnapshot) {
  let connectorModulePath = process.env.STENCIL_SCREENSHOT_CONNECTOR;
  if (typeof connectorModulePath !== 'string' || !connectorModulePath) {
    connectorModulePath = config.sys.path.join(
      config.sys.compiler.packageDir, 'screenshot', 'screenshot.connector.default.js'
    );
  }

  const snapshot = await consolidateData(config, results);

  await runScreenshotScreenshotConnector(config, connectorModulePath, snapshot);
}


async function consolidateData(config: d.Config, results: d.E2ESnapshot) {
  const snapshotDataJsonDir = config.sys.path.join(results.dataDir, results.id);

  const snapshot: d.E2ESnapshot = {
    id: results.id,
    appRootDir: config.rootDir,
    packageDir: config.sys.compiler.packageDir,
    imagesDir: results.imagesDir,
    dataDir: results.dataDir,
    timestamp: results.timestamp,
    compilerVersion: config.sys.compiler.version,
    screenshots: []
  };

  const screenshotJsonFiles = await config.sys.fs.readdir(snapshotDataJsonDir);

  const unlinks: Promise<void>[] = [];

  screenshotJsonFiles.forEach(screenshotJsonFileName => {
    const screenshotJsonFilePath = config.sys.path.join(snapshotDataJsonDir, screenshotJsonFileName);

    const screenshotData: d.E2EScreenshot = JSON.parse(config.sys.fs.readFileSync(screenshotJsonFilePath));

    snapshot.screenshots.push(screenshotData);

    unlinks.push(config.sys.fs.unlink(screenshotJsonFilePath));
  });

  await Promise.all(unlinks);

  await config.sys.fs.rmdir(snapshotDataJsonDir);

  snapshot.screenshots.sort((a, b) => {
    if (a.desc < b.desc) return -1;
    if (a.desc > b.desc) return 1;
    return 0;
  });

  const snapshotDataJsonFileName = `${results.id}.json`;
  const snapshotDataJsonFilePath = config.sys.path.join(results.dataDir, snapshotDataJsonFileName);
  await config.sys.fs.writeFile(snapshotDataJsonFilePath, JSON.stringify(snapshot))

  return snapshot;
}


async function runScreenshotScreenshotConnector(config: d.Config, connectorModulePath: string, snapshot: d.E2ESnapshot) {
  try {
    const ScreenshotConnector = require(connectorModulePath);

    const connector: d.ScreenshotConnector = new ScreenshotConnector();

    if (typeof connector.generate === 'function') {
      const timespan = config.logger.createTimeSpan(`update screenshot data started`);

      await connector.generate(snapshot);

      timespan.finish(`updating screenshot data finished`);
    }

  } catch (e) {
    config.logger.error(`error running screenshot connector: ${connectorModulePath}, ${e}`);
  }
}


function getSnapshotId() {
  let snapshotId = process.env.STENCIL_SNAPSHOT_ID;
  if (typeof snapshotId === 'string' && snapshotId.length > 7) {
    return snapshotId;
  }

  snapshotId = crypto.createHash('md5')
                     .update(Date.now().toString())
                     .digest('hex')
                     .substr(0, 8)
                     .toLowerCase();

  process.env.STENCIL_SNAPSHOT_ID = snapshotId;

  return snapshotId;
}


function getTestId(uniqueDescription: string) {
  return crypto.createHash('md5')
               .update(uniqueDescription)
               .digest('hex')
               .substr(0, 8)
               .toLowerCase();
}


function fileExists(filePath: string) {
  return new Promise<boolean>(resolve => {
    fs.access(filePath, (err: any) => resolve(!err));
  });
}

function writeFile(filePath: string, data: any) {
  return new Promise<boolean>((resolve, reject) => {
    fs.writeFile(filePath, data, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

const IMAGES_CACHE_DIR = 'stencil-e2e-screenshots';
const DATA_CACHE_DIR = 'stencil-e2e-data';
