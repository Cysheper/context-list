import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '^/(get_all_contexts|add_context|change_context|health)(?:\\?|$)': {
        target: 'http://127.0.0.1:8080',
      },
    },
  },
})
