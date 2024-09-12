import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Shops from './pages/Shops.tsx'
import './index.css'
import AuthProvider from './store/AuthContext.tsx'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import SignInComponent from "./components/SignIn.tsx";
import Items from "./pages/items.tsx";
import {InAppLayout} from "./layouts/InAppLayout.tsx";
import './i18n';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
          <AuthProvider>
              <Routes>
                  <Route path="/" element={<InAppLayout><Shops /></InAppLayout>}/>
                  <Route path="/items" element={<InAppLayout><Items /></InAppLayout>}/>
                  <Route path="/signin" element={<SignInComponent />}/>
              </Routes>
          </AuthProvider>
      </BrowserRouter>
  </StrictMode>,
)
