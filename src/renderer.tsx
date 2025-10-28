import React from 'react';
import { createRoot } from 'react-dom/client';
import Login from './pages/auth/Login';
import './index.css';

const App = () => {
  return <Login />;
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(App));
} else {
  console.error('Root element not found');
}
