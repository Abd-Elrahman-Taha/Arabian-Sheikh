import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Remove stale order localStorage cache — all order data now comes from the API
try {
  localStorage.removeItem('arabian_sheikh_orders');
  localStorage.removeItem('arabian_sheikh_placed_order_ids');
  localStorage.removeItem('arabian_sheikh_last_order_update');
  localStorage.removeItem('arabian_sheikh_live_cloud_orders');
} catch {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
