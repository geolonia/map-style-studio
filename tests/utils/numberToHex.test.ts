import { numberToHex } from '../../src/utils/colorHelpers';

describe('numberToHex', () => {
  it('0は"00"になる', () => {
    expect(numberToHex(0)).toBe('00');
  });

  it('1は"ff"になる', () => {
    expect(numberToHex(1)).toBe('ff');
  });

  it('0.5は"80"になる', () => {
    expect(numberToHex(0.5)).toBe('80');
  });

  it('0.0039は"01"になる', () => {
    expect(numberToHex(0.0039)).toBe('01');
  });

  it('0.25は"40"になる', () => {
    expect(numberToHex(0.25)).toBe('40');
  });

  it('0.75は"bf"になる', () => {
    expect(numberToHex(0.75)).toBe('bf');
  });
});
