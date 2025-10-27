/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Paleta Mediterránea (de la imagen 1)
        robinEgg: '#A4CABC',
        nectar: '#EAB364',
        tuscanRed: '#B2473E',
        olive: '#ACBD78',
        // Paleta Café (de la imagen 2)
        slate: '#626D71',
        ceramic: '#CDCDC0',
        latte: '#DDBCA5',
        coffee: '#B38867',
        // Paleta Vintage (de la imagen 3)
        metal: '#6C5F5B',
        kraftPaper: '#CDAB81',
        newsprint: '#DAC3B3',
        pewter: '#4F4A45',
        // Paleta Moderna (de la imagen 4)
        darkAqua: '#488a99',
        gold: '#DBAE58',
        charcoal: '#FBE9E7',
        gray: '#B4B4B4',
      },
      fontFamily: {
        sans: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
