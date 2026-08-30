import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/components/**/*.{ts,tsx}', './src/app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Marinho da marca — recalibrado sobre #0b1b33 (direção "Filtro vivo",
        // aprovada pelo cliente via mockup hifi). Usado no site público inteiro.
        navy: {
          50: '#EEF1F6',
          100: '#D8DFE9',
          200: '#AEBCCF',
          300: '#7A93B2',
          400: '#4C6690',
          500: '#2F4A6D',
          600: '#203653',
          700: '#14263F',
          800: '#0B1B33', // primária — texto e superfícies de marca
          900: '#081527',
          950: '#05101A',
        },
        // Acento dourado do mockup aprovado — preço, tags ativas, links.
        // Só no site público; o painel interno mantém `aqua` (fora do escopo
        // deste rebrand, definido pela própria Vertiz como não prioritário).
        accent: {
          50: '#FAF3E7',
          100: '#F2E4CF',
          200: '#E7CEAD',
          300: '#DAB684',
          400: '#CD9F61',
          500: '#C08A3E', // acento primário
          600: '#AD7830',
          700: '#8F6427',
          800: '#6F4E1F',
          900: '#4F3816',
        },
        // Acento costeiro anterior — mantido só para o painel (CRM/CMS).
        aqua: {
          50: '#EAFBF7',
          100: '#C9F4EA',
          200: '#94E8D7',
          300: '#5AD5BF',
          400: '#26BCA5',
          500: '#12A594',
          600: '#0C8478',
          700: '#0C6960',
          800: '#0D544E',
          900: '#0D4641',
        },
        ink: '#0B1B33',
        offwhite: '#F6F4F0',
        surface: '#ECEAE5',
        whatsapp: {
          DEFAULT: '#25D366',
          dark: '#1DA851',
          ink: '#06301A', // texto sobre fundo verde — o mockup usa texto escuro, não branco
        },
      },
      fontFamily: {
        // 'display' mantido como alias de 'sans' — compatibilidade com
        // trechos que ainda usam font-display para headings estruturais.
        display: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Títulos editoriais — hero, título do catálogo. Usar com moderação.
        editorial: ['var(--font-editorial)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        card: '1.25rem',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,37,69,0.04), 0 8px 24px -12px rgba(11,37,69,0.18)',
        'card-hover': '0 2px 4px rgba(11,37,69,0.06), 0 18px 40px -16px rgba(11,37,69,0.28)',
        sticky: '0 -8px 24px -12px rgba(11,37,69,0.25)',
      },
      backgroundImage: {
        'navy-veil': 'linear-gradient(180deg, rgba(4,16,31,0) 35%, rgba(4,16,31,0.85) 100%)',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      screens: {
        xs: '400px',
      },
    },
  },
  plugins: [],
}

export default config
