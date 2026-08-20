/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // Мобильный контейнер: приложение всегда живёт в колонке max-w-md,
    // даже на десктопе (эмуляция телефона) — используем как container.screens.
    container: {
      center: true,
      padding: '1rem',
      screens: { DEFAULT: '28rem' }, // ~ max-w-md
    },
    extend: {
      // Только фирменные токены, которых нет в стандартной палитре Tailwind.
      // indigo / violet / rose / amber / blue / slate — берутся из дефолтной
      // палитры Tailwind как есть (её хексы уже совпадают с макетом:
      // amber-500 #F59E0B, blue-500 #3B82F6, slate-400 #94A3B8 и т.д.),
      // переопределять их нет смысла.
      colors: {
        bg: {
          deep: '#0B0D1B', // фон приложения
          base: '#0F1226', // вторичный фон / радиальный градиент под шапкой
        },
        surface: {
          DEFAULT: '#161A33', // карточки
          raised: '#1C2142', // приподнятые/акцентные карточки (прогресс, брифинг)
          hover: '#1F244A',
          border: 'rgba(99, 102, 241, 0.10)', // indigo-500/10 — еле заметная рамка карточек
        },
        glow: '#818CF8', // подсветка немецких терминов и B2-конструкций (indigo-400)
      },
      backgroundImage: {
        // Основной градиент: кнопки, активные элементы, свечения, иконка приложения
        'violet-gradient': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'violet-gradient-soft': 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)',
        'app-noise': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cg fill='none' stroke='%236366F1' stroke-opacity='0.06'%3E%3Ccircle cx='20' cy='20' r='16'/%3E%3Crect x='80' y='60' width='18' height='18' rx='4'/%3E%3Cline x1='0' y1='90' x2='120' y2='30'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      fontFamily: {
        // Manrope — интерфейс, кнопки, UI-текст (геометричный, читаемый на телефоне)
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Lora — немецкие примеры предложений, цитаты, "красивый B2-стиль" в апгрейдере
        serif: ['Lora', 'ui-serif', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glow-violet': '0 0 24px 0 rgba(99, 102, 241, 0.45)',
        'glow-rose': '0 0 24px 0 rgba(244, 63, 94, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        // Высота нижней floating input-панели + safe-area на iOS
        'input-bar': '6.5rem',
        // Высота BottomNav над input-панелью (см. .bottom-nav-bar в index.css)
        'nav-bar': '4rem',
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
