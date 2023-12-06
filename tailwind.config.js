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
      fontFamily: {
        garamond: ['Garamond', 'serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography')]
}
