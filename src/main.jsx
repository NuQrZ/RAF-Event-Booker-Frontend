import React from 'react'
import ReactDOM from 'react-dom/client'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'

const theme = { ...webLightTheme }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FluentProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FluentProvider>
  </React.StrictMode>
)
