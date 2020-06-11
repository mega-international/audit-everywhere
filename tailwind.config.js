module.exports = {
  important: true,
  theme: {
    extend: {
      minWidth: {
        '12': '3rem',
      },
      colors: {
        lightgrey: '#E9EAEF',
        grey: '#F9FAFA',
        warmgrey: '#FAFAFA',
        darkgrey: '#00000033',
        violet: '#C7D0F880',
        darkblue: '#22354B',
        green: '#31AC6E',
        'secondary-green': '#31B672',
        badge: '#4ee499',
        magenta: '#DA295C',
        lightblue: '#4AA4BA80',
        brown: '#343638',
        black: '#0C0C0C'
      },
      boxShadow: {
        header: '0 4px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        input: '0 20px 25px -1px rgba(199, 208, 248, 0.1), 0 10px 10px 5px rgba(199, 208, 248, 0.06)',
        nprogress: '0 0 10px #31AC6E, 0 0 5px #31AC6E'
      },
      fontFamily: {
        montserrat: [ 'Montserrat', 'sans-serif' ],
        'montserrat-light': [ 'Montserrat-light', 'sans-serif' ]
      }
    }
  },
  variants: {
    height: [ 'responsive', 'hover', 'focus' ],
    borderWidth: [ 'last' ]
  },
  plugins: [],
  purge: false 
};
