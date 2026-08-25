import type { StyleSpecification } from 'maplibre-gl';
import { getAdjustedSaturation, hexToRgb, hslToRgb, numberToHex, rgbToHsl } from './colorHelpers';

/* --- 明度を調整する --- */
export function adjustBrightness(hex: string, brightness: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) { return hex; }
    const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    l = Math.min(1, Math.max(0, l + brightness / 200));
    // HSL→RGB
    let r1 = l, g1 = l, b1 = l;
    if (s !== 0) {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r1 = hue2rgb(p, q, h + 1 / 3);
      g1 = hue2rgb(p, q, h);
      b1 = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
}

/* --- 彩度を調整する --- */
export function adjustSaturation(hex: string, saturation: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) { return hex; }
    const { r, g, b } = rgb;

    // rgbToHsl は 0..1、getAdjustedSaturation は 0..255 を受け取る
    const { h, l } = rgbToHsl(r / 255, g / 255, b / 255);
    const adjustedSaturation = getAdjustedSaturation(r, g, b, saturation);
    const { r: r1, g: g1, b: b1 } = hslToRgb(h, adjustedSaturation, l);

    return `#${numberToHex(r1)}${numberToHex(g1)}${numberToHex(b1)}`;
}

// 明度のみ調整
export function adjustStyleBrightness(
  style: StyleSpecification,
  brightness: number
): StyleSpecification {

  const newLayers = style.layers?.map(layer => {
    if (!layer.paint) { return layer; }
    const paint = { ...layer.paint } as Record<string, unknown>;
    ['fill-color', 'line-color', 'background-color'].forEach(key => {
      const colorValue = paint[key];
      if (typeof colorValue === 'string' && /^#/.test(colorValue)) {
        paint[key] = adjustBrightness(colorValue, brightness);
      }
    });
    return { ...layer, paint } as typeof layer;
  });

  return {
    ...style,
    layers: newLayers ?? style.layers
  };
}


// 彩度のみ調整
export function adjustStyleSaturation(
  style: StyleSpecification,
  saturation: number
): StyleSpecification {

  const newLayers = style.layers?.map(layer => {
    if (!layer.paint) { return layer; }
    const paint = { ...layer.paint } as Record<string, unknown>;
    ['fill-color', 'line-color', 'background-color'].forEach(key => {
      const colorValue = paint[key];
      if (typeof colorValue === 'string' && /^#/.test(colorValue)) {
        paint[key] = adjustSaturation(colorValue, saturation);
      }
    });
    return { ...layer, paint } as typeof layer;
  });

  return {
    ...style,
    layers: newLayers ?? style.layers
  };
}
