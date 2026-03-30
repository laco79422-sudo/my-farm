import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { isKakaoInAppBrowser, KakaoInAppBlock } from './components/common/KakaoInAppBlock';
import './styles/global.css';

const root = document.getElementById('root')!;

createRoot(root).render(
  <StrictMode>
    {isKakaoInAppBrowser() ? <KakaoInAppBlock /> : <App />}
  </StrictMode>,
);
