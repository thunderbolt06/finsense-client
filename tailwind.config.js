/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#161718', // rgb(22, 23, 24)
          800: '#1b1c1d', // rgb(27, 28, 29)
          100: '#8e8d89',  // rgb(142, 141, 137)
          50: '#ede9de',  // rgb(237, 233, 222)
          10: '#252628',  // rgb(37, 38, 40)
        },
      },
    },
  },
  plugins: [],
}

