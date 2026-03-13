import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E6C2C2',
        secondary: '#D4A5A5',
        background: '#FFFAFA',
        'text-main': '#4A4A4A',
        'text-accent': '#8B5F5F',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-lato)', 'sans-serif'],
        script: ['var(--font-great-vibes)', 'cursive'],
      },
    },
  },
  plugins: [],
};
export default config;
