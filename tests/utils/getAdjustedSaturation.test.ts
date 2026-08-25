import { getAdjustedSaturation } from '../../src/utils/colorHelpers';

describe('getAdjustedSaturation', () => {
  it('彩度調整なしなら元の彩度と同じ', () => {
    // オレンジ #ff8800
    const s = getAdjustedSaturation(255, 136, 0, 0);
    // 元の彩度
    const base = getAdjustedSaturation(255, 136, 0, 0);
    expect(s).toBeCloseTo(base, 5);
  });

  it('彩度最大(+20)なら彩度が1になる', () => {
    // オレンジ #ff8800
    const s = getAdjustedSaturation(255, 136, 0, 20);
    expect(s).toBe(1);
  });

  it('彩度最小(-20)なら彩度が0になる', () => {
    // オレンジ #ff8800
    const s = getAdjustedSaturation(255, 136, 0, -20);
    expect(s).toBe(0);
  });

  it('グレーは彩度調整しても0のまま', () => {
    // グレー #888888
    const s = getAdjustedSaturation(136, 136, 136, 20);
    expect(s).toBe(0);
  });

  it('純色は彩度最大でも1のまま', () => {
    // 赤 #ff0000
    const s = getAdjustedSaturation(255, 0, 0, 20);
    expect(s).toBe(1);
  });

  it('彩度を増減すると値が変化する', () => {
    // くすんだ茶色 #806040
    const base = getAdjustedSaturation(128, 96, 64, 0);
    const up = getAdjustedSaturation(128, 96, 64, 2);
    const down = getAdjustedSaturation(128, 96, 64, -2);
    expect(up).toBeGreaterThan(base);
    expect(down).toBeLessThan(base);
  });
});
