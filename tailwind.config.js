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
          DEFAULT: '#0EA5A5',
          dark: '#22D3D3',
          soft: '#D9F4F4',
          softDark: '#103E40',
        },
        accent: {
          DEFAULT: '#7C3AED',
          dark: '#A78BFA',
          soft: '#EDE3FF',
          softDark: '#2D2350',
        },
        // Semantic
        success: { DEFAULT: '#10B981', dark: '#34D399' },
        warning: { DEFAULT: '#F59E0B', dark: '#FBBF24' },
        danger: { DEFAULT: '#EF4444', dark: '#F87171' },
        // Surfaces (light → dark)
        bg: {
          DEFAULT: '#F7F9FC',
          dark: '#0B1220',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#141C2E',
        },
        muted: {
          DEFAULT: '#F1F4F9',
          dark: '#1B2438',
        },
        border: {
          DEFAULT: '#E4E8EF',
          strong: '#D6DCE6',
          dark: '#243049',
          'strong-dark': '#2E3B57',
        },
        // Text
        ink: {
          DEFAULT: '#0B1220',
          dark: '#F1F5F9',
          muted: '#5B6478',
          'muted-dark': '#A4ADC2',
          subtle: '#8A92A6',
          'subtle-dark': '#717892',
        },
        // Category accents
        cat: {
          islamic: '#0EA5A5',
          financial: '#10B981',
          gold: '#F59E0B',
          health: '#F43F5E',
          unit: '#3B82F6',
          datetime: '#8B5CF6',
          math: '#6366F1',
          construction: '#D97706',
          utility: '#06B6D4',
          fun: '#EC4899',
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
        // [size, lineHeight]
        caption: ['12px', '16px'],
        small: ['13px', '18px'],
        body: ['15px', '22px'],
        h3: ['17px', '22px'],
        h2: ['20px', '26px'],
        h1: ['24px', '30px'],
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
