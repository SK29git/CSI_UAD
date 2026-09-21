/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slateBg: '#f1f5f9',
        cardBg: '#ffffff',
      },
    },
  },
  plugins: [],
}
