import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import '@ant-design/v5-patch-for-react-19';
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://b623b7878054a7adfa7b4aeba46b172e@o526716.ingest.us.sentry.io/4509965885964288",
  sendDefaultPii: true
});

// LocalStorage管理
const RANDOM_KEY = 'user_random_id';
const FIRST_LOGIN_KEY = 'first_login_date';
const SESSION_COUNT_KEY = 'session_count';
const SESSION_START_KEY = 'session_start_time';

function getRandomString(length = 16) {
  return Math.random().toString(36).substring(2, 2 + length);
}

// 初回のみランダム文字列と初回ログイン日時を保存
if (!localStorage.getItem(RANDOM_KEY)) {
  localStorage.setItem(RANDOM_KEY, getRandomString());
}
if (!localStorage.getItem(FIRST_LOGIN_KEY)) {
  localStorage.setItem(FIRST_LOGIN_KEY, new Date().toISOString());
}

// セッション回数管理
const sessionCount = Number(localStorage.getItem(SESSION_COUNT_KEY) || '0') + 1;
localStorage.setItem(SESSION_COUNT_KEY, String(sessionCount));

// セッション開始時刻
localStorage.setItem(SESSION_START_KEY, String(Date.now()));

// セッション終了時にSentryへ送信
window.addEventListener('beforeunload', () => {
  const now = new Date();
  const startTimestamp = Number(localStorage.getItem(SESSION_START_KEY));
  const startDate = startTimestamp ? new Date(startTimestamp) : null;
  const duration = startTimestamp ? (now.getTime() - startTimestamp) / 1000 : 0;
  Sentry.captureMessage('session_info', {
    level: 'info',
    extra: {
      random_id: localStorage.getItem(RANDOM_KEY),
      first_login: localStorage.getItem(FIRST_LOGIN_KEY),
      session_count: localStorage.getItem(SESSION_COUNT_KEY),
      session_start_time: startDate ? startDate.toISOString() : '',
      session_end_time: now.toISOString(),
      session_duration_sec: duration
    }
  });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
