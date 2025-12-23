/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // ========== COLORS ==========
      colors: {
        // Brand colors
        primary: {
          red: 'var(--color-primary-red)',
          DEFAULT: 'var(--color-primary-red)',
        },
        tesla: {
          blue: 'var(--color-tesla-blue)',
          DEFAULT: 'var(--color-tesla-blue)',
        },

        // Status colors
        status: {
          good: 'var(--color-status-good)',
          warning: 'var(--color-status-warning)',
          danger: 'var(--color-status-danger)',
          normal: 'var(--color-status-normal)',
        },

        // Text colors
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },

        // Border colors
        border: {
          light: 'var(--color-border-light)',
          medium: 'var(--color-border-medium)',
          dark: 'var(--color-border-dark)',
          DEFAULT: 'var(--color-border-light)',
        },

        // Background colors
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          overlay: 'var(--color-bg-overlay)',
        },

        // Chart colors
        chart: {
          'gray-line': 'var(--color-chart-gray-line)',
          'warning-dash': 'var(--color-chart-warning-dash)',
          'claim-rate': 'var(--color-chart-claim-rate-bar)',
          'expense-rate': 'var(--color-chart-expense-rate-bar)',
          'progress-line': 'var(--color-chart-progress-line)',
        },

        // Data depth colors
        depth: {
          light: 'var(--color-data-depth-light)',
          medium: 'var(--color-data-depth-medium)',
          dark: 'var(--color-data-depth-dark)',
        },
      },

      // ========== TYPOGRAPHY ==========
      fontFamily: {
        sans: 'var(--font-family-primary)',
        mono: 'var(--font-family-mono)',
      },

      fontSize: {
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-sm)',
        base: 'var(--font-size-base)',
        md: 'var(--font-size-md)',
        lg: 'var(--font-size-lg)',
        xl: 'var(--font-size-xl)',
        '2xl': 'var(--font-size-xxl)',
        '3xl': 'var(--font-size-xxxl)',
      },

      fontWeight: {
        light: 'var(--font-weight-light)',
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
      },

      lineHeight: {
        tight: 'var(--line-height-tight)',
        normal: 'var(--line-height-normal)',
        relaxed: 'var(--line-height-relaxed)',
      },

      // ========== SPACING ==========
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-xxl)',
        '3xl': 'var(--spacing-xxxl)',
      },

      // ========== BORDER RADIUS ==========
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },

      // ========== SHADOWS ==========
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        focus: 'var(--shadow-focus)',
      },

      // ========== ANIMATIONS ==========
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },

      transitionTimingFunction: {
        'ease-out': 'var(--ease-out)',
        'ease-in-out': 'var(--ease-in-out)',
      },

      // ========== LAYOUT ==========
      maxWidth: {
        ppt: 'var(--ppt-width)',
        'ppt-standard': 'var(--ppt-width-standard)',
        content: 'var(--content-max-width)',
        'content-standard': 'var(--content-max-width-standard)',
        'content-compact': 'var(--content-max-width-compact)',
      },

      height: {
        chart: 'var(--chart-height)',
        'chart-sm': 'var(--chart-height-sm)',
        'chart-lg': 'var(--chart-height-lg)',
      },

      // ========== BREAKPOINTS ==========
      screens: {
        xs: '480px',
        // sm: '768px' (Tailwind default, matches spec)
        // md: '1024px' (Tailwind default, matches spec)
        lg: '1440px', // Override to match spec
        xl: '1920px', // Override to match spec
        '2xl': '2560px', // Add custom
      },
    },
  },
  plugins: [],
};
