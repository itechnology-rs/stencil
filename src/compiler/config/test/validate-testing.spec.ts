import * as d from '../../../declarations';
import { mockLogger, mockStencilSystem } from '../../../testing/mocks';
import { normalizePath } from '../../util';
import { validateConfig } from '../validate-config';
import * as path from 'path';


describe('validateTesting', () => {

  let config: d.Config;
  const logger = mockLogger();
  const sys = mockStencilSystem();

  const ROOT = path.resolve('/');

  beforeEach(() => {
    config = {
      sys: sys,
      logger: logger,
      rootDir: path.join(ROOT, 'User', 'my-app'),
      cwd: path.join(ROOT, 'User', 'my-app'),
      flags: {}
    };
  });


  it('should set absolute snapshotAdapter from rel flag', () => {
    config.flags.e2e = true;
    config.flags.screenshot = true;
    config.flags.screenshotAdapter = 'some/adapter.js';
    validateConfig(config);
    expect(config.testing.screenshotAdapters).toEqual([normalizePath(path.join(ROOT, 'User', 'my-app', 'some', 'adapter.js'))]);
  });

  it('should set absolute snapshotAdapter from flag', () => {
    const abs = normalizePath(path.join(ROOT, 'User', 'my-app', 'some', 'adapter.js'));

    config.flags.e2e = true;
    config.flags.screenshot = true;
    config.flags.screenshotAdapter = abs;
    validateConfig(config);
    expect(config.testing.screenshotAdapters).toEqual([abs]);
  });

});
