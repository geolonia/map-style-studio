/**
 * TileJSON レスポンスから vector_layers の id を抽出するユーティリティ
 */

export type TileJsonResponse = {
  vector_layers?: { id: string; [key: string]: unknown }[];
  [key: string]: unknown;
};

/**
 * TileJSON レスポンスから source-layer の ID 一覧を抽出する
 */
export function extractSourceLayerIds(tileJson: TileJsonResponse): string[] {
  if (!tileJson.vector_layers || !Array.isArray(tileJson.vector_layers)) {
    return [];
  }
  return tileJson.vector_layers
    .map((layer) => layer.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
}

/**
 * タイル URL を正規化して TileJSON エンドポイントの候補を返す
 * - URL がそのまま TileJSON を返す場合がある
 * - URL に /tilejson.json を付加して TileJSON を返す場合がある
 */
export function buildTileJsonUrls(url: string): string[] {
  const trimmed = url.trim();
  if (!trimmed) return [];

  const urls: string[] = [trimmed];

  // 末尾が .json でなければ /tilejson.json を追加した候補も返す
  if (!trimmed.endsWith('.json')) {
    const base = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
    urls.push(`${base}/tilejson.json`);
  }

  return urls;
}

/**
 * タイル URL から source-layer の一覧を取得する
 * 複数の URL 候補を順番に試行し、最初に成功したものを返す
 */
export async function fetchSourceLayers(url: string): Promise<string[]> {
  const urls = buildTileJsonUrls(url);
  if (urls.length === 0) {
    throw new Error('URLが空です');
  }

  let lastError: Error | null = null;

  for (const candidateUrl of urls) {
    try {
      const res = await fetch(candidateUrl);
      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status}: ${res.statusText}`);
        continue;
      }
      const data: TileJsonResponse = await res.json();
      const layers = extractSourceLayerIds(data);
      if (layers.length > 0) {
        return layers;
      }
      lastError = new Error('vector_layersが見つかりません');
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  throw lastError ?? new Error('source-layerの取得に失敗しました');
}
