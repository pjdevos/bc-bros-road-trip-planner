import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Remove the base path for Vercel
  // base: '/bc-bros-road-trip-planner/'
})