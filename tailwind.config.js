/** @type {import('tailwindcss').Config} */
const flowbite = require("flowbite-react/tailwind");

export default {
  darkMode: ['class'],  // Enables both class-based and media-based dark mode
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content()],
  theme: {
    extend: {},
  },
  plugins: [flowbite.plugin()],
};
