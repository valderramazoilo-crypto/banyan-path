/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Banyan Path brand palette
        forest: {
          DEFAULT: '#1E2818', // Verde Bosque Profundo
          deep: '#141d0f',
          mid: '#283420',
          moss: '#909c4a',
        },
        sand: {
          DEFAULT: '#EBE0C2', // Beige Arena Suave
          soft: '#eae0b5',
          pale: '#f5efdd',
        },
        ember: {
          DEFAULT: '#FF9E30', // Naranja Espiritual Cálido
          warm: '#ffa12b',
          deep: '#e8851a',
        },
      },
      fontFamily: {
        // All Round Gothic is commercial — Montserrat is the closest free geometric match
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        body: ['"Exo 2"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        widest2: '0.28em',
      },
      backgroundImage: {
        'banyan-gradient':
          'linear-gradient(135deg, #283420 0%, #909c4a 55%, #ffa12b 100%)',
        'forest-fade':
          'linear-gradient(180deg, #141d0f 0%, #1E2818 60%, #283420 100%)',
      },
    },
  },
  plugins: [],
}
