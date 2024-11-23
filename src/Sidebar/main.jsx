import React from 'react'
import ReactDOM from 'react-dom/client'
import {Sidebar} from './Sidebar.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('sidebar-root')).render(
  <React.StrictMode>
    <Sidebar />
  </React.StrictMode>,
)