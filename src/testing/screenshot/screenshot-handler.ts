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

  const rootDir = config.sys.path.join(tmpDir, 'stencil-e2e-screenshots');
  try {
    await config.sys.fs.mkdir(rootDir);
  } catch (e) {}

  const imagesDir = config.sys.path.join(rootDir, 'images');
  try {
    await config.sys.fs.mkdir(imagesDir);
  } catch (e) {}

  env.__STENCIL_SCREENSHOT_IMAGES_DIR__ = imagesDir;

  const dataDir = config.sys.path.join(rootDir, 'data');
  try {
    await config.sys.fs.mkdir(dataDir);
  } catch (e) {}

  const snapshotDataDir = config.sys.path.join(dataDir, snapshotId);
  try {
    await config.sys.fs.mkdir(dataDir);
  } catch (e) {}

  env.__STENCIL_SCREENSHOT_DATA_DIR__ = snapshotDataDir;

  const snapshot: d.E2ESnapshot = {
    snapshotId: snapshotId,
    rootDir: rootDir,
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

  const cleanedHash = hash.replace(/\\/g, '~').replace(/\+/g, '_');

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
    image: imagePath
  };

  await writeFile(dataPath, JSON.stringify(screenshotData));
}


export async function completeE2EScreenshots(config: d.Config, snapshot: d.E2ESnapshot) {
  const screenshotAdapters = config.testing.screenshotAdapters;
  if (!Array.isArray(screenshotAdapters)) {
    return;
  }

  for (let i = 0; i < screenshotAdapters.length; i++) {
    const screenshotAdapter = screenshotAdapters[i];

    if (typeof screenshotAdapter === 'string') {
      await runScreenshotAdapter(screenshotAdapter, snapshot);
    }
  }
}


async function runScreenshotAdapter(screenshotAdapter: string, snapshot: d.E2ESnapshot) {
  console.log('screenshotAdapter', screenshotAdapter);
  const ScreenAdapter = require(screenshotAdapter);

  const adapter: d.ScreenshotAdaptor = new ScreenAdapter();

  await adapter.generate(snapshot);
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
    fs.access(filePath, (err: any) => {
      resolve(!err);
    });
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
