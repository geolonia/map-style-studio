import { Before, After, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { MapStyleWorld } from './world';

setDefaultTimeout(60000);

Before(async function (this: MapStyleWorld) {
  await this.init();
});

After(async function (this: MapStyleWorld, scenario) {
  if (scenario.result?.status === Status.FAILED) {
    const screenshot = await this.page?.screenshot();
    if (screenshot) {
      await this.attach(screenshot, 'image/png');
    }
  }
  await this.cleanup();
});
