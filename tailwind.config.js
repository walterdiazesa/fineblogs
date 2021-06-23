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
        commentgriddark: 'hsl(248, 52%, 54%)',/* sl(248, 53%, 54%) */
        commentgridextradark: 'hsl(248, 80%, 58%)'/* hsl(248, 53%, 52%) */
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
