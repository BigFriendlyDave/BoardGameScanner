// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Set the alias '@' to point to the 'src' directory
    },
  },
});
// This configuration file sets up Vite for a React project, allowing for the use of an alias '@' to simplify imports from the 'src' directory.
// This is useful for cleaner and more maintainable code, especially in larger projects where relative paths can become cumbersome.
