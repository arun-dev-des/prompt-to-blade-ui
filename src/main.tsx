import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Blade ships its own font faces — load them so the type scale renders as designed.
import '@razorpay/blade/fonts.css';
import './index.css';

import App from './App';
import { initAnalytics } from './analytics';

initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
