/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefdf5',
          100: '#d6f9e5',
          200: '#aef0cd',
          300: '#79e2b0',
          400: '#43cd8f',
          500: '#1fae73',
          600: '#138b5c',
          700: '#116f4c',
          800: '#12583f',
          900: '#114935',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
