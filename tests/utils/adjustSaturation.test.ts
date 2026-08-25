import { adjustSaturation } from '../../src/utils/colorAdjustUtils';

describe('adjustSaturation', () => {
  it('無彩色は彩度を上げても色がつかないこと', () => {
    expect(adjustSaturation('#888888', 100)).toBe('#888888');
  });

  it('くすんだ色は彩度を上げると鮮やかになること', () => {
    const base = '#806040';
    const saturated = adjustSaturation(base, 5);
    expect(saturated).not.toBe(base);
    const [r, g, b] = [1, 3, 5].map(i => parseInt(saturated.slice(i, i + 2), 16));
    expect(Math.max(r, g, b) - Math.min(r, g, b))
      .toBeGreaterThan(0x80 - 0x40);
  });

  it('彩度0でグレーになること', () => {
    const color = '#ff8800'; // オレンジ
    const desaturated = adjustSaturation(color, -100);
    // グレー系の色になるはず
    expect(/^#([0-9a-f]{6})$/i.test(desaturated)).toBe(true);
    // R=G=Bに近い値になる
    const r = parseInt(desaturated.slice(1, 3), 16);
    const g = parseInt(desaturated.slice(3, 5), 16);
    const b = parseInt(desaturated.slice(5, 7), 16);
    expect(Math.abs(r - g)).toBeLessThan(10);
    expect(Math.abs(g - b)).toBeLessThan(10);
    expect(Math.abs(r - b)).toBeLessThan(10);
  });

  it('彩度0の調整では明るい色でも元の色のまま返すこと', () => {
    expect(adjustSaturation('#ffcc99', 0)).toBe('#ffcc99');
  });

  it('彩度最大でも純色は変化しない（例: #ff0000）', () => {
    const red = '#ff0000';
    const saturated = adjustSaturation(red, 100);
    expect(saturated).toBe(red);
  });
});
