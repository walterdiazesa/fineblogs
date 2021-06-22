module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      lineHeight: {
        'citation': '3.3',
        '12': '3rem',
      },
      colors: {
        slatebluenav: '#5b46e2',
        slateblueinput: 'rgba(106, 90, 205, 1)',
        commentgrid: 'hsl(248, 53%, 56%)',
        commentgriddark: 'hsl(248, 53%, 54%)'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
