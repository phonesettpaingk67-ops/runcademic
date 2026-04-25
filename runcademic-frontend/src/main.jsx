import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('main.jsx loading...');
const root = document.getElementById('root');
console.log('Root element:', root);

if (!root) {
  console.error('Root element #root not found!');
  // Fallback - create it if missing
  const fallbackRoot = document.createElement('div');
  fallbackRoot.id = 'root';
  fallbackRoot.style.cssText = 'width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;font-size:24px;background:#fff;color:#333;';
  fallbackRoot.textContent = 'Root element missing!';
  document.body.appendChild(fallbackRoot);
} else {
  console.log('Mounting React app...');
  try {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    console.log('React app mounted successfully');
  } catch (error) {
    console.error('Error mounting React app:', error);
    root.innerHTML = `<div style="padding:20px;background:#fee;color:#c33;font-family:monospace;white-space:pre-wrap;">Error: ${error.message}\n\n${error.stack}</div>`;
  }
}
