/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontSize: {
        '4x1': '2.5rem'
      },
      colors: {
        'primary': '#15181D',
        'headercolor': '#232735',
        'bodycolor': '#1C1F2A',
        'footercolor': '#242632',
        'cardcolor': '#262832',
        'greenstatus': '#19B03C',
        'redstatus': '#D31111',
        'yellowstatus': '#EBE014'
      }
    },
  },
  plugins: [],
}

