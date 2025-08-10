import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AuthProvider from './store/AuthContext.tsx';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import { ThemeProvider } from './store/ThemeContext.tsx';
import { ShopProvider } from './store/ShopContext.tsx';
import QueryRouter from './router.tsx';

const baseName = import.meta.env.DEV
  ? '/'
  : import.meta.env.VITE_BASENAME || '/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={baseName}>
      <AuthProvider>
        <ThemeProvider>
          <ShopProvider>
            <div className="w-full h-full m-auto flex flex-col text-black dark:text-white bg-[#ebebeb] dark:bg-black flex-1 min-h-svh">
              <QueryRouter />
            </div>
          </ShopProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
