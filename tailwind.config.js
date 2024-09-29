/** @type {import('tailwindcss').Config} */
const flowbite = require("flowbite-react/tailwind");
export default {
  darkMode:'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}",flowbite.content()  ],
  theme: {
    extend: {},
  },
  plugins: [    flowbite.plugin()],
}