import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { initTransitions } from '../shared/transition.js'
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import '@fontsource/black-han-sans/korean-400.css'
import '@fontsource/black-han-sans/latin-400.css'
import './home.css'

// 색 조합 미리보기용: ?theme=a
const t = new URLSearchParams(location.search).get('theme')
if (t) document.documentElement.dataset.theme = t

const fromTx = initTransitions()
createRoot(document.getElementById('root')).render(<App fromTx={fromTx} />)
