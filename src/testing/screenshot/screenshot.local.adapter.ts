import * as d from '../../declarations';


export default function screenshotLocalAdapter(): d.ScreenshotAdapter {

  return {

    async beforeScreenshot(specData) {
      console.log('\n\n\n beforeScreenshot', specData, '\n\n\n\n\n')
      return null;
    },

    async commitScreenshot(opts) {
      opts;
    }

  };

}
