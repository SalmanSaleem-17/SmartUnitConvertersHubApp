/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: '#4F46E5',     // indigo-600
          dark: '#A5B4FC',        // indigo-300
          soft: '#EEF2FF',        // indigo-50
          softDark: '#1E1B4B',    // indigo-950
        },
        accent: {
          DEFAULT: '#EC4899',     // pink-500
          dark: '#F472B6',        // pink-400
          soft: '#FCE7F3',
          softDark: '#3F1936',
        },
        // Semantic
        success: { DEFAULT: '#059669', dark: '#34D399' },
        warning: { DEFAULT: '#D97706', dark: '#FBBF24' },
        danger:  { DEFAULT: '#DC2626', dark: '#F87171' },
        // Surfaces
        bg: {
          DEFAULT: '#FAFAFB',
          dark: '#0A0A12',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#16161F',
        },
        muted: {
          DEFAULT: '#F4F4F7',
          dark: '#1E1E2A',
        },
        border: {
          DEFAULT: '#E5E7EB',
          strong: '#D1D5DB',
          dark: '#27273A',
          'strong-dark': '#34344A',
        },
        // Text
        ink: {
          DEFAULT: '#0F172A',
          dark: '#F8FAFC',
          muted: '#64748B',
          'muted-dark': '#94A3B8',
          subtle: '#94A3B8',
          'subtle-dark': '#64748B',
        },
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '10px',
        md: '12px',
        lg: '16px',
        xl: '22px',
        pill: '999px',
      },
      fontSize: {
        caption: ['12px', '16px'],
        small:   ['13px', '18px'],
        body:    ['15px', '22px'],
        h3:      ['17px', '22px'],
        h2:      ['20px', '26px'],
        h1:      ['24px', '30px'],
        display: ['30px', '36px'],
      },
      letterSpacing: {
        tighter: '-0.6px',
        tight: '-0.4px',
      },
    },
  },
  plugins: [],
};
