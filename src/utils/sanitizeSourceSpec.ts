/**
 * SourceSpecification からundefined値のプロパティを除去する。
 * MapLibre GL JS はソース定義に undefined 値があるとバリデーションエラーを出すため、
 * ユーザー入力からソースを作成する際にこの関数でサニタイズする。
 */
export function sanitizeSourceSpec<T extends Record<string, unknown>>(source: T): T {
  const result = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as T;
}
