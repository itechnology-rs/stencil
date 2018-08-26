import * as d from '../../declarations';


function screenshotLocalAdapter(): d.ScreenshotAdapter {

  return {

    async setup(data) {
      console.log('\n\n\n setup', data,'\n\n\n\n\n')
    },

    async commitScreenshot(screenshotData) {
      console.log('\n\n\n commitScreenshot', screenshotData,' \n\n\n\n\n')
    },

    async teardown(data) {
      console.log('\n\n\n teardown, ',data,' \n\n\n\n\n')
    },

  };

}

module.exports = screenshotLocalAdapter;
