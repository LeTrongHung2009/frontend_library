import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom' // Quan trọng

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* Bắt buộc phải có cái này web mới chạy */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)