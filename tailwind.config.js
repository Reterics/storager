/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/components/**/*.{tsx,ts,mdx}',
    './src/pages/*.{tsx,ts,mdx}',
    './src/layouts/*.{tsx,ts,mdx}',
    './src/main.tsx',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: 'selector',
}

