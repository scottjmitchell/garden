import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          DEFAULT: '#C8922A',
        },
        moss: {
          DEFAULT: '#3D5239',
        },
        garden: {
          bg: '#111410',
          text: '#EDE8DC',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['Jost', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
