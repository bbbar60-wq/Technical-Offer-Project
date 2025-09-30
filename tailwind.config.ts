import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: "class", // <-- ADD THIS LINE
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0052CC',
          600: '#003E9A',
        },
        accent: '#00B37E',
        danger: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        surface: '#FFFFFF',
        muted: '#F1F5F9',
        neutral: {
          900: '#0F1724',
          700: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system'],
      },
      boxShadow: {
        soft: '0 6px 18px rgba(15, 23, 36, 0.06)',
      },
      borderRadius: {
        lg: '14px',
        md: '8px',
      },
      transitionTimingFunction: {
        'fast': 'cubic-bezier(.2,.9,.2,1)',
      },
      transitionDuration: {
        'fast': '180ms',
      }
    },
  },
  plugins: [],
}
export default config
