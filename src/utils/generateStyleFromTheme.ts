import type { StyleSpecification, LayerSpecification } from "maplibre-gl";
import { hexToHsl, hslToHex, rgbaToHex } from "./colorHelpers";

export type ThemeColorsType = {
    primary: string;
    secondary?: string;
    tertiary?: string;
};

// レイヤー名から種別を推測
export function guessLayerType(layer: LayerSpecification): "building" | "road" | "background" | "other" {
  const id = layer.id.toLowerCase();
  if (id.includes("building") || id.includes("建物")) return "building";
  if (id.includes("road") || id.includes("highway") || id.includes("道路")) return "road";
  if (id.includes("background") || id.includes("bg") || id.includes("背景")) return "background";
  return "other";
}

// 色をテーマに置換
export function getThemeColor(type: "building" | "road" | "background" | "other", theme: ThemeColorsType) {
  if (type === "building") return theme.primary;
  if (type === "road") return theme.secondary || theme.primary;
  if (type === "background") return theme.tertiary || theme.secondary || theme.primary;
  return theme.primary;
}

// "fill-color"・"line-color"・"background-color" の値を置換
export function replaceColorValue(value: unknown, themeColor: string): unknown {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    let color = value;
    // rgb/rgba形式ならhexに変換
    if (/^rgba?\(/.test(color)) {
      color = rgbaToHex(color);
    }
    // HEXやrgb/rgba/hsl/hslaならテーマカラーに置換
    if (
      /^#([0-9a-f]{3,8})$/i.test(color) ||
      /^rgba?\(/.test(color) ||
      /^hsla?\(/.test(color)
    ) {
      return themeColor;
    }
    // rgb/rgba形式だった場合はhexに変換して返す
    if (/^#([0-9a-f]{3,8})$/i.test(color)) {
      return color;
    }
  }
  return value;
}


// sRGBの相対輝度を計算
export function getLuminance(hex: string): number {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  // sRGB → 線形RGB
  const toLinear = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  // 輝度計算
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// テーマカラー配列から一番明るい色を取得
export function getBrightestColor(theme: ThemeColorsType): string {
  const colors = [theme.primary, theme.secondary, theme.tertiary].filter((c): c is string => !!c);
  if (colors.length === 0) { return "#ffffff"; }
  let brightest = colors[0];
  let maxLum = -1;
  for (const color of colors) {
    const lum = getLuminance(rgbaToHex(color));
    if (lum > maxLum) {
      maxLum = lum;
      brightest = color;
    }
  }
  return brightest;
}


export function getBackgroundColor(hex: string): string {
  const [h, s, l] = hexToHsl(hex);
  const newL = Math.min(0.93, l + 0.18); // 明度のみ上げる
  return hslToHex(h, s, newL);
}

export const generateStyleFromTheme = async (theme: ThemeColorsType, originalStyle: StyleSpecification) => {
  const newStyle: StyleSpecification = JSON.parse(JSON.stringify(originalStyle));

  // 背景色用に一番明るい色を取得し、明度のみ調整（彩度はそのまま）
  const brightest = getBrightestColor(theme);
  const backgroundColor = getBackgroundColor(rgbaToHex(brightest));

  newStyle.layers = newStyle.layers.map(layer => {
    const type = guessLayerType(layer);
    const themeColor = getThemeColor(type, theme);

    const paint = { ...layer.paint } as Record<string, unknown>;

    if (layer.type === "background") {
      paint["background-color"] = backgroundColor;
    } else {
      ["fill-color", "line-color", "background-color"].forEach(key => {
        if (paint && paint[key] !== undefined) {
          paint[key] = replaceColorValue(paint[key], themeColor);
        }
      });
    }

    const layout = layer.layout === undefined ? {} : layer.layout;
    return { ...layer, paint, layout };
  });

  return newStyle;
};
