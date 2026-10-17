import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './home.css'

// 색 조합 미리보기용: ?theme=a
const t = new URLSearchParams(location.search).get('theme')
if (t) document.documentElement.dataset.theme = t

createRoot(document.getElementById('root')).render(<App />)
