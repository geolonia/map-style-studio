import { Given, When, Then } from '@cucumber/cucumber';
import path from 'path';
import { MapStyleWorld } from '../support/world';

const FIXTURE_DIR = path.resolve(__dirname, '../fixtures');

Given('アプリが起動している', async function (this: MapStyleWorld) {
  await this.page.goto(this.baseURL);
  await this.page.waitForLoadState('domcontentloaded');
});

Given('スタイルが読み込まれている', async function (this: MapStyleWorld) {
  await this.page.goto(this.baseURL);
  await this.page.waitForLoadState('domcontentloaded');
  const filePath = path.resolve(FIXTURE_DIR, 'dummy-style.json');
  await this.page.setInputFiles('input[type="file"]', filePath);
  await this.page.waitForSelector('[data-testid="floating-layer-panel"]', { timeout: 30000 });
});

When('スタイルJSONファイルをアップロードする', async function (this: MapStyleWorld) {
  const filePath = path.resolve(FIXTURE_DIR, 'dummy-style.json');
  await this.page.setInputFiles('input[type="file"]', filePath);
});

Then('ファイルアップロードエリアが表示される', async function (this: MapStyleWorld) {
  await this.page.waitForSelector('text=クリックまたはファイルをドラッグしてアップロード', { timeout: 10000 });
});

Then('レイヤーパネルが表示される', async function (this: MapStyleWorld) {
  await this.page.waitForSelector('[data-testid="floating-layer-panel"]', { timeout: 30000 });
});

Then('「ダウンロード」ボタンが有効になる', async function (this: MapStyleWorld) {
  await this.page.waitForFunction(
    () => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.includes('ダウンロード') && !btn.disabled) {
          return true;
        }
      }
      return false;
    },
    { timeout: 30000 }
  );
});
