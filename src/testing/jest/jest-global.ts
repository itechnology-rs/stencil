import { setupTestConfig } from '../test-config';
import { setupTestPuppeteer, teardownTestPuppeteer } from '../puppeteer/puppeteer-browser';
import { setupTestApp, teardownTestApp } from '../test-app';


export async function jestGlobalSetup() {
  const config = setupTestConfig();

  await Promise.all([
    await setupTestApp(config),
    await setupTestPuppeteer(config)
  ]);
}


export async function jestGlobalTeardown() {
  await Promise.all([
    await teardownTestApp(),
    await teardownTestPuppeteer()
  ]);
}
