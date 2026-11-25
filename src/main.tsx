import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Guard against recursive iframe nesting
if (window.self !== window.top) {
  // If Vite's SPA fallback serves index.html inside a preview iframe, halt editor execution
  console.warn('Prevented recursive iframe embedding of editor shell.');
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#030712;color:#94a3b8;font-family:sans-serif;"><div>Loading interactive preview...</div></div>';
  }
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

