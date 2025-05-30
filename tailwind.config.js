const plugin = require('tailwindcss/plugin');
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(239, 68, 68)",  // Red-500
          light: "rgb(254, 202, 202)",  // Red-200
          dark: "rgb(185, 28, 28)",    // Red-700
        },
        background: {
          light: "#FFFFFF",
          dark: "#000000",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["Inter var", ...fontFamily.sans],
      },
      animation: {
        "float": "float 8s ease-in-out infinite",
        "pulse-slow": "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "bounce-slow": "bounce 3s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-20px) scale(1.05)" },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    plugin(function({ addUtilities, matchUtilities, theme }) {
      addUtilities({
        '.animation-delay-1000': {
          'animation-delay': '1000ms',
        },
        '.animation-delay-2000': {
          'animation-delay': '2000ms',
        },
        '.animation-delay-3000': {
          'animation-delay': '3000ms',
        },
        '.animation-delay-4000': {
          'animation-delay': '4000ms',
        },
      });
    }),
  ],
};