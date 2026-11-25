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
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          glow: 'var(--color-accent-glow)',
        },
        cyan: {
          accent: '#06B6D4',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      borderRadius: {
        card: '10px',
        pill: '9999px',
      },
      maxWidth: {
        reading: '760px',
        dashboard: '1240px',
      },
      boxShadow: {
        popover: '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
        'popover-dark': '0 8px 30px -4px rgba(0, 0, 0, 0.5)',
        glow: '0 0 15px rgba(99, 102, 241, 0.18)',
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.18)',
      },
      transitionDuration: {
        smooth: '150ms',
      },
      animation: {
        fadeIn: 'fadeIn 0.18s ease-out',
        slideUp: 'slideUp 0.22s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
