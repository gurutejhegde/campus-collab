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
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-subtle': 'var(--color-surface-subtle)',
        'surface-elevated': 'var(--color-surface-elevated)',
        border: 'var(--color-border)',
        'border-hover': 'var(--color-border-hover)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          glow: 'var(--color-accent-glow)',
        },
        brand: {
          indigo: '#6366F1',
          purple: '#8B5CF6',
          pink: '#EC4899',
          cyan: '#06B6D4',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
      },
      fontFamily: {
        display: ['Outfit', '-apple-system', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        pill: '9999px',
      },
      maxWidth: {
        reading: '760px',
        dashboard: '1280px',
      },
      boxShadow: {
        popover: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
        'popover-dark': '0 20px 40px -10px rgba(0, 0, 0, 0.7)',
        glow: '0 0 25px -4px rgba(139, 92, 246, 0.28)',
        'glow-cyan': '0 0 25px -4px rgba(6, 182, 212, 0.28)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.28)',
        'glow-pink': '0 0 25px -4px rgba(236, 72, 153, 0.28)',
      },
      transitionDuration: {
        smooth: '200ms',
      },
      animation: {
        fadeIn: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        slideUp: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        pulseSlow: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
