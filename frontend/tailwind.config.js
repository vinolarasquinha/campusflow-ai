/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#090A0F',
          deep: '#030406',
          card: '#12131C',
        },
        brand: {
          cyan: '#00F2FE',
          blue: '#4FACFE',
          purple: '#7F00FF',
          magenta: '#E100FF',
        },
        glass: {
          bg: 'rgba(18, 20, 29, 0.65)',
          border: 'rgba(255, 255, 255, 0.06)',
          hover: 'rgba(255, 255, 255, 0.1)',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 242, 254, 0.25)',
        'glow-purple': '0 0 20px rgba(127, 0, 255, 0.25)',
        'glass-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
