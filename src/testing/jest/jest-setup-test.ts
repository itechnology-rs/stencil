import * as d from '../../declarations';
import * as customExpect from '../expect';
import { getDefaultBuildConditionals } from '../../build-conditionals';
import { h } from '../../renderer/vdom/h';


declare const global: d.JestEnvironmentGlobal;

export function jestSetupTestFramework() {
  global.__BUILD_CONDITIONALS__ = getDefaultBuildConditionals();
  global.Context = {};
  global.h = h;
  global.resourcesUrl = '/build';
  expect.extend(customExpect);
}
