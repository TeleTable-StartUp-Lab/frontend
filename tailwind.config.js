/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00F0FF', // Neon Cyan
          hover: '#00D6E6',
          dim: 'rgba(0, 240, 255, 0.1)',
        },
        secondary: {
          DEFAULT: '#7000FF', // Neon Purple
          hover: '#5C00D1',
        },
        dark: {
          900: '#050505', // Almost black
          800: '#0A0A0A', // Very dark gray
          700: '#121212', // Dark gray
          card: 'rgba(18, 18, 18, 0.6)',
        },
        light: {
          100: '#FFFFFF',
          200: '#E2E8F0',
          300: '#CBD5E0',
        },
        success: '#00FF94', // Neon Green
        warning: '#FFB800', // Neon Orange/Yellow
        danger: '#FF0055', // Neon Red
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)",
        'tech-gradient': 'linear-gradient(135deg, #050505 0%, #121212 100%)',
      },
      boxShadow: {
        'neon-primary': '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)',
        'neon-secondary': '0 0 10px rgba(112, 0, 255, 0.5), 0 0 20px rgba(112, 0, 255, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}