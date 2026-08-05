import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { registerServiceWorker } from './registerServiceWorker';
import { initializeAnalytics } from './services/analytics';

// 预渲染页面的 SEO 标签服务无 JavaScript 访问者；客户端启动后交给 Helmet 管理，避免重复。
document.head.querySelectorAll('[data-rh="true"]').forEach((element) => element.remove());

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

registerServiceWorker();
initializeAnalytics();
