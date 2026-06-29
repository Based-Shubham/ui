import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Home from './routes/index' // This force-loads your main dashboard design directly
import './styles.css'

const rootElement = document.getElementById('root')!

if (rootElement) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <Home />
    </StrictMode>,
  )
}