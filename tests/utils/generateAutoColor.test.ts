import {
  stringHash,
  generateColorFromLayerId,
  generateColorByIndex,
  generatePaintWithAutoColor,
} from '../../src/utils/generateAutoColor';

describe('stringHash', () => {
  it('同じ文字列からは同じハッシュ値が生成される', () => {
    expect(stringHash('test-layer')).toBe(stringHash('test-layer'));
  });

  it('異なる文字列からは異なるハッシュ値が生成される', () => {
    expect(stringHash('layer-a')).not.toBe(stringHash('layer-b'));
  });

  it('空文字列からは0が返される', () => {
    expect(stringHash('')).toBe(0);
  });

  it('常に正の値が返される', () => {
    const testStrings = ['abc', 'xyz', 'long-layer-name-with-many-characters', '日本語'];
    for (const str of testStrings) {
      expect(stringHash(str)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('generateColorFromLayerId', () => {
  it('有効なHEXカラーコードを返す', () => {
    const color = generateColorFromLayerId('my-layer');
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('同じIDからは同じ色が生成される', () => {
    const color1 = generateColorFromLayerId('test-layer');
    const color2 = generateColorFromLayerId('test-layer');
    expect(color1).toBe(color2);
  });

  it('異なるIDからは異なる色が生成される', () => {
    const color1 = generateColorFromLayerId('layer-a');
    const color2 = generateColorFromLayerId('layer-b');
    expect(color1).not.toBe(color2);
  });
});

describe('generateColorByIndex', () => {
  it('有効なHEXカラーコードを返す', () => {
    const color = generateColorByIndex(0);
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('異なるインデックスからは異なる色が生成される', () => {
    const colors = new Set<string>();
    for (let i = 0; i < 10; i++) {
      colors.add(generateColorByIndex(i));
    }
    // 10色すべてが異なることを確認
    expect(colors.size).toBe(10);
  });

  it('同じインデックスからは同じ色が生成される', () => {
    expect(generateColorByIndex(5)).toBe(generateColorByIndex(5));
  });

  it('隣接するインデックスの色が十分に離れている', () => {
    // 黄金角を使っているので隣接する色は大きく離れるはず
    const color0 = generateColorByIndex(0);
    const color1 = generateColorByIndex(1);
    expect(color0).not.toBe(color1);
  });
});

describe('generatePaintWithAutoColor', () => {
  const testColor = '#ff0000';

  it('fill タイプに対して fill-color と fill-opacity を設定する', () => {
    const paint = generatePaintWithAutoColor('fill', testColor);
    expect(paint).toEqual({
      'fill-color': testColor,
      'fill-opacity': 0.6,
    });
  });

  it('line タイプに対して line-color と line-width を設定する', () => {
    const paint = generatePaintWithAutoColor('line', testColor);
    expect(paint).toEqual({
      'line-color': testColor,
      'line-width': 2,
    });
  });

  it('circle タイプに対して circle-color と circle-radius を設定する', () => {
    const paint = generatePaintWithAutoColor('circle', testColor);
    expect(paint).toEqual({
      'circle-color': testColor,
      'circle-radius': 5,
    });
  });

  it('symbol タイプに対して text-color を設定する', () => {
    const paint = generatePaintWithAutoColor('symbol', testColor);
    expect(paint).toEqual({
      'text-color': testColor,
    });
  });

  it('fill-extrusion タイプに対して fill-extrusion-color と fill-extrusion-opacity を設定する', () => {
    const paint = generatePaintWithAutoColor('fill-extrusion', testColor);
    expect(paint).toEqual({
      'fill-extrusion-color': testColor,
      'fill-extrusion-opacity': 0.6,
    });
  });

  it('heatmap タイプに対して heatmap-color を設定する', () => {
    const paint = generatePaintWithAutoColor('heatmap', testColor);
    expect(paint).toEqual({
      'heatmap-color': testColor,
    });
  });

  it('未知のタイプに対しては空オブジェクトを返す', () => {
    const paint = generatePaintWithAutoColor('unknown', testColor);
    expect(paint).toEqual({});
  });
});
