import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for PWA and Android WebAPK installation
if ('serviceWorker' in navigator) {
  try {
    registerSW({
      immediate: true,
      onRegisterError(error) {
        console.warn('PWA service worker registration skipped in sandbox mode:', error?.message || error);
      },
    });
  } catch {
    // Ignore in unsupported environments
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
