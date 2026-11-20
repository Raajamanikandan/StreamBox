/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blue-prime': '#00A8E1',
        'blue-bright': '#0779FF',
        'blue-dodger': '#0078F8',
        'blue-royal': '#177BCE',
        'bg-base': '#0F171E',
        'bg-deep': '#121212',
        'bg-surface': '#232F3E',
        'text-primary': '#FFFFFF',
        'text-muted': '#B6BDC6',
        'error': '#FF5A5F',
        'success': '#3DDC97',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      borderRadius: {
        DEFAULT: '0.5rem', // rounded-lg
      }
    },
  },
  plugins: [],
}
