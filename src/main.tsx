import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import './style.css';
import { ToastContainer } from '@/utils/toasts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <ToastContainer />
  </React.StrictMode>,
);
