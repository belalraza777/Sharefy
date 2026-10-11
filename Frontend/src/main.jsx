import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css';
import './styles/responsive.css';
import './styles/animations.css';
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './context/authContext';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true }); // Register the service worker[it will be registered immediately when the app loads]

createRoot(document.getElementById('root')).render(
  
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  
)
