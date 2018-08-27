import * as d from '../../declarations';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';


export async function startE2ESnapshot(config: d.Config) {
  const env = (process.env) as d.JestProcessEnv;

  const snapshotId = createSnapshotId();
  config.logger.debug(`test e2e snapshot id: ${snapshotId}`);
  env.__STENCIL_E2E_SNAPSHOT_ID__ = snapshotId;

  const tmpDir = config.sys.details.tmpDir;

  const imagesDir = config.sys.path.join(tmpDir, 'stencil-e2e-screenshots');
  try {
    await config.sys.fs.mkdir(imagesDir);
  } catch (e) {}

  env.__STENCIL_SCREENSHOT_IMAGES_DIR__ = imagesDir;

  const dataDir = config.sys.path.join(tmpDir, `stencil-e2e-${snapshotId}`);
  try {
    await config.sys.fs.mkdir(dataDir);
  } catch (e) {}

  env.__STENCIL_SCREENSHOT_DATA_DIR__ = dataDir;

  const snapshot: d.E2ESnapshot = {
    id: snapshotId,
    imagesDir: imagesDir,
    dataDir: dataDir,
    timestamp: Date.now()
  };

  return snapshot;
}


export async function writeE2EScreenshot(screenshot: Buffer, uniqueDescription: string) {
  const env = (process.env) as d.JestProcessEnv;

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

  const id = createTestId(uniqueDescription);
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
  const screenshotConnector = config.screenshot.screenshotConnector;
  if (!screenshotConnector) {
    return;
  }

  const snapshot = await consolidateData(config, results);

  await runScreenshotScreenshotConnector(config, screenshotConnector, snapshot);
}


async function consolidateData(config: d.Config, results: d.E2ESnapshot) {
  const dataJsonDir = results.dataDir;

  const snapshot: d.E2ESnapshot = {
    id: results.id,
    rootDir: config.rootDir,
    packageDir: config.sys.compiler.packageDir,
    imagesDir: results.imagesDir,
    timestamp: results.timestamp,
    screenshots: []
  };

  const screenshotJsonFiles = await config.sys.fs.readdir(dataJsonDir);

  const unlinks: Promise<void>[] = [];

  screenshotJsonFiles.forEach(screenshotJsonFileName => {
    const screenshotJsonFilePath = config.sys.path.join(dataJsonDir, screenshotJsonFileName);

    const screenshotData: d.E2EScreenshot = JSON.parse(config.sys.fs.readFileSync(screenshotJsonFilePath));

    snapshot.screenshots.push(screenshotData);

    unlinks.push(config.sys.fs.unlink(screenshotJsonFilePath));
  });

  await Promise.all(unlinks);

  await config.sys.fs.rmdir(dataJsonDir);

  snapshot.screenshots.sort((a, b) => {
    if (a.desc < b.desc) return -1;
    if (a.desc > b.desc) return 1;
    return 0;
  });

  return snapshot;
}


async function runScreenshotScreenshotConnector(config: d.Config, screenshotConnector: string, snapshot: d.E2ESnapshot) {
  try {
    const ScreenshotConnector = require(screenshotConnector);

    const connector: d.ScreenshotConnector = new ScreenshotConnector();

    if (typeof connector.generate === 'function') {
      const timespan = config.logger.createTimeSpan(`update screenshot data started`);

      await connector.generate(snapshot);

      timespan.finish(`updating screenshot data finished`);
    }

  } catch (e) {
    config.logger.error(`error running screenshot connector: ${screenshotConnector}, ${e}`);
  }
}


function createSnapshotId() {
  return crypto.createHash('md5')
               .update(Date.now().toString())
               .digest('base64')
               .replace(/\W/g, '')
               .substr(0, 8);
}


function createTestId(uniqueDescription: string) {
  return crypto.createHash('md5')
               .update(uniqueDescription)
               .digest('base64')
               .replace(/\W/g, '')
               .substr(0, 8);
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
