/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NationX Semantic Design Tokens from Project 01
        background: 'var(--background, #fdfaf4)',
        foreground: 'var(--foreground, #0b1e1d)',
        card: {
          DEFAULT: 'var(--card, #ffffff)',
          foreground: 'var(--card-foreground, #0b1e1d)',
        },
        popover: {
          DEFAULT: 'var(--popover, #ffffff)',
          foreground: 'var(--popover-foreground, #0b1e1d)',
        },
        primary: {
          DEFAULT: 'var(--primary, #007a75)',
          foreground: 'var(--primary-foreground, #fdfaf3)',
        },
        secondary: {
          DEFAULT: 'var(--secondary, #f3edda)',
          foreground: 'var(--secondary-foreground, #033633)',
        },
        muted: {
          DEFAULT: 'var(--muted, #f6f2ea)',
          foreground: 'var(--muted-foreground, #4e5f5d)',
        },
        accent: {
          DEFAULT: 'var(--accent, #f6e7bb)',
          foreground: 'var(--accent-foreground, #3d2a02)',
        },
        border: 'var(--border, #e3ddd3)',
        input: 'var(--input, #d6d0c4)',
        ring: 'var(--ring, #00847e)',
        marigold: {
          DEFAULT: 'var(--marigold, #f7b828)',
          foreground: 'var(--marigold-foreground, #2f1e02)',
        },
        terracotta: 'var(--terracotta, #c06240)',
        'brand-soft': 'var(--brand-soft, #e4f7f4)',
        success: {
          DEFAULT: 'var(--success, #036639)',
          soft: 'var(--success-soft, #d5f5de)',
        },
        warning: {
          DEFAULT: 'var(--marigold, #f7b828)',
          soft: 'var(--warning-soft, #feeec1)',
        },
        destructive: 'var(--destructive, #cc2827)',

        // NationX Teal palette mapped to existing forest classes for full backwards compatibility
        forest: {
          50: '#eefaf9',
          100: '#d0f5f3',
          200: '#99e8e4',
          300: '#55d5d0',
          400: '#22b8b2',
          500: '#0f9f99',
          600: '#007a75',  // NationX Primary Teal
          700: '#0d5e5a',
          800: '#0f4a47',
          900: '#0b2e2d',
          950: '#071f1e',
        },
        // NationX Clean Warm/Linen palette
        warm: {
          50: '#fdfaf4',
          100: '#f8f4ec',
          200: '#f1ebd9',
          300: '#e3ddd3',
          400: '#c7bfb1',
          500: '#9a9182',
          800: '#2c2720',
          900: '#0b1e1d',
        },
        saffron: {
          500: '#f7b828',
          600: '#d99b16',
          700: '#b07a09',
        }
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Geist', '"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Geist', '"Plus Jakarta Sans"', 'Outfit', 'sans-serif'],
        display: ['Geist', '"Plus Jakarta Sans"', 'Outfit', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(11, 30, 29, 0.05), 0 1px 2px rgba(11, 30, 29, 0.03)',
        'soft': '0 2px 8px rgba(0, 122, 117, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'soft-md': '0 6px 16px rgba(0, 122, 117, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 12px 28px rgba(0, 122, 117, 0.10), 0 4px 8px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
