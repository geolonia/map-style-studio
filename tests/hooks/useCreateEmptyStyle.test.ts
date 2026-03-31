import { renderHook } from '@testing-library/react';
import { useCreateEmptyStyle } from '../../src/hooks/useCreateEmptyStyle';

describe('useCreateEmptyStyle', () => {
  it('空のstyle.jsonを返す', () => {
    const { result } = renderHook(() => useCreateEmptyStyle());
    const emptyStyle = result.current.emptyStyle;

    expect(emptyStyle).toMatchObject({
      version: 8,
      name: 'New Style',
      sources: {},
      layers: [],
      sprite: '',
      glyphs: '',
    });
  });
});
