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
          DEFAULT: '#F84464',
          dark: '#E03556',
        },
        navy: {
          DEFAULT: '#333545',
          light: '#404258',
        },
        ink: '#1F2533',
        muted: '#666C7A',
        border: '#E5E7EB',
        'page-bg': '#F5F5F5',
        card: '#FFFFFF',
        'seat-green': '#1EA83C',
        'time-green': '#4ABD5D',
        orange: '#FFA500',
        'sold-grey': '#DEDEDE',
        success: '#1EA83C',
        danger: '#D32F2F',
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.12)',
        hover: '0 6px 16px rgba(0, 0, 0, 0.16)',
        modal: '0 12px 32px rgba(0, 0, 0, 0.24)',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        full: '999px',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '16px',
          md: '24px',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1240px',
        },
      },
    },
  },
  plugins: [],
}
