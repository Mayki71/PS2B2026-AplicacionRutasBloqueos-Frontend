import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import './modules/auth/styles/index.css'
// import App from './App.tsx'
import LandingPage  from './pages/auth/LandingPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <LandingPage />
  </StrictMode>,
)
