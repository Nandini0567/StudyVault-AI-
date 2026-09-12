/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#d6e0fd',
          300: '#b3c5fc',
          400: '#8aa2f8',
          500: '#637bf3',
          600: '#4f5eeb',
          700: '#3e48d3',
          800: '#343da9',
          900: '#2f3686',
          950: '#1b1e4e',
        }
      }
    },
  },
  plugins: [],
}
