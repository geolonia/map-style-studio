import { hslToHex } from './colorHelpers';

/**
 * 文字列からハッシュ値を生成する（maplibre-gl-inspect のアプローチに基づく）
 * 同じ文字列からは常に同じハッシュが生成される
 */
export function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * レイヤーIDからユニークなカラーを生成する
 * ハッシュベースで色相を決定し、彩度・明度を固定して見やすい色を生成する
 */
export function generateColorFromLayerId(layerId: string): string {
  const hash = stringHash(layerId);
  const hue = hash % 360;
  const saturation = 0.7;
  const lightness = 0.5;
  return hslToHex(hue, saturation, lightness);
}

/**
 * インデックスベースで色を生成する（既存レイヤー数に基づく）
 * 黄金角（~137.5度）を使って色相を均等に分散させる
 */
export function generateColorByIndex(index: number): string {
  const goldenAngle = 137.508;
  const hue = (index * goldenAngle) % 360;
  const saturation = 0.65;
  const lightness = 0.5;
  return hslToHex(hue, saturation, lightness);
}

/**
 * レイヤータイプに応じた paint プロパティに色を設定する
 */
export function generatePaintWithAutoColor(
  layerType: string,
  color: string
): Record<string, unknown> {
  switch (layerType) {
    case 'fill':
      return {
        'fill-color': color,
        'fill-opacity': 0.6,
      };
    case 'line':
      return {
        'line-color': color,
        'line-width': 2,
      };
    case 'circle':
      return {
        'circle-color': color,
        'circle-radius': 5,
      };
    case 'symbol':
      return {
        'text-color': color,
      };
    case 'fill-extrusion':
      return {
        'fill-extrusion-color': color,
        'fill-extrusion-opacity': 0.6,
      };
    case 'heatmap':
      return {
        'heatmap-color': color,
      };
    default:
      return {};
  }
}
