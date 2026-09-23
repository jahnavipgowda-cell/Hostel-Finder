import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// NOTE: this file previously lived at src/vite.config.js, where Vite never
// looks for it - so every `npm run dev` silently fell back to Vite's
// zero-config defaults (no React plugin, JSX left uncompiled). It now lives
// at the project root, which is where Vite expects to find it.
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // Forward API calls to the Spring Boot backend during development
            // so the frontend can simply call fetch("/api/...").
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
        },
    },
})
