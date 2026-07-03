/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f4f6f7',
          100: '#e4e9eb',
          200: '#c7d1d5',
          300: '#9fadb3',
          400: '#71838b',
          500: '#54666e',
          600: '#42525a',
          700: '#36434a',
          800: '#2d383e',
          900: '#212a2f',
          950: '#141a1d',
        },
        brand: {
          50: '#eefbf7',
          100: '#d6f5eb',
          200: '#aeebd8',
          300: '#79dabf',
          400: '#43bfa0',
          500: '#22a082',
          600: '#158068',
          700: '#146555',
          800: '#145045',
          900: '#12423a',
        },
        clay: {
          400: '#e2a45a',
          500: '#d68b3a',
          600: '#c07128',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(20, 26, 29, 0.04), 0 8px 24px -12px rgba(20, 26, 29, 0.12)',
      },
    },
  },
  plugins: [],
}

