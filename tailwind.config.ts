import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      opacity: { 8: '0.08', 12: '0.12', 15: '0.15', 85: '0.85' },
      colors: {
        ink: '#050505',
        night: { 900: '#0a0a0d', 800: '#101016', 700: '#16161f', 600: '#1e1e2a' },
        electric: { DEFAULT: '#4F8CFF', 400: '#6ea1ff', 600: '#3672e8' },
        nebula: '#8b6cf0',
      },
      fontFamily: {
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(79,140,255,0.45)',
        'glow-sm': '0 0 24px -6px rgba(79,140,255,0.35)',
        card: '0 8px 32px -12px rgba(0,0,0,0.7)',
      },
      borderRadius: { '2xl': '1.25rem', '3xl': '1.75rem' },
      animation: {
        'fade-up': 'fadeUp .7s ease both',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
        drift: 'drift 24s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'none' } },
        pulseSoft: { '0%,100%': { opacity: '0.5' }, '50%': { opacity: '1' } },
        drift: { from: { transform: 'translate3d(-4%, -2%, 0) scale(1)' }, to: { transform: 'translate3d(4%, 3%, 0) scale(1.08)' } },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
