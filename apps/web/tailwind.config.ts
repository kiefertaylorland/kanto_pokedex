import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Retro Pokédex display font; falls back to system mono.
        pixel: ['"Press Start 2P"', 'ui-monospace', 'monospace'],
      },
      colors: {
        pokedex: {
          red: '#d7263d',
          dark: '#1b1b1f',
          screen: '#9bbc0f',
          'screen-dark': '#0f380f',
        },
      },
      borderRadius: {
        lg: '0.75rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
