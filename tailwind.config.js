/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js}',
            './public/**/*.{html,js}'],
  theme: {
    extend: {
      screens: {
        'custom': '200px', 
      },
    },
  },
  plugins: [],
}

