import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { isKakaoInAppBrowser, KakaoInAppBlock } from './components/common/KakaoInAppBlock';
import { registerServiceWorker } from './registerServiceWorker';
import './styles/global.css';

registerServiceWorker();

const root = document.getElementById('root')!;

createRoot(root).render(
  <StrictMode>
    {isKakaoInAppBrowser() ? <KakaoInAppBlock /> : <App />}
  </StrictMode>,
);
