import React, { useState, useRef } from 'react';
import { Input, Button, Space, message, Typography, type InputRef } from 'antd';
import { useAtom } from 'jotai';
import { styleAtom } from '../../atom';
import { validateUrl } from '../../lib/validators';
import './StyleUrlLoader.css';

const { Text } = Typography;

const HISTORY_KEY = 'styleUrlHistory';

const getHistory = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
};
const setHistory = (history: string[]) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

type Props = {
  setLoadError: React.Dispatch<React.SetStateAction<boolean>>;
};

const StyleUrlLoader: React.FC<Props> = ({ setLoadError }) => {
  const [url, setUrl] = useState('');
  const [, setStyle] = useAtom(styleAtom);
  const [loading, setLoading] = useState(false);
  const [history, setHistoryState] = useState<string[]>(getHistory());
  const [historyVisible, setHistoryVisible] = useState(false);
  const [urlError, setUrlError] = useState<string | undefined>(undefined);
  const inputRef = useRef<InputRef>(null);

  const handleLoad = async () => {
    if (!url || url.trim() === '') {
      message.warning('URLを入力してください');
      setUrl('');
      setLoadError(true);
      return;
    }
    const urlResult = validateUrl(url.trim());
    if (!urlResult.valid) {
      setUrlError(urlResult.message);
      setLoadError(true);
      return;
    }
    if (!/\.json(\?.*)?$/i.test(url.trim())) {
      setUrlError('URLは .json で終わる必要があります');
      setLoadError(true);
      return;
    }
    setLoading(true);
    try {
      setStyle(url);
      setLoadError(false);
      const newHistory = [url, ...history.filter(u => u !== url)].slice(0, 10);
      setHistory(newHistory);
      setHistoryState(newHistory);
      message.success('style.jsonを読み込みました');
    } catch {
      setUrl('');
      setLoadError(true);
      message.error('style.jsonの読み込みに失敗しました');
    } finally {
      setUrl('');
      setLoading(false);
    }
  };

  const handleHistoryClick = (historyUrl: string) => {
    setUrl(historyUrl);
    setHistoryVisible(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (history.length > 0) setHistoryVisible(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setHistoryVisible(false), 150);
  };

  return (
    <div className="style-url-loader-root">
      <Space.Compact style={{ width: '100%' }}>
        <Input
          ref={inputRef}
          value={url}
          onChange={e => { setUrl(e.target.value); setUrlError(undefined); }}
          placeholder="URL指定でstyleを読み込む"
          disabled={loading}
          className="style-url-loader-input"
          style={{ height: 40 }}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          autoComplete="off"
          status={urlError ? 'error' : undefined}
        />
        <Button
          type="primary"
          onClick={handleLoad}
          loading={loading}
          style={{ height: 40 }}
        >
          読み込む
        </Button>
      </Space.Compact>
      {urlError && <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>{urlError}</Text>}
      {historyVisible && history.length > 0 && (
        <div className="style-url-loader-history-dropdown">
          {history.map((h, i) => (
            <div
              key={h}
              className={`style-url-loader-history-item${i === history.length - 1 ? ' last' : ''}`}
              onMouseDown={e => {
                e.preventDefault();
                handleHistoryClick(h);
              }}
            >
              {h}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StyleUrlLoader;
