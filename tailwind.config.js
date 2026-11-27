/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        well: 'var(--well)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-dim': 'var(--text-dim)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          text: 'var(--accent-text)',
          soft: 'var(--accent-soft)',
          border: 'var(--accent-border)',
        },
        ok: {
          DEFAULT: 'var(--ok)',
          soft: 'var(--ok-soft)',
        },
        danger: 'var(--danger)',
        warn: 'var(--warn)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        control: '8px',
      },
      maxWidth: {
        shell: '1080px',
      },
      boxShadow: {
        tactile: 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        popover: '0 20px 50px rgba(0, 0, 0, 0.7)',
      },
      transitionDuration: {
        fast: '130ms',
      },
    },
  },
  plugins: [],
};
