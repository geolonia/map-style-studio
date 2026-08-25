import type { StyleSpecification } from 'maplibre-gl';
import { adjustStyleBrightness, adjustStyleSaturation } from '../../src/utils/colorAdjustUtils';

const baseStyle = (): StyleSpecification => ({
  version: 8,
  sources: {},
  layers: [
    { id: 'fill-layer', type: 'fill', paint: { 'fill-color': '#ffcc99' } },
  ],
}) as StyleSpecification;

describe('adjustStyleBrightness / adjustStyleSaturation', () => {
  it('明度調整が元のスタイルを書き換えないこと', () => {
    const style = baseStyle();
    adjustStyleBrightness(style, 10);
    expect(style.layers[0].paint?.['fill-color']).toBe('#ffcc99');
  });

  it('彩度調整が元のスタイルを書き換えないこと', () => {
    const style = baseStyle();
    adjustStyleSaturation(style, 10);
    expect(style.layers[0].paint?.['fill-color']).toBe('#ffcc99');
  });
});
