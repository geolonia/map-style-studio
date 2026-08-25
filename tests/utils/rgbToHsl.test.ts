import { rgbToHsl } from '../../src/utils/colorHelpers';

describe('rgbToHsl', () => {
    it('黒 (#000000) は h=0, s=0, l=0', () => {
        const { h, s, l } = rgbToHsl(0, 0, 0);
        expect(h).toBe(0);
        expect(s).toBe(0);
        expect(l).toBe(0);
    });

    it('白 (#ffffff) は h=0, s=0, l=1', () => {
        const { h, s, l } = rgbToHsl(1, 1, 1);
        expect(h).toBe(0);
        expect(s).toBe(0);
        expect(l).toBe(1);
    });

    it('グレー (#888888) は h=0, s=0, l=約0.533', () => {
        const v = 0x88 / 255;
        const { h, s, l } = rgbToHsl(v, v, v);
        expect(h).toBe(0);
        expect(s).toBe(0);
        expect(l).toBeCloseTo(v, 3);
    });

    it('赤 (#ff0000) は h=0, s=1, l=0.5', () => {
        const { h, s, l } = rgbToHsl(1, 0, 0);
        expect(h).toBe(0);
        expect(s).toBe(1);
        expect(l).toBe(0.5);
    });

    it('緑 (#00ff00) は h=1/3, s=1, l=0.5', () => {
        const { h, s, l } = rgbToHsl(0, 1, 0);
        expect(h).toBeCloseTo(1 / 3, 3);
        expect(s).toBe(1);
        expect(l).toBe(0.5);
    });

    it('青 (#0000ff) は h=2/3, s=1, l=0.5', () => {
        const { h, s, l } = rgbToHsl(0, 0, 1);
        expect(h).toBeCloseTo(2 / 3, 3);
        expect(s).toBe(1);
        expect(l).toBe(0.5);
    });
});
