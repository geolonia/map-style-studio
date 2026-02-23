import { World as CucumberWorld, setWorldConstructor, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from 'playwright';

export class MapStyleWorld extends CucumberWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  readonly baseURL = 'http://localhost:5174/map-style-studio/';

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init() {
    this.browser = await chromium.launch({ headless: !process.env.HEADED });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();

    // CI環境ではベースマップスタイルを空に差し替えてタイル描画をスキップ
    await this.page.route('https://smartmap.styles.geoloniamaps.com/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ version: 8, sources: {}, layers: [] }),
      });
    });
  }

  async cleanup() {
    await this.context?.close();
    await this.browser?.close();
  }

  // MapLibreのクリックはmouse.move→mousedown→mouseupパターンで行う (SwiftShader対応)
  async clickMapAtOffset(x: number, y: number) {
    const container = await this.page.locator('[data-testid="map-container"]');
    const box = await container.boundingBox();
    if (!box) throw new Error('map-container not found');
    const cx = box.x + x;
    const cy = box.y + y;
    await this.page.mouse.move(cx, cy);
    await this.page.mouse.down();
    await this.page.mouse.up();
  }
}

setWorldConstructor(MapStyleWorld);
