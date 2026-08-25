import { rgbaToHex } from '../../src/utils/colorHelpers';

// rgbaをHexに変換する
describe('rgbaToHex', () => {
  it('rgba(255,0,0,1) → #ff0000', () => {
    expect(rgbaToHex('rgba(255,0,0,1)')).toBe('#ff0000');
  });
  it('rgba(255,255,255,0.5) → #ffffff80', () => {
    expect(rgbaToHex('rgba(255,255,255,0.5)')).toBe('#ffffff80');
  });
  it('rgb(0,128,255) → #0080ff', () => {
    expect(rgbaToHex('rgb(0,128,255)')).toBe('#0080ff');
  });
  it('hexできたら、そのまま返す', () => {
    expect(rgbaToHex('#DA291C')).toBe('#DA291C');
  });
  it('不正な文字列はそのまま返す', () => {
    expect(rgbaToHex('hoge')).toBe('hoge');
  });
});
