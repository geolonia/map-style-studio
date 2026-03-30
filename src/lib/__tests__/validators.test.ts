import {
  validateUrl,
  validateTileUrl,
  validateJson,
  validateZoomLevel,
  validateCoordinates,
  validateSourceId,
  validateLayerId,
  validateOpacity,
  type ValidationResult,
} from '../validators';

// ヘルパー: 成功結果の検証
const expectValid = (result: ValidationResult) => {
  expect(result.valid).toBe(true);
  expect(result.message).toBeUndefined();
};

// ヘルパー: 失敗結果の検証
const expectInvalid = (result: ValidationResult, messagePart?: string) => {
  expect(result.valid).toBe(false);
  expect(result.message).toBeDefined();
  if (messagePart) {
    expect(result.message).toContain(messagePart);
  }
};

describe('validateUrl', () => {
  it('有効なHTTPS URLを受け入れる', () => {
    expectValid(validateUrl('https://example.com/style.json'));
  });

  it('有効なHTTP URLを受け入れる', () => {
    expectValid(validateUrl('http://example.com/tiles/{z}/{x}/{y}.pbf'));
  });

  it('空文字列を許可する（任意入力の場合）', () => {
    expectValid(validateUrl(''));
  });

  it('無効なURLを拒否する', () => {
    expectInvalid(validateUrl('not-a-url'), 'URL');
  });

  it('プロトコルなしのURLを拒否する', () => {
    expectInvalid(validateUrl('example.com/style.json'), 'URL');
  });

  it('空白のみの文字列を拒否する', () => {
    expectInvalid(validateUrl('   '), 'URL');
  });
});

describe('validateTileUrl', () => {
  it('有効なタイルURLを受け入れる', () => {
    expectValid(validateTileUrl('https://example.com/tiles/{z}/{x}/{y}.pbf'));
  });

  it('空文字列を許可する', () => {
    expectValid(validateTileUrl(''));
  });

  it('無効なURLを拒否する', () => {
    expectInvalid(validateTileUrl('not-a-url'), 'URL');
  });

  it('mapbox://プロトコルを受け入れる', () => {
    expectValid(validateTileUrl('mapbox://mapbox.mapbox-streets-v8'));
  });
});

describe('validateJson', () => {
  it('有効なJSONオブジェクトを受け入れる', () => {
    expectValid(validateJson('{"circle-color": "#ff0000"}'));
  });

  it('有効なJSON配列を受け入れる', () => {
    expectValid(validateJson('["==", "class", "A"]'));
  });

  it('空文字列を許可する', () => {
    expectValid(validateJson(''));
  });

  it('無効なJSONを拒否する', () => {
    expectInvalid(validateJson('{invalid json}'), 'JSON');
  });

  it('文字列のみのJSONを拒否する（オブジェクトか配列が必要）', () => {
    expectInvalid(validateJson('"just a string"'), 'オブジェクトまたは配列');
  });

  it('数値のみのJSONを拒否する', () => {
    expectInvalid(validateJson('42'), 'オブジェクトまたは配列');
  });

  it('nullを受け入れる（フィルタのリセット等）', () => {
    expectValid(validateJson('null'));
  });
});

describe('validateZoomLevel', () => {
  it('有効なズームレベル(0)を受け入れる', () => {
    expectValid(validateZoomLevel(0));
  });

  it('有効なズームレベル(24)を受け入れる', () => {
    expectValid(validateZoomLevel(24));
  });

  it('有効なズームレベル(10.5)を受け入れる', () => {
    expectValid(validateZoomLevel(10.5));
  });

  it('undefinedを許可する（任意入力）', () => {
    expectValid(validateZoomLevel(undefined));
  });

  it('負の値を拒否する', () => {
    expectInvalid(validateZoomLevel(-1), '0');
  });

  it('24を超える値を拒否する', () => {
    expectInvalid(validateZoomLevel(25), '24');
  });

  it('NaNを拒否する', () => {
    expectInvalid(validateZoomLevel(NaN), '数値');
  });
});

describe('validateCoordinates', () => {
  it('有効な座標を受け入れる', () => {
    expectValid(validateCoordinates('139.767,35.681'));
  });

  it('空文字列を許可する', () => {
    expectValid(validateCoordinates(''));
  });

  it('スペースを含む座標を受け入れる', () => {
    expectValid(validateCoordinates('139.767, 35.681'));
  });

  it('カンマが含まれない文字列を拒否する', () => {
    expectInvalid(validateCoordinates('139.767'), '経度,緯度');
  });

  it('数値でない値を拒否する', () => {
    expectInvalid(validateCoordinates('abc,def'), '数値');
  });

  it('経度の範囲外を拒否する', () => {
    expectInvalid(validateCoordinates('200,35'), '経度');
  });

  it('緯度の範囲外を拒否する', () => {
    expectInvalid(validateCoordinates('139,100'), '緯度');
  });
});

describe('validateSourceId', () => {
  it('有効なソースIDを受け入れる', () => {
    expectValid(validateSourceId('my-source'));
  });

  it('空文字列を拒否する', () => {
    expectInvalid(validateSourceId(''), 'ソース名');
  });

  it('空白のみを拒否する', () => {
    expectInvalid(validateSourceId('   '), 'ソース名');
  });
});

describe('validateLayerId', () => {
  it('有効なレイヤーIDを受け入れる', () => {
    expectValid(validateLayerId('my-layer'));
  });

  it('空文字列を拒否する', () => {
    expectInvalid(validateLayerId(''), 'レイヤーID');
  });

  it('空白のみを拒否する', () => {
    expectInvalid(validateLayerId('   '), 'レイヤーID');
  });
});

describe('validateOpacity', () => {
  it('有効な不透明度(0)を受け入れる', () => {
    expectValid(validateOpacity(0));
  });

  it('有効な不透明度(1)を受け入れる', () => {
    expectValid(validateOpacity(1));
  });

  it('有効な不透明度(0.5)を受け入れる', () => {
    expectValid(validateOpacity(0.5));
  });

  it('undefinedを許可する', () => {
    expectValid(validateOpacity(undefined));
  });

  it('負の値を拒否する', () => {
    expectInvalid(validateOpacity(-0.1), '0');
  });

  it('1を超える値を拒否する', () => {
    expectInvalid(validateOpacity(1.1), '1');
  });

  it('NaNを拒否する', () => {
    expectInvalid(validateOpacity(NaN), '数値');
  });
});
