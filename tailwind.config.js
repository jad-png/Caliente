/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'background-base': '#0a0a0a',
        'background-highlight': '#1a1a1a',
        'background-press': '#000000',
        'surface': '#121212',
        'surface-hover': '#2a2a2a',
        'accent': '#7c3aed', // Electric Violet
        'accent-hover': '#8b5cf6',
      }
    },
  },
  plugins: [],
}

