import { sanitizeSourceSpec } from '../../src/utils/sanitizeSourceSpec';

describe('sanitizeSourceSpec', () => {
  test('undefined値のプロパティを除去する', () => {
    const input = {
      type: 'raster' as const,
      tiles: ['https://example.com/{z}/{x}/{y}.png'],
      minzoom: undefined,
      maxzoom: undefined,
    };
    const result = sanitizeSourceSpec(input);
    expect(result).toEqual({
      type: 'raster',
      tiles: ['https://example.com/{z}/{x}/{y}.png'],
    });
    expect('minzoom' in result).toBe(false);
    expect('maxzoom' in result).toBe(false);
  });

  test('数値が指定されている場合はそのまま保持する', () => {
    const input = {
      type: 'raster' as const,
      tiles: ['https://example.com/{z}/{x}/{y}.png'],
      minzoom: 0,
      maxzoom: 22,
    };
    const result = sanitizeSourceSpec(input);
    expect(result).toEqual({
      type: 'raster',
      tiles: ['https://example.com/{z}/{x}/{y}.png'],
      minzoom: 0,
      maxzoom: 22,
    });
  });

  test('すべての値が定義されている場合は変更しない', () => {
    const input = {
      type: 'vector' as const,
      url: 'https://example.com/tiles.json',
      attribution: '&copy; Test',
    };
    const result = sanitizeSourceSpec(input);
    expect(result).toEqual(input);
  });

  test('空文字列やnullは除去しない（undefinedのみ除去）', () => {
    const input = {
      type: 'raster' as const,
      url: '',
      attribution: null,
      minzoom: undefined,
    };
    const result = sanitizeSourceSpec(input);
    expect(result).toEqual({
      type: 'raster',
      url: '',
      attribution: null,
    });
    expect('attribution' in result).toBe(true);
    expect('minzoom' in result).toBe(false);
  });
});
