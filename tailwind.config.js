module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#FAF9F7',
        'surface-alt': '#F3F1EE',
        'on-surface': '#1C1917',
        primary: '#4A5548',
        'primary-container': '#8A9A8E',
        secondary: '#78716C',
        tertiary: '#B45309',
        outline: '#D6D3D1',
        'outline-variant': '#E7E5E3',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '400' }],
        'headline-md': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        'label-caps': ['0.625rem', { lineHeight: '1.4', letterSpacing: '0.12em', fontWeight: '700', textTransform: 'uppercase' }],
        'body-base': ['0.875rem', { lineHeight: '1.6' }],
      },
      spacing: {
        'layout-margin': '3rem',
        'layout-gutter': '1.5rem',
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
}
