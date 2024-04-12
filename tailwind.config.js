/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/*/**.{html,js,ts,svelte}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat Alternates"],
      },
      colors: {
        "background": "#222",
        "faded": "#888",
      }
    },
  },
  plugins: [],
}

