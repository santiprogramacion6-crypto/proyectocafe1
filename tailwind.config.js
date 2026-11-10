/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cafeClasico: '#5D4037',
        cafeFrio: '#0288D1',
        mostrador: '#F48FB1',
        desayuno: '#F57C00',
        cocina: '#D32F2F',
      },
    },
  },
  plugins: [],
}