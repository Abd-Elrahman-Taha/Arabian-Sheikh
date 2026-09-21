import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Cleanse any legacy order or payment data from storage — all order data comes strictly from API
try {
  localStorage.removeItem('arabian_sheikh_orders');
  localStorage.removeItem('arabian_sheikh_placed_order_ids');
  localStorage.removeItem('arabian_sheikh_last_order_update');
  localStorage.removeItem('arabian_sheikh_live_cloud_orders');
  sessionStorage.removeItem('arabian_sheikh_current_order');

  if (typeof sessionStorage !== 'undefined') {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k && (k.startsWith('arabian_sheikh_paid') || k.startsWith('arabian_sheikh_pay'))) {
        sessionStorage.removeItem(k);
      }
    }
  }
} catch {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
