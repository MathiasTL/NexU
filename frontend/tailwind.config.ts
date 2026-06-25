import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FEF3EA',
          100: '#FDE7D5',
          200: '#FBCAA6',
          300: '#F8A87A',
          400: '#F09050',
          500: '#E8813A',
          600: '#C96920',
          700: '#A5500F',
          800: '#7C3C08',
          900: '#5C2C04',
          DEFAULT: '#E8813A',
        },
        secondary: {
          50:  '#EEF3FC',
          100: '#DAE5F8',
          200: '#B2C8EF',
          300: '#7EA2DC',
          400: '#4A7BC3',
          500: '#2A5CA3',
          600: '#1A3C6E',
          700: '#0F2447',
          800: '#091830',
          900: '#050F1E',
          DEFAULT: '#1A3C6E',
        },
        success: { DEFAULT: '#16A34A', bg: '#F0FDF4', text: '#15803D' },
        warning: { DEFAULT: '#F59E0B', bg: '#FFFBEB', text: '#B45309' },
        danger:  { DEFAULT: '#DC2626', bg: '#FEF2F2', text: '#B91C1C' },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
