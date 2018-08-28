import * as d from '../../declarations';
import * as fs from 'fs';
import * as path from 'path';


export class ScreenshotConnector implements d.ScreenshotConnector {
  rootDirName = 'screenshots';
  dataDirName = 'data';
  appDataFileName = 'data.json';
  imagesDirName = 'images';
  snapshotDataDirName = 'snapshots';
  addGitIgnore = true;

  results: d.E2ESnapshot;
  rootDir: string;
  dataDir: string;
  imagesDir: string;
  snapshotDataDir: string;

  async generate(results: d.E2ESnapshot) {
    this.results = results;

    await this.createDirs();
    await this.updateImages();
    await this.updateSnapshotData();
    await this.updateData();
  }

  async createDirs() {
    await this.createRootDir();
    await this.createDataDir();
    await this.createImagesDir();
    await this.createSnapshotDataDir();
  }

  async createRootDir() {
    this.rootDir = path.join(this.results.appRootDir, this.rootDirName);
    await this.mkDir(this.rootDir);

    if (this.addGitIgnore) {
      const gitIgnoreFilePath = path.join(this.rootDir, '.gitignore');
      await this.writeFile(gitIgnoreFilePath, '*');
    }
  }

  async createDataDir() {
    this.dataDir = path.join(this.rootDir, this.dataDirName);
    await this.mkDir(this.dataDir);
  }

  async createSnapshotDataDir() {
    this.snapshotDataDir = path.join(this.dataDir, this.snapshotDataDirName);
    await this.mkDir(this.snapshotDataDir);
  }

  async createImagesDir() {
    this.imagesDir = path.join(this.rootDir, this.imagesDirName);
    await this.mkDir(this.imagesDir);
  }

  async updateImages() {
    const copyTasks = this.results.screenshots.map(async screenshot => {
      const srcPath = path.join(this.results.imagesDir, screenshot.image);
      const destPath = path.join(this.imagesDir, screenshot.image);

      const imageExists = await this.hasAccess(destPath);
      if (!imageExists) {
        await this.copyFile(srcPath, destPath);
      }
    });

    await Promise.all(copyTasks);
  }

  async updateSnapshotData() {
    const snapshotJsonFileName = `${this.results.id}.json`;
    const snapshotJsonFilePath = path.join(this.snapshotDataDir, snapshotJsonFileName);

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

    await this.writeFile(snapshotJsonFilePath, JSON.stringify(snapshotData));
  }

  async updateData() {
    const snapshots = await this.getAllSnapshotData();

    const appData: d.E2EData = {
      appName: this.results.appName,
      masterSnapshotId: null,
      snapshots: snapshots.map(snapshot => {
        const abbrSnapshotData: d.E2ESnapshot = {
          id: snapshot.id,
          desc: snapshot.desc || '',
          commitUrl: snapshot.commitUrl || '',
          timestamp: snapshot.timestamp
        };
        return abbrSnapshotData
      })
    };

    appData.snapshots.sort((a, b) => {
      if (a.timestamp > b.timestamp) return -1;
      if (a.timestamp < b.timestamp) return 1;
      return 0;
    });

    const appDataJsonFilePath = path.join(this.dataDir, this.appDataFileName);

    try {
      const previousAppDataContent = await this.readFile(appDataJsonFilePath);
      const previousAppData = JSON.parse(previousAppDataContent) as d.E2EData;

      appData.masterSnapshotId = previousAppData.masterSnapshotId;

    } catch (e) {}

    if (!appData.masterSnapshotId && appData.snapshots.length > 0) {
      appData.masterSnapshotId = appData.snapshots[0].id;
    }

    await this.writeFile(appDataJsonFilePath, JSON.stringify(appData));
  }

  async getAllSnapshotData() {
    const snapshotJsonFileNames = await this.getSnapshotFileNames();

    const snapshots = snapshotJsonFileNames.map(async snapshotJsonFileName => {
      return await this.getSnapshotData(snapshotJsonFileName);
    });

    return Promise.all(snapshots);
  }

