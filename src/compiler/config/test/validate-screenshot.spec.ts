import * as d from '../../../declarations';
import { mockLogger, mockStencilSystem } from '../../../testing/mocks';
import { normalizePath } from '../../util';
import { validateConfig } from '../validate-config';
import * as path from 'path';


describe('validateScreenshot', () => {

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


  it('should set absolute screenshotConnector from rel flag', () => {
    config.flags.e2e = true;
    config.flags.screenshot = true;
    config.flags.screenshotConnector = 'some/connector.js';
    validateConfig(config);
    expect(config.screenshot.screenshotConnector).toEqual(normalizePath(path.join(ROOT, 'User', 'my-app', 'some', 'connector.js')));
  });

  it('should set absolute screenshotConnector from flag', () => {
    const abs = normalizePath(path.join(ROOT, 'User', 'my-app', 'some', 'connector.js'));

    config.flags.e2e = true;
    config.flags.screenshot = true;
    config.flags.screenshotConnector = abs;
    validateConfig(config);
    expect(config.screenshot.screenshotConnector).toEqual(abs);
  });

  it('should set empty screenshotConnector w/out screenshot flag', () => {
    config.flags.e2e = true;
    config.flags.screenshot = false;
    validateConfig(config);
    expect(config.screenshot.screenshotConnector).toEqual(null);
  });

  it('should set empty screenshotConnector w/out e2e flag', () => {
    config.flags.e2e = false;
    config.flags.screenshot = true;
    validateConfig(config);
    expect(config.screenshot.screenshotConnector).toEqual(null);
  });

});
