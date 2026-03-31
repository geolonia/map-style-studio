import { useState, useCallback } from "react";
import { fetchSourceLayers } from "../lib/fetchSourceLayers";

export function useSourceLayers(url: string) {
  const [loading, setLoading] = useState(false);
  const [layers, setLayers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchLayers = useCallback(async () => {
    if (!url.trim()) {
      setError('URLを入力してください');
      return;
    }
    setLoading(true);
    setError(null);
    setLayers([]);
    try {
      const result = await fetchSourceLayers(url);
      setLayers(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : `取得に失敗しました: ${e}`);
    }
    setLoading(false);
  }, [url]);

  return { layers, loading, error, fetchLayers };
}
