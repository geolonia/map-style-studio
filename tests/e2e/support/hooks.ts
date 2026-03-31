import { Before, After } from '@cucumber/cucumber';

Before(async function () {
  await this.openBrowser();
});

After(async function () {
  try {
    await this.closeBrowser();
  } catch (error) {
    console.error('Browser cleanup failed:', error);
  }
});
