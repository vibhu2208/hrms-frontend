/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary, #3b82f6)',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: 'var(--color-primary, #3b82f6)',
          600: 'var(--color-primary, #2563eb)',
          700: 'var(--color-primaryHover, #1d4ed8)',
          800: '#1e40af',
          900: '#1e3a8a',
          foreground: '#f8fafc',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: 'var(--color-border, #334155)',
          800: 'var(--color-surface, #1e293b)',
          900: 'var(--color-background, #0f172a)',
          950: '#020617',
        },
        border: '#334155',
        input: '#334155',
        ring: '#3b82f6',
        background: '#0f172a',
        foreground: '#f8fafc',
        muted: {
          DEFAULT: '#334155',
          foreground: '#94a3b8',
        },
        card: {
          DEFAULT: '#1e293b',
          foreground: '#f8fafc',
        },
        popover: {
          DEFAULT: '#1e293b',
          foreground: '#f8fafc',
        },
        secondary: {
          DEFAULT: '#334155',
          foreground: '#f8fafc',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#f8fafc',
        },
        accent: {
          DEFAULT: '#334155',
          foreground: '#f8fafc',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
