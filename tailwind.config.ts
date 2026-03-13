import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        spb: {
          bg: '#F7F8FB',
          ink: '#0F172A',
          blue: '#2E5BFF',
          blueDark: '#2448CC',
          mint: '#00BFA5',
        },
      },
      boxShadow: {
        card: '0 6px 24px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        xl2: '1rem',
        xl3: '1.25rem',
      },
    },
  },
  plugins: [],
}
export default config

