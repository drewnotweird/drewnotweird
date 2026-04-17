import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'

// Inject TrimPoster font with correct base URL
const style = document.createElement('style')
style.textContent = `
  @font-face {
    font-family: "trimPosterCompressed";
    src: url("${import.meta.env.BASE_URL}fonts/TrimPosterWeb-Compressed.woff") format("woff"),
         url("${import.meta.env.BASE_URL}fonts/TrimPosterWeb-Compressed.ttf") format("truetype");
    font-weight: 400;
  }
`
document.head.appendChild(style)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
