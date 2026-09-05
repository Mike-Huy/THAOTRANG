/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tahoma', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#008200',
          light: '#e6f3e6',
          dark: '#006400',
          hover: '#00a300',
        }
      }
    },
  },
  plugins: [],
}
