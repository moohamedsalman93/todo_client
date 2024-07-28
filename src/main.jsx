import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from '@material-tailwind/react'
import { Toaster } from 'react-hot-toast'
import { LoadingProvider } from './utils/LoadingContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LoadingProvider>
        <App />
      </LoadingProvider>
      <Toaster toastOptions={{
        style: {
          zIndex: 100000, // Set this to a higher value if needed
        },
      }} />

    </ThemeProvider>
  </React.StrictMode>,
)
