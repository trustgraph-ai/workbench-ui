import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react()
    ],
    server: {
        proxy: {
            '/api/socket': {
                 target: 'ws://localhost:8088/',
                 changeOrigin: true,
                 ws: true,
                 secure: false,
                 rewrite: () => "/api/v1/mux",
            },
        }
    }
})

