/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#1A1A2E',
        chat: '#16213E',
        panel: '#0F3460',
        accent: '#4F8EF7',
        'accent-dark': '#2563EB',
        bubble: {
          own: '#2563EB',
          other: '#1E293B',
        },
      },
      animation: {
        'bounce-dot': 'bounceDot 1.4s infinite ease-in-out',
      },
      keyframes: {
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
