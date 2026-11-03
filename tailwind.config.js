/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#0d3c22',
          950: '#072415',
        },
        warm: {
          50: '#fdfbf7',
          100: '#f8f5ee',
          200: '#efe9df',
          300: '#e1d7c7',
          400: '#c5b59e',
          500: '#9d8a70',
          800: '#342d25',
          900: '#1f1b16',
        },
        saffron: {
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(13, 60, 34, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'soft-md': '0 8px 24px rgba(13, 60, 34, 0.07), 0 2px 6px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 16px 36px rgba(13, 60, 34, 0.10), 0 4px 12px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}

