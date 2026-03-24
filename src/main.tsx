import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import DarkroomRitual from './designs/darkroom-ritual/index.tsx'
import ProcessingLineApp from './designs/processing-line/index.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/design/ritual" element={<DarkroomRitual />} />
        <Route path="/design/line" element={<ProcessingLineApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
