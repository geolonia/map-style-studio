import { hslToRgb } from '../../src/utils/colorHelpers';

describe('hslToRgb', () => {
    it('黒 (h=0, s=0, l=0) は r=0, g=0, b=0', () => {
        const { r, g, b } = hslToRgb(0, 0, 0);
        expect(r).toBe(0);
        expect(g).toBe(0);
        expect(b).toBe(0);
    });

    it('白 (h=0, s=0, l=1) は r=1, g=1, b=1', () => {
        const { r, g, b } = hslToRgb(0, 0, 1);
        expect(r).toBe(1);
        expect(g).toBe(1);
        expect(b).toBe(1);
    });

    it('グレー (h=0, s=0, l=0.5) は r=0.5, g=0.5, b=0.5', () => {
        const { r, g, b } = hslToRgb(0, 0, 0.5);
        expect(r).toBeCloseTo(0.5, 3);
        expect(g).toBeCloseTo(0.5, 3);
        expect(b).toBeCloseTo(0.5, 3);
    });

    it('赤 (h=0, s=1, l=0.5) は r=1, g=0, b=0', () => {
        const { r, g, b } = hslToRgb(0, 1, 0.5);
        expect(r).toBeCloseTo(1, 3);
        expect(g).toBeCloseTo(0, 3);
        expect(b).toBeCloseTo(0, 3);
    });

    it('緑 (h=1/3, s=1, l=0.5) は r=0, g=1, b=0', () => {
        const { r, g, b } = hslToRgb(1 / 3, 1, 0.5);
        expect(r).toBeCloseTo(0, 3);
        expect(g).toBeCloseTo(1, 3);
        expect(b).toBeCloseTo(0, 3);
    });

    it('青 (h=2/3, s=1, l=0.5) は r=0, g=0, b=1', () => {
        const { r, g, b } = hslToRgb(2 / 3, 1, 0.5);
        expect(r).toBeCloseTo(0, 3);
        expect(g).toBeCloseTo(0, 3);
        expect(b).toBeCloseTo(1, 3);
    });
});
