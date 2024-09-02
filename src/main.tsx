import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './index.css'
import AuthProvider from './store/AuthContext.tsx'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import SignInComponent from "./components/SignIn.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
          <AuthProvider>
              <Routes>
                  <Route path="/" element={<App />}/>
                  <Route path="/signin" element={<SignInComponent />}/>
              </Routes>
          </AuthProvider>
      </BrowserRouter>
  </StrictMode>,
)
