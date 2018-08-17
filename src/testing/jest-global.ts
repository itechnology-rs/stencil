import { setupTestConfig } from './test-config';
import { setupTestPuppeteer, teardownTestPuppeteer } from './puppeteer-api';
import { setupTestApp, teardownTestApp } from './test-app';


export async function jestGlobalSetup() {
  const config = setupTestConfig();

  await Promise.all([
    await setupTestApp(config),
    await setupTestPuppeteer()
  ]);
}


export async function jestGlobalTeardown() {
  await Promise.all([
    await teardownTestApp(),
    await teardownTestPuppeteer()
  ]);
}
