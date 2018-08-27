import * as d from '../../declarations';
import * as fs from 'fs';
import * as path from 'path';


export class ScreenshotConnector implements d.ScreenshotConnector {
  appDirName = 'screenshots';
  appDataDirName = 'data';
  imagesDirName = 'images';
  snapshotDataDirName = 'snapshots';

  results: d.E2ESnapshot;
  appDir: string;
  appDataDir: string;
  imagesDir: string;
  snapshotDataDir: string;

  async generate(results: d.E2ESnapshot) {
    this.results = results;

    await this.createAppStructure();
    await this.copyImages();
    await this.copySnapshotData();
    await this.updateApp();
  }

  async copyImages() {
    const copyTasks = this.results.screenshots.map(async screenshot => {
      const srcPath = path.join(this.results.imagesDir, screenshot.image);
      const destPath = path.join(this.imagesDir, screenshot.image);

      const imageExists = await this.fileExists(destPath);
      if (!imageExists) {
        await this.copyFile(srcPath, destPath);
      }
    });

    await Promise.all(copyTasks);
  }

  async copySnapshotData() {
    const snapshotJsonpFileName = `${this.results.id}.js`;
    const snapshotJsonpFilePath = path.join(this.snapshotDataDir, snapshotJsonpFileName);

    const snapshotData: d.E2ESnapshot = {
      id: this.results.id,
      desc: this.results.desc || '',
      commitUrl: this.results.commitUrl || '',
      timestamp: this.results.timestamp,
      screenshots: this.results.screenshots.map(screenshot => {
        return {
          id: screenshot.id,
          desc: screenshot.desc,
          image: screenshot.image
        };
      })
    };

    const snapshotJsonp = `loadSnapshot(${JSON.stringify(snapshotData)});`;

    await this.writeFile(snapshotJsonpFilePath, snapshotJsonp);
  }

  async updateApp() {
    const appData: d.E2EApp = {
      snapshots: []
    };

    const snapshotJsonpFilePaths = (await this.readDir(this.snapshotDataDir)).map(snapshotJsonpFileName => {
      return path.join(this.snapshotDataDir, snapshotJsonpFileName);
    });

    const snapshots = snapshotJsonpFilePaths.map(async snapshotJsonpFilePath => {
      const snapshotJsonpContent = await this.readFile(snapshotJsonpFilePath);

      const match = snapshotJsonpContent.match('loadSnapshot\\((.*)\\);');
      if (match && match[1]) {
        const parsedData: d.E2ESnapshot = JSON.parse(match[1]);

        const snapshotData: d.E2ESnapshot = {
          id: parsedData.id,
          desc: parsedData.desc,
          commitUrl: parsedData.commitUrl,
          timestamp: parsedData.timestamp
        };
        appData.snapshots.push(snapshotData);
      }
    });

    await Promise.all(snapshots);

    appData.snapshots.sort((a, b) => {
      if (a.timestamp > b.timestamp) return -1;
      if (a.timestamp < b.timestamp) return 1;
      return 0;
    });

    const appSrcFilePath = path.join(this.results.packageDir, 'dist', 'screenshot', 'screenshot.app.html');
    const appSrcHtml = await this.readFile(appSrcFilePath);

    const appDestFilePath = path.join(this.appDir, 'index.html');

    const appJsonp = `loadApp(${JSON.stringify(appData)});`;
    const appDestHtml = appSrcHtml.replace('{{APP_JSONP}}', appJsonp);

    await this.writeFile(appDestFilePath, appDestHtml);
  }

  async readDir(dirPath: string) {
    return new Promise<string[]>((resolve, reject) => {
      fs.readdir(dirPath, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }

  async fileExists(filePath: string) {
    return new Promise<boolean>(resolve => {
      fs.access(filePath, (err: any) => resolve(!err));
    });
  }

  async copyFile(src: string, dest: string) {
    return new Promise((resolve, reject) => {
      const rd = fs.createReadStream(src);
      rd.on('error', reject);

      const wr = fs.createWriteStream(dest);
      wr.on('error', reject);
      wr.on('close', resolve);
      rd.pipe(wr);
    });
  }

  async writeFile(filePath: string, data: string) {
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(filePath, data, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async readFile(filePath: string) {
    return new Promise<string>((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  async createAppStructure() {
    await this.createAppDir();
    await this.createAppDataDir();
    await this.createImagesDataDir();
    await this.createSnapshotDataDir();
  }

  async createAppDir() {
    this.appDir = path.join(this.results.rootDir, this.appDirName);
    try {
      fs.mkdirSync(this.appDir);
    } catch (e) {}
  }

  async createAppDataDir() {
    this.appDataDir = path.join(this.appDir, this.appDataDirName);
    try {
      fs.mkdirSync(this.appDataDir);
    } catch (e) {}
  }

  async createSnapshotDataDir() {
    this.snapshotDataDir = path.join(this.appDataDir, this.snapshotDataDirName);
    try {
      fs.mkdirSync(this.snapshotDataDir);
    } catch (e) {}
  }

  async createImagesDataDir() {
    this.imagesDir = path.join(this.appDir, this.imagesDirName);
    try {
      fs.mkdirSync(this.imagesDir);
    } catch (e) {}
  }

}

