import { hslToHex } from '../../src/utils/colorHelpers';

// hslをhexに変換する
describe('hslToHex', () => {
  it('[0,1,0.5] → #ff0000', () => {
    expect(hslToHex(0, 1, 0.5)).toBe('#ff0000');
  });
  it('[120,1,0.5] → #00ff00', () => {
    expect(hslToHex(120, 1, 0.5)).toBe('#00ff00');
  });
  it('[240,1,0.5] → #0000ff', () => {
    expect(hslToHex(240, 1, 0.5)).toBe('#0000ff');
  });
});
