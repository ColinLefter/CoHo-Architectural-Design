/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "templates/navbar.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      gridTemplateRows: {
        '[auto,auto,1fr]': 'auto auto 1fr',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography')]
}