  async getSnapshotFileNames() {
    return await this.readDir(this.snapshotDataDir);
  }

  async getSnapshotData(snapshotJsonFileName: string) {
    let snapshotJsonContent: string;

    const cachedFilePath = path.join(this.results.dataDir, snapshotJsonFileName);

    try {
      snapshotJsonContent = await readFile(cachedFilePath);

    } catch (e) {
      const snapshotJsonFilePath = path.join(this.snapshotDataDir, snapshotJsonFileName);

      snapshotJsonContent = await this.readFile(snapshotJsonFilePath);

      await this.writeFile(cachedFilePath, snapshotJsonContent);
    }

    const parsedData: d.E2ESnapshot = JSON.parse(snapshotJsonContent);
    return parsedData;
  }


  readDir(dirPath: string) {
    return readDir(dirPath);
  }

  hasAccess(filePath: string) {
    return hasAccess(filePath);
  }

  copyFile(src: string, dest: string) {
    return copyFile(src, dest);
  }

  writeFile(filePath: string, data: any) {
    return writeFile(filePath, data);
  }

  readFile(filePath: string) {
    return readFile(filePath);
  }

  mkDir(dirPath: string) {
    return mkDir(dirPath);
  }

  stat(itemPath: string) {
    return stat(itemPath);
  }

  deleteItem(filePath: string) {
    return deleteFile(filePath);
  }

  deleteDir(dirPath: string) {
    return deleteDir(dirPath)
  }

  async deleteDirRecursive(dirPath: string) {
    const dirItems = await readDir(dirPath);

    const deletes = dirItems.map(async itemName => {
      const itemPath = path.join(dirPath, itemName);

      const stat = await this.stat(itemPath);
      if (stat.isFile) {
        await this.deleteItem(itemPath);
      } else if (stat.isDirectory) {
        await this.deleteDirRecursive(itemPath);
      }
    });

    await Promise.all(deletes);

    await this.deleteDir(dirPath);
  }

  async copyDir(srcDirPath: string, destDirPath: string) {
    const srcDirItems = await readDir(srcDirPath);

    const copies = srcDirItems.map(async itemName => {
      const srcItemPath = path.join(srcDirPath, itemName);
      const destItemPath = path.join(destDirPath, itemName);

      const stat = await this.stat(srcItemPath);
      if (stat.isFile) {
        await this.copyFile(srcItemPath, destItemPath);

      } else if (stat.isDirectory) {
        await this.mkDir(destItemPath);
        await this.copyDir(srcItemPath, destItemPath);
      }
    });

    await Promise.all(copies);
  }

}


async function readDir(dirPath: string) {
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

async function hasAccess(filePath: string) {
  return new Promise<boolean>(resolve => {
    fs.access(filePath, (err: any) => resolve(!err));
  });
}

async function copyFile(src: string, dest: string) {
  return new Promise<void>((resolve, reject) => {
    const rd = fs.createReadStream(src);
    rd.on('error', reject);

    const wr = fs.createWriteStream(dest);
    wr.on('error', reject);
    wr.on('close', resolve);
    rd.pipe(wr);
  });
}

async function writeFile(filePath: string, data: any) {
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

async function readFile(filePath: string) {
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

async function stat(itemPath: string) {
  return new Promise<{ isFile: boolean; isDirectory: boolean }>((resolve, reject) => {
    fs.stat(itemPath, (err, stat) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          isFile: stat.isFile(),
          isDirectory: stat.isDirectory()
        });
      }
    });
  });
}

async function mkDir(dirPath: string) {
  return new Promise<void>(resolve => {
    fs.mkdir(dirPath, () => resolve());
  });
}

async function deleteFile(filePath: string) {
  return new Promise<void>(resolve => {
    fs.unlink(filePath, () => resolve());
  });
}

async function deleteDir(dirPath: string) {
  return new Promise<void>(resolve => {
    fs.rmdir(dirPath, () => resolve());
  });
}
