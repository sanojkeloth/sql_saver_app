/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./popup.html",
    "./sidepanel.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f0ff',
          100: '#e5e5ff',
          200: '#d0d0ff',
          300: '#b0b0ff',
          400: '#8a8aff',
          500: '#5b5fff',
          600: '#4a4adb',
          700: '#3939b7',
          800: '#2d2d93',
          900: '#252570',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
