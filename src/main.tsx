import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Simple error handling for initial render
const renderApp = () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error("Root element not found");
      return;
    }
    
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error("Failed to render application:", error);
    
    // Fallback for critical rendering errors
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          color: white;
          text-align: center;
          padding: 20px;
        ">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Siksha AI</h1>
          <p>We encountered an issue loading the application.</p>
          <button 
            style="
              background: white;
              color: #6366f1;
              border: none;
              padding: 12px 24px;
              margin-top: 16px;
              border-radius: 8px;
              font-weight: bold;
              cursor: pointer;
            "
            onclick="window.location.reload()"
          >
            Reload Application
          </button>
        </div>
      `;
    }
  }
};

renderApp();
