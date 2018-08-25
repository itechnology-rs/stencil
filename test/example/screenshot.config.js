const fs = require('fs');


module.exports = function screenshotConfig() {

  return {

    setupTests(data) {

      return {
        snapshotId: 88
      }
    },

    screenshot(data) {

    },

    teardownTests(data) {

    }

  }

}
