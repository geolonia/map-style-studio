import {
  extractSourceLayerIds,
  buildTileJsonUrls,
  fetchSourceLayers,
  TileJsonResponse,
} from '../../src/lib/fetchSourceLayers';

describe('extractSourceLayerIds', () => {
  test('TileJSON の vector_layers から id を抽出する', () => {
    const tileJson: TileJsonResponse = {
      vector_layers: [
        { id: 'water', fields: {} },
        { id: 'road', fields: {} },
        { id: 'building', fields: {} },
      ],
    };
    expect(extractSourceLayerIds(tileJson)).toEqual(['water', 'road', 'building']);
  });

  test('vector_layers が空配列の場合は空配列を返す', () => {
    expect(extractSourceLayerIds({ vector_layers: [] })).toEqual([]);
  });

  test('vector_layers がない場合は空配列を返す', () => {
    expect(extractSourceLayerIds({})).toEqual([]);
  });

  test('vector_layers が配列でない場合は空配列を返す', () => {
    expect(extractSourceLayerIds({ vector_layers: 'invalid' as unknown as TileJsonResponse['vector_layers'] })).toEqual([]);
  });

  test('id が空文字のレイヤーは除外する', () => {
    const tileJson: TileJsonResponse = {
      vector_layers: [
        { id: 'water', fields: {} },
        { id: '', fields: {} },
        { id: 'road', fields: {} },
      ],
    };
    expect(extractSourceLayerIds(tileJson)).toEqual(['water', 'road']);
  });
});

describe('buildTileJsonUrls', () => {
  test('JSON URL の場合はそのまま1つだけ返す', () => {
    const urls = buildTileJsonUrls('https://example.com/tiles.json');
    expect(urls).toEqual(['https://example.com/tiles.json']);
  });

  test('非 JSON URL の場合は元のURLと /tilejson.json 付きの2つを返す', () => {
    const urls = buildTileJsonUrls('https://example.com/tiles');
    expect(urls).toEqual([
      'https://example.com/tiles',
      'https://example.com/tiles/tilejson.json',
    ]);
  });

  test('末尾スラッシュ付きの場合はスラッシュを除去して /tilejson.json を付加する', () => {
    const urls = buildTileJsonUrls('https://example.com/tiles/');
    expect(urls).toEqual([
      'https://example.com/tiles/',
      'https://example.com/tiles/tilejson.json',
    ]);
  });

  test('空文字の場合は空配列を返す', () => {
    expect(buildTileJsonUrls('')).toEqual([]);
    expect(buildTileJsonUrls('  ')).toEqual([]);
  });
});

describe('fetchSourceLayers', () => {
  const mockTileJson: TileJsonResponse = {
    tilejson: '3.0.0',
    vector_layers: [
      { id: 'water', fields: {} },
      { id: 'road', fields: {} },
    ],
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('TileJSON URL から source-layer を取得できる', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTileJson),
    });

    const layers = await fetchSourceLayers('https://example.com/tiles.json');
    expect(layers).toEqual(['water', 'road']);
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/tiles.json');
  });

  test('最初のURLが失敗した場合、/tilejson.json を付加して再試行する', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTileJson),
      });

    const layers = await fetchSourceLayers('https://example.com/tiles');
    expect(layers).toEqual(['water', 'road']);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://example.com/tiles');
    expect(global.fetch).toHaveBeenNthCalledWith(2, 'https://example.com/tiles/tilejson.json');
  });

  test('最初のURLで vector_layers がない場合、次の候補を試行する', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ name: 'some other json' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTileJson),
      });

    const layers = await fetchSourceLayers('https://example.com/tiles');
    expect(layers).toEqual(['water', 'road']);
  });

  test('全ての候補が失敗した場合はエラーを投げる', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    await expect(fetchSourceLayers('https://example.com/tiles.json')).rejects.toThrow('Network error');
  });

  test('空の URL の場合はエラーを投げる', async () => {
    await expect(fetchSourceLayers('')).rejects.toThrow('URLが空です');
  });

  test('全候補で vector_layers が見つからない場合はエラーを投げる', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ name: 'no vector layers' }),
    });

    await expect(fetchSourceLayers('https://example.com/tiles.json')).rejects.toThrow('vector_layersが見つかりません');
  });
});
