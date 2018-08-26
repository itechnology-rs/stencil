import * as d from '../../declarations';


class ScreenshotLocalAdapter implements d.ScreenshotAdaptor {

  async generate(snapshot: d.E2ESnapshot) {
    console.log('genereate', snapshot);
  }

}

module.exports = ScreenshotLocalAdapter;
