import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App/App.jsx'
import './index.css'
import {BookmarksProvider} from "@/App/context/BookmarksContext.jsx";
import {ThemeProvider} from "@/App/context/ThemeContext.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider>
            <BookmarksProvider>
                <App/>
            </BookmarksProvider>
        </ThemeProvider>
    </React.StrictMode>,
)