

export class JestReporter {

  constructor(private globalConfig: any, private options: any) {
  }

  onRunStart() {
    // console.log('onRunStart', arguments);
  }

  onTestStart() {
    // console.log('onTestStart', arguments);
  }

  onTestResult() {
    // console.log('onTestResult', arguments);
  }

  onRunComplete(contexts: any, results: any) {
    contexts; this.globalConfig; this.options; results;
    // console.log('onRunComplete');
    // console.log('contexts: ', contexts);
    // console.log('results: ', results);
    // console.log('GlobalConfig: ', this.globalConfig);
    // console.log('Options: ', this.options);
  }
}
