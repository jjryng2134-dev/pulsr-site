import { initTransitions } from '../shared/transition.js'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './clinic.css'

createRoot(document.getElementById('root')).render(<App />)
initTransitions()
