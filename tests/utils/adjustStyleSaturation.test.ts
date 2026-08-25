import type { StyleSpecification } from 'maplibre-gl';
import { adjustStyleSaturation } from '../../src/utils/colorAdjustUtils';

describe('adjustStyleSaturation', () => {
  // テスト用のスタイル
  const baseStyle: StyleSpecification = {
    version: 8,
    sources: {},
    layers: [
      {
        id: 'fill-layer',
        type: 'fill',
        paint: { 'fill-color': '#806040' }
      },
      {
        id: 'line-layer',
        type: 'line',
        paint: { 'line-color': '#406080' }
      },
      {
        id: 'background-layer',
        type: 'background',
        paint: { 'background-color': '#608040' }
      },
      {
        id: 'symbol-layer',
        type: 'symbol',
        paint: { 'icon-color': '#123456' } // 彩度変更対象外
      }
    ]
  } as StyleSpecification;

  it('色属性を持つ全てのレイヤーの彩度が変わること', () => {
    const saturation = 100; // 彩度を最大に
    const newStyle = adjustStyleSaturation(baseStyle, saturation);

    // fill-color
    expect(newStyle.layers?.find(l => l.id === 'fill-layer')?.paint?.['fill-color'])
      .not.toBe(baseStyle.layers?.[0]?.paint?.['fill-color']);

    // line-color
    expect(newStyle.layers?.find(l => l.id === 'line-layer')?.paint?.['line-color'])
      .not.toBe(baseStyle.layers?.[1]?.paint?.['line-color']);

    // background-color
    expect(newStyle.layers?.find(l => l.id === 'background-layer')?.paint?.['background-color'])
      .not.toBe(baseStyle.layers?.[2]?.paint?.['background-color']);

    // symbol-layer（icon-color）は変更されない
    expect(newStyle.layers?.find(l => l.id === 'symbol-layer')?.paint?.['icon-color'])
      .toBe(baseStyle.layers?.[3]?.paint?.['icon-color']);
  });

  it('元のスタイルを書き換えないこと', () => {
    adjustStyleSaturation(baseStyle, 100);
    expect(baseStyle.layers?.[0]?.paint?.['fill-color']).toBe('#806040');
  });

  it('複数回彩度変更しても、元の色を基準に彩度が変更されること', () => {
    const saturation1 = 2;
    const saturation2 = 4;

    // 1回目の彩度変更
    const styleOnce = adjustStyleSaturation(baseStyle, saturation1);

    // 2回目の彩度変更（元のbaseStyleを基準に再度変更）
    const styleTwice = adjustStyleSaturation(baseStyle, saturation2);

    // 1回目の結果に対して再度彩度変更した場合（NG例）
    const styleWrong = adjustStyleSaturation(styleOnce, saturation2);

    // 2回目の正しい結果と、NG例は異なる値になるはず
    expect(styleTwice.layers?.find(l => l.id === 'fill-layer')?.paint?.['fill-color'])
      .not.toBe(styleWrong.layers?.find(l => l.id === 'fill-layer')?.paint?.['fill-color']);

    expect(styleTwice.layers?.find(l => l.id === 'line-layer')?.paint?.['line-color'])
      .not.toBe(styleWrong.layers?.find(l => l.id === 'line-layer')?.paint?.['line-color']);

    expect(styleTwice.layers?.find(l => l.id === 'background-layer')?.paint?.['background-color'])
      .not.toBe(styleWrong.layers?.find(l => l.id === 'background-layer')?.paint?.['background-color']);
  });
});
