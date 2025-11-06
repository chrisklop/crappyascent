import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// This check ensures the code only runs in a browser environment.
// The deployment process may attempt to execute this file on the server,
// where 'document' and 'window' are not available, causing a crash.
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
