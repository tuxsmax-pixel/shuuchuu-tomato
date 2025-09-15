/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        rounded: ['"Hiragino Maru Gothic ProN"', '"Yu Gothic"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
