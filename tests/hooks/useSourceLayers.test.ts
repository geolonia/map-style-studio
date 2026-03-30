import { renderHook, act } from '@testing-library/react';
import { useSourceLayers } from '../../src/hooks/useSourceLayers';

describe('useSourceLayers', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('初期状態では layers が空、loading が false、error が null', () => {
    const { result } = renderHook(() => useSourceLayers('https://example.com/tiles.json'));
    expect(result.current.layers).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('fetchLayers で TileJSON から source-layer を取得できる', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        vector_layers: [
          { id: 'water' },
          { id: 'road' },
        ],
      }),
    });

    const { result } = renderHook(() => useSourceLayers('https://example.com/tiles.json'));

    await act(async () => {
      await result.current.fetchLayers();
    });

    expect(result.current.layers).toEqual(['water', 'road']);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('取得失敗時に error がセットされる', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useSourceLayers('https://example.com/tiles.json'));

    await act(async () => {
      await result.current.fetchLayers();
    });

    expect(result.current.layers).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Network error');
  });

  test('空の URL の場合はエラーメッセージをセットする', async () => {
    const { result } = renderHook(() => useSourceLayers(''));

    await act(async () => {
      await result.current.fetchLayers();
    });

    expect(result.current.error).toBe('URLを入力してください');
    expect(result.current.loading).toBe(false);
  });
});
