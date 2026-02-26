/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FDF6F0',
          deep: '#F5EBE3',
          text: '#2C1810',
          muted: '#8C7A6E',
          accent: '#E8594F',
          'accent-hover': '#D14840',
          'accent-light': '#FFF0EE',
          border: '#EDE4DC',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
