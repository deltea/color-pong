/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts,svelte}"],
  theme: {
    extend: {
      fontFamily: {
        raleway: ["Raleway Variable"],
        sans: ["Montserrat Alternates"],
      },
      colors: {
        "background": "#222",
        "faded": "#3c3c3c",
      }
    },
  },
  plugins: [],
}

