import { hexToHsl } from '../../src/utils/colorHelpers';

// hexをHSLに変換する
describe('hexToHsl', () => {
  it('#ff0000 → [0, 1, 0.5]', () => {
    const [h, s, l] = hexToHsl('#ff0000');
    expect(Math.round(h)).toBe(0);
    expect(Math.round(s * 100)).toBe(100);
    expect(Math.round(l * 100)).toBe(50);
  });
  it('#00ff00 → [120, 1, 0.5]', () => {
    const [h, s, l] = hexToHsl('#00ff00');
    expect(Math.round(h)).toBe(120);
    expect(Math.round(s * 100)).toBe(100);
    expect(Math.round(l * 100)).toBe(50);
  });
  it('#0000ff → [240, 1, 0.5]', () => {
    const [h, s, l] = hexToHsl('#0000ff');
    expect(Math.round(h)).toBe(240);
    expect(Math.round(s * 100)).toBe(100);
    expect(Math.round(l * 100)).toBe(50);
  });
  it('不正な値は白', () => {
    expect(hexToHsl('')).toEqual([0, 0, 1]);
  });
});
