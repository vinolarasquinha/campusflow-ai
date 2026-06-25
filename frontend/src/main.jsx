import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StudentProvider } from './context/StudentContext';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <StudentProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#12131C',
              color: '#D1D5DB',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
            },
          }}
        />
      </StudentProvider>
    </BrowserRouter>
  </React.StrictMode>
);
