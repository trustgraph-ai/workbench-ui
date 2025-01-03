import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider } from '@mui/material';

import App from './App.tsx'
import './index.css'
import { tgTheme } from './theme.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={tgTheme}>
            <CssBaseline enableColorScheme/>
            <App />
        </ThemeProvider>
    </StrictMode>,
)

