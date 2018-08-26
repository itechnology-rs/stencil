import * as d from '../../declarations';
const fs = require('fs');
const path = require('path');


const screenshotLocalAdaptor: d.ScreenshotAdapter = {

  async setup(data) {
    const screenshotDir = path.join(data.rootDir, 'screenshots');
    const dataDir = path.join(screenshotDir, 'data');
    const imagesDir = path.join(screenshotDir, 'images');
    const snapshotDir = path.join(dataDir, data.snapshotId);

    try {
      fs.mkdirSync(screenshotDir);
    } catch (e) {}

    try {
      fs.mkdirSync(dataDir);
    } catch (e) {}

    try {
      fs.mkdirSync(imagesDir);
    } catch (e) {}

    try {
      fs.mkdirSync(snapshotDir);
    } catch (e) {}


  },

  async commitScreenshot(data) {
    const screenshotDir = path.join(data.rootDir, 'screenshots');
    const dataDir = path.join(screenshotDir, 'data');
    const imagesDir = path.join(screenshotDir, 'images');
    const snapshotDataDir = path.join(dataDir, data.snapshotId);

    const imageFileName = `${data.hash}.${data.type}`;
    const imageFilePath = path.join(imagesDir, imageFileName);

    const imageExists = await fileExists(imageFilePath);
    if (!imageExists) {
      await writeFile(imageFilePath, data.screenshot);
    }

    const screenshotData: ScreenshotData = {
      testId: data.testId,
      description: data.description,
      image: imageFileName
    };

    const jsonFile = path.join(snapshotDataDir, `${data.testId}.json`);
    await writeFile(jsonFile, JSON.stringify(screenshotData));
  },

  async teardown(data) {
    const screenshotDir = path.join(data.rootDir, 'screenshots');
    const dataDir = path.join(screenshotDir, 'data');
    const snapshotDataDir = path.join(dataDir, data.snapshotId);
    const snapshotJsonFile = path.join(dataDir, data.snapshotId + '.json');

    const jsonFiles = fs.readdirSync(snapshotDataDir) as string[];

    const snapshotData: SnapshotData = {
      snapshotId: data.snapshotId,
      timestamp: Date.now(),
      screenshots: jsonFiles
        .filter(fileName => {
          return fileName.endsWith('.json');
        })
        .map(fileName => {
          const filePath = path.join(snapshotDataDir, fileName);
          const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8')) as ScreenshotData;
          return fileData;
        })
        .sort((a, b) => {
          if (a.description < b.description) return -1;
          if (a.description > b.description) return 1;
          return 0;
        })
    };

    await writeFile(snapshotJsonFile, JSON.stringify(snapshotData));

    jsonFiles.forEach(fileName => {
      const filePath = path.join(snapshotDataDir, fileName);
      fs.unlinkSync(filePath);
    });

    fs.rmdirSync(snapshotDataDir);
  },

};

module.exports = screenshotLocalAdaptor;


interface SnapshotData {
  snapshotId: string;
  timestamp: number;
  screenshots: ScreenshotData[];
}


interface ScreenshotData {
  testId: string;
  description: string;
  image: string;
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
