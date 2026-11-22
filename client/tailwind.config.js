/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#060910',
          900: '#0A0F1B',
          850: '#0D1424',
          800: '#111A2C',
          700: '#19243A',
          600: '#26344F',
        },
        mint: {
          300: '#A7F3D6',
          400: '#5EEAD4',
          500: '#34D8B0',
          600: '#12B894',
        },
        electric: '#6E8FFF',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(52,216,176,.25), 0 18px 50px -20px rgba(52,216,176,.45)',
        panel: '0 24px 80px -40px rgba(0,0,0,.9)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(.8)', opacity: '.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
          '50%': { transform: 'translateY(-14px) rotate(1deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up .6s cubic-bezier(.2,.7,.2,1) both',
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
};
