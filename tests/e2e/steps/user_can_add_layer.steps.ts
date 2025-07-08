import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('レイヤーリスト画面を開いている', async function () {
  await this.page.goto('/');
  await this.page.getByRole('button', { name: 'サンプルスタイルを開く' }).click();
});

When('レイヤー追加ボタンをクリックする', async function () {
  await this.page.getByRole('button', { name: /レイヤーを追加/ }).click();
});

Then('レイヤー追加モーダルが表示される', async function () {
  await expect(this.page.getByText('レイヤーを追加')).toBeVisible();
});

When('レイヤーIDに {string} と入力する', async function (layerId: string) {
  await this.page.getByTestId('layer-id-input').fill(layerId);
});

When('タイプに {string} を選択する', async function (type: string) {
  await this.page.getByTestId('layer-type-select').selectOption(type);
});

When('追加ボタンをクリックする', async function () {
  await this.page.getByRole('button', { name: '追加' }).click();
});

Then('レイヤーリストに {string} が表示される', async function (layerId: string) {
  await expect(this.page.getByText(layerId)).toBeVisible();
});
