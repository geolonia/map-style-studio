/********** 
 * 変換
 **********/ 


// 16進カラーコード (#RGB / #RRGGBB) → {r,g,b} へ
export function hexToRgb(hex: string) {
  const body = hex.replace('#', '');
  // 3桁は各桁を2回繰り返した6桁と同じ色を指す
  const normalized = /^[a-f\d]{3}$/i.test(body)
    ? body.split('').map(x => x + x).join('')
    : body;
  const match = normalized.match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

// RGB→HSV変換（色相で色を判定しやすくする）
export function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, v };
}

// ユーティリティ: rgba()→HEX変換
export function rgbaToHex(rgba: string): string {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return rgba;
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  const a = match[4] !== undefined ? Math.round(Number(match[4]) * 255) : 255;
  return (
    "#" +
    [r, g, b, a]
      .map(x => x.toString(16).padStart(2, "0"))
      .join("")
      .replace(/ff$/, "") // アルファがffなら省略
  );
}

// ユーティリティ: HEXカラーの明度・彩度を調整
export function hexToHsl(hex: string): [number, number, number] {
  if (!hex || typeof hex !== "string" || !/^#?[0-9a-fA-F]{3,8}$/.test(hex)) {
    // デフォルト: 白
    return [0, 0, 1];
  }
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
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
  return [h * 360, s, l];
}

export function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
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
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return (
    '#' +
    [r, g, b]
      .map(x => Math.round(x * 255).toString(16).padStart(2, '0'))
      .join('')
  );
}

// RGB → HSLへ
export function rgbToHsl(r: number, g: number, b: number): { h: number, s: number, l: number } {
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
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
    return { h, s, l };
}

// HSL → RGB 変換
export function hslToRgb(h: number, s: number, l: number): { r: number, g: number, b: number } {
  let r = l, g = l, b = l;
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
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r, g, b };
}

// Number → HEX変換
export function numberToHex(x: number) {
  const hex = Math.round(x * 255).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}


/********** 
 * 色名判定
 **********/ 

// 緑の色(相範囲は約60〜180度）
export function isGreenColor(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const { h, s, v } = rgbToHsv(rgb.r, rgb.g, rgb.b);
  return h >= 60 && h <= 180 && s > 0.2 && v > 0.2;
}

// 赤の色(色相範囲は約0〜20度、340〜360度)
export function isRedColor(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const { h, s, v } = rgbToHsv(rgb.r, rgb.g, rgb.b);
  return ((h >= 0 && h <= 20) || (h >= 340 && h <= 360)) && s > 0.2 && v > 0.2;
}

// 黄色の色(色相範囲は約40〜70度)
export function isYellowColor(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const { h, s, v } = rgbToHsv(rgb.r, rgb.g, rgb.b);
  return h >= 40 && h <= 70 && s > 0.2 && v > 0.2;
}

// 青の色(色相範囲は約200〜260度)
export function isBlueColor(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const { h, s, v } = rgbToHsv(rgb.r, rgb.g, rgb.b);
  return h >= 200 && h <= 260 && s > 0.2 && v > 0.2;
}

// 茶色の色(色相範囲は約20〜50度、明度0.7未満)
export function isBrownColor(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const { h, s, v } = rgbToHsv(rgb.r, rgb.g, rgb.b);
  // 茶色は黄〜赤寄りで暗め
  return h >= 20 && h <= 50 && s > 0.2 && v < 0.7;
}

// 黒の色(明度0.2未満)
export function isBlackColor(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const { v } = rgbToHsv(rgb.r, rgb.g, rgb.b);
  return v < 0.2;
}

// 白の色(彩度0.1未満、明度0.9以上)
export function isWhiteColor(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const { s, v } = rgbToHsv(rgb.r, rgb.g, rgb.b);
  return s < 0.1 && v > 0.9;
}


/********** 
 * 計算
 **********/

// RGB値から彩度（Saturation）を計算し、指定した範囲で調整した値を返す
export function getAdjustedSaturation(
  r: number,
  g: number,
  b: number,
  saturation: number,
  range: number = 20
): number {
  // 0〜1に正規化
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  // 無彩色は色相を持たないため、彩度を上げても灰色のままとする
  if (max === min) { return 0; }
  const d = max - min;
  const l = (max + min) / 2;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  // saturation値で調整し、0〜1にクリップ
  return Math.min(1, Math.max(0, s + saturation / range));
}