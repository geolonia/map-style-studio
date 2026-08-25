import { adjustBrightness } from '../../src/utils/colorAdjustUtils';

describe('adjustBrightness', () => {
  it('3桁のHEXを6桁と同じ色として扱うこと', () => {
    expect(adjustBrightness('#fff', 0)).toBe('#ffffff');
    expect(adjustBrightness('#f00', 0)).toBe(adjustBrightness('#ff0000', 0));
  });

  it('HEXとして解釈できない値は元の値のまま返すこと', () => {
    expect(adjustBrightness('rgba(0,0,0,0.5)', 10)).toBe('rgba(0,0,0,0.5)');
    expect(adjustBrightness('#12', 10)).toBe('#12');
  });

  it('明度を上げると各成分が明るくなること', () => {
    const brighter = adjustBrightness('#808080', 10);
    expect(parseInt(brighter.slice(1, 3), 16)).toBeGreaterThan(0x80);
  });
});
