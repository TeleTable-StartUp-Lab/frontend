/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#98FBCD',
        secondary: '#2D3748',
        accent: '#4FD1C5',
      }
    },
  },
  plugins: [],
}