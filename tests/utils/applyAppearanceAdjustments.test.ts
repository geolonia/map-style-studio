import type { StyleSpecification } from 'maplibre-gl';
import {
  adjustStyleBrightness,
  adjustStyleSaturation,
  applyAppearanceAdjustments,
} from '../../src/utils/colorAdjustUtils';

const baseStyle = (): StyleSpecification => ({
  version: 8,
  sources: {},
  layers: [{ id: 'fill-layer', type: 'fill', paint: { 'fill-color': '#806040' } }],
}) as StyleSpecification;

const fillColor = (style: StyleSpecification) =>
  style.layers[0].paint?.['fill-color'];

describe('applyAppearanceAdjustments', () => {
  it('明度・彩度がどちらも0なら元の色のまま返すこと', () => {
    expect(fillColor(applyAppearanceAdjustments(baseStyle(), 0, 0))).toBe('#806040');
  });

  it('明度と彩度の両方を反映すること', () => {
    const both = applyAppearanceAdjustments(baseStyle(), 5, 5);
    expect(fillColor(both)).not.toBe(fillColor(adjustStyleBrightness(baseStyle(), 5)));
    expect(fillColor(both)).not.toBe(fillColor(adjustStyleSaturation(baseStyle(), 5)));
  });

  it('同じ基準スタイルからなら何度呼んでも同じ結果になること', () => {
    const base = baseStyle();
    expect(fillColor(applyAppearanceAdjustments(base, 3, 2)))
      .toBe(fillColor(applyAppearanceAdjustments(base, 3, 2)));
  });

  it('調整済みのスタイルに重ねた場合と結果が異なること（累積しないこと）', () => {
    const base = baseStyle();
    const once = applyAppearanceAdjustments(base, 2, 0);
    expect(fillColor(applyAppearanceAdjustments(base, 4, 0)))
      .not.toBe(fillColor(applyAppearanceAdjustments(once, 4, 0)));
  });

  it('基準スタイルを書き換えないこと', () => {
    const base = baseStyle();
    applyAppearanceAdjustments(base, 5, 5);
    expect(fillColor(base)).toBe('#806040');
  });
});
