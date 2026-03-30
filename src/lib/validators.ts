/**
 * 入力値バリデーションユーティリティ
 *
 * 各入力フィールドで共通的に使えるバリデーション関数群。
 * すべての関数は { valid, message? } を返す。
 */

export type ValidationResult = {
  valid: boolean;
  message?: string;
};

const ok = (): ValidationResult => ({ valid: true });
const ng = (message: string): ValidationResult => ({ valid: false, message });

/**
 * URL バリデーション
 * 空文字は許可（任意入力向け）。空白のみや無効な形式は拒否。
 */
export function validateUrl(value: string): ValidationResult {
  if (value === '') return ok();
  const trimmed = value.trim();
  if (trimmed === '') return ng('有効なURLを入力してください');
  try {
    new URL(trimmed);
    return ok();
  } catch {
    return ng('有効なURLを入力してください');
  }
}

/**
 * タイルURL バリデーション
 * 通常のURL形式に加え、mapbox:// プロトコルも許可する。
 */
export function validateTileUrl(value: string): ValidationResult {
  if (value === '') return ok();
  const trimmed = value.trim();
  if (trimmed === '') return ng('有効なURLを入力してください');
  // mapbox:// 等のカスタムプロトコルを許可
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    return ok();
  }
  return ng('有効なURLを入力してください');
}

/**
 * JSON バリデーション
 * 空文字と null は許可。パース後はオブジェクトまたは配列であること。
 */
export function validateJson(value: string): ValidationResult {
  if (value === '') return ok();
  try {
    const parsed = JSON.parse(value);
    if (parsed === null) return ok();
    if (typeof parsed !== 'object') {
      return ng('JSONはオブジェクトまたは配列である必要があります');
    }
    return ok();
  } catch {
    return ng('JSON の形式が正しくありません');
  }
}

/**
 * ズームレベル バリデーション (0-24)
 * undefined は許可（任意入力向け）。
 */
export function validateZoomLevel(value: number | undefined): ValidationResult {
  if (value === undefined) return ok();
  if (typeof value !== 'number' || isNaN(value)) {
    return ng('有効な数値を入力してください');
  }
  if (value < 0 || value > 24) {
    return ng('ズームレベルは0〜24の範囲で入力してください');
  }
  return ok();
}

/**
 * 座標 バリデーション (経度,緯度)
 * 空文字は許可。「経度,緯度」形式でそれぞれ範囲チェック。
 */
export function validateCoordinates(value: string): ValidationResult {
  if (value === '') return ok();
  const parts = value.split(',');
  if (parts.length !== 2) {
    return ng('「経度,緯度」の形式で入力してください');
  }
  const lng = Number(parts[0].trim());
  const lat = Number(parts[1].trim());
  if (isNaN(lng) || isNaN(lat)) {
    return ng('経度・緯度には数値を入力してください');
  }
  if (lng < -180 || lng > 180) {
    return ng('経度は-180〜180の範囲で入力してください');
  }
  if (lat < -90 || lat > 90) {
    return ng('緯度は-90〜90の範囲で入力してください');
  }
  return ok();
}

/**
 * ソースID バリデーション
 * 空文字・空白のみは拒否。
 */
export function validateSourceId(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return ng('ソース名を入力してください');
  }
  return ok();
}

/**
 * レイヤーID バリデーション
 * 空文字・空白のみは拒否。
 */
export function validateLayerId(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return ng('レイヤーIDを入力してください');
  }
  return ok();
}

/**
 * 不透明度 バリデーション (0-1)
 * undefined は許可。
 */
export function validateOpacity(value: number | undefined): ValidationResult {
  if (value === undefined) return ok();
  if (typeof value !== 'number' || isNaN(value)) {
    return ng('有効な数値を入力してください');
  }
  if (value < 0 || value > 1) {
    return ng('不透明度は0〜1の範囲で入力してください');
  }
  return ok();
}
