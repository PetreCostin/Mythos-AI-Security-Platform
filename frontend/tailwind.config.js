import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          background: '#0a0e1a',
          card: '#111827',
          border: '#1f2937',
          primary: '#06b6d4',
          secondary: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b',
          'text-primary': '#f9fafb',
          'text-secondary': '#9ca3af',
        },
      },
      boxShadow: {
        glow: '0 12px 40px rgba(6, 182, 212, 0.08)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(31,41,55,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(31,41,55,0.4) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
    },
  },
  plugins: [forms],
}
