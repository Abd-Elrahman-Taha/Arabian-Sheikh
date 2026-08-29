import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Clear all old mock/stale product catalog keys from localStorage across all devices
try {
  ['arabian_sheikh_cached_catalog_v2', 'arabian_sheikh_live_cloud_state_v1', 'arabian_sheikh_live_cloud_state_v2', 'arabian_sheikh_live_cloud_state_v3', 'arabian_sheikh_products'].forEach(k => {
    localStorage.removeItem(k);
  });
} catch {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
