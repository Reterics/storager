import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './index.css'
import AuthProvider from './store/AuthContext.tsx'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import SignInComponent from "./components/SignIn.tsx";
import Items from "./pages/items.tsx";
import {InAppLayout} from "./layouts/InAppLayout.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
          <AuthProvider>
              <Routes>
                  <Route path="/" element={<InAppLayout><App /></InAppLayout>}/>
                  <Route path="/items" element={<InAppLayout><Items /></InAppLayout>}/>
                  <Route path="/signin" element={<SignInComponent />}/>
              </Routes>
          </AuthProvider>
      </BrowserRouter>
  </StrictMode>,
)
