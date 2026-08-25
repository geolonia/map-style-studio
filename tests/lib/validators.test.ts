import {
  validateCoordinates,
  validateGeojsonData,
  validateJson,
  validateOpacity,
  validateTileUrl,
  validateUrl,
  validateZoomLevel,
} from '../../src/lib/validators';

describe('validateUrl', () => {
  it('空文字は許可すること', () => {
    expect(validateUrl('').valid).toBe(true);
  });

  it('http/https のURLを許可すること', () => {
    expect(validateUrl('https://example.com/style.json').valid).toBe(true);
  });

  it('URLとして解釈できない値を拒否すること', () => {
    expect(validateUrl('   ').valid).toBe(false);
    expect(validateUrl('not a url').valid).toBe(false);
  });
});

describe('validateTileUrl', () => {
  it('http/https のタイルURLと mapbox:// を許可すること', () => {
    expect(validateTileUrl('https://example.com/{z}/{x}/{y}.pbf').valid).toBe(true);
    expect(validateTileUrl('mapbox://mapbox.mapbox-streets-v8').valid).toBe(true);
  });

  it('スキームだけでホストがないURLを拒否すること', () => {
    expect(validateTileUrl('https://').valid).toBe(false);
  });

  it('http/https/mapbox 以外のスキームを拒否すること', () => {
    expect(validateTileUrl('javascript://example.com').valid).toBe(false);
    expect(validateTileUrl('ftp://example.com/tiles').valid).toBe(false);
  });
});

describe('validateCoordinates', () => {
  it('経度,緯度の組を許可すること', () => {
    expect(validateCoordinates('139.767,35.681').valid).toBe(true);
  });

  it('経度または緯度が欠けている入力を拒否すること', () => {
    expect(validateCoordinates('139.767,').valid).toBe(false);
    expect(validateCoordinates(',35.681').valid).toBe(false);
  });

  it('範囲外の値を拒否すること', () => {
    expect(validateCoordinates('181,35').valid).toBe(false);
    expect(validateCoordinates('139,91').valid).toBe(false);
  });
});

describe('validateGeojsonData', () => {
  it('URL を許可すること', () => {
    expect(validateGeojsonData('https://example.com/data.geojson').valid).toBe(true);
  });

  it('インラインのGeoJSONオブジェクトを許可すること', () => {
    expect(validateGeojsonData('{"type":"FeatureCollection","features":[]}').valid).toBe(true);
  });

  it('URLでもJSONオブジェクトでもない値を拒否すること', () => {
    expect(validateGeojsonData('not a url').valid).toBe(false);
    expect(validateGeojsonData('[1,2,3]').valid).toBe(false);
  });
});

describe('validateJson', () => {
  it('オブジェクト・配列・null を許可すること', () => {
    expect(validateJson('{"a":1}').valid).toBe(true);
    expect(validateJson('[1]').valid).toBe(true);
    expect(validateJson('null').valid).toBe(true);
  });

  it('数値や文字列など object 以外を拒否すること', () => {
    expect(validateJson('1').valid).toBe(false);
    expect(validateJson('"a"').valid).toBe(false);
  });
});

describe('validateZoomLevel / validateOpacity', () => {
  it('範囲内の値を許可し範囲外を拒否すること', () => {
    expect(validateZoomLevel(0).valid).toBe(true);
    expect(validateZoomLevel(24).valid).toBe(true);
    expect(validateZoomLevel(25).valid).toBe(false);
    expect(validateOpacity(1).valid).toBe(true);
    expect(validateOpacity(1.1).valid).toBe(false);
  });
});
