import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/custom.css'
import './styles/tailwind.css'
import { FormProvider } from './contexts/FormContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FormProvider>
          <App />
        </FormProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
