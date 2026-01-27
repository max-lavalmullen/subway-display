/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NYC Subway line colors
        'subway-red': '#EE352E',      // 1, 2, 3
        'subway-green': '#00933C',    // 4, 5, 6
        'subway-purple': '#B933AD',   // 7
        'subway-blue': '#0039A6',     // A, C, E
        'subway-orange': '#FF6319',   // B, D, F, M
        'subway-yellow': '#FCCC0A',   // N, Q, R, W
        'subway-gray': '#A7A9AC',     // L, S
        'subway-lime': '#6CBE45',     // G
        'subway-brown': '#996633',    // J, Z
      }
    },
  },
  plugins: [],
}
