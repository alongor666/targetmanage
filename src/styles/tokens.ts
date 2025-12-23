/**
 * Design Token Type Definitions
 *
 * Provides type-safe access to CSS variables defined in globals.css.
 * Use these constants when programmatically setting styles (e.g., ECharts config).
 *
 * @example
 * import { colors } from '@/styles/tokens';
 *
 * const chartOption = {
 *   series: [{
 *     itemStyle: { color: colors.chart.claimRate }
 *   }]
 * };
 */

// ========== COLOR SYSTEM ==========

export const colors = {
  brand: {
    primaryRed: '#a02724',
    teslaBlue: '#0070c0',
  },

  status: {
    good: '#00b050',
    warning: '#ffc000',
    danger: '#c00000',
    normal: '#666666',
  },

  text: {
    primary: '#333333',
    secondary: '#666666',
    muted: '#999999',
    inverse: '#ffffff',
  },

  border: {
    light: '#e0e0e0',
    medium: '#cccccc',
    dark: '#999999',
  },

  background: {
    primary: '#ffffff',
    secondary: '#f8f9fa',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  chart: {
    grayLine: '#808080',
    warningDash: '#ffc000',
    claimRate: '#87ceeb',
    expenseRate: '#d3d3d3',
    progressLine: '#808080',
  },

  depth: {
    light: '#e6f3ff',
    medium: '#4d94ff',
    dark: '#0066cc',
  },
} as const;

// ========== TYPOGRAPHY ==========

export const typography = {
  fontFamily: {
    primary: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif`,
    mono: `'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace`,
  },

  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// ========== SPACING ==========

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// ========== BORDER RADIUS ==========

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

// ========== SHADOWS ==========

export const shadows = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
  md: '0 2px 12px rgba(0, 0, 0, 0.08)',
  lg: '0 4px 20px rgba(0, 0, 0, 0.12)',
  xl: '0 8px 32px rgba(0, 0, 0, 0.12)',
  focus: '0 0 0 3px rgba(0, 112, 192, 0.2)',
} as const;

// ========== ANIMATIONS ==========

export const animations = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },

  easing: {
    out: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ========== LAYOUT ==========

export const layout = {
  pptWidth: 2400,
  pptWidthStandard: 1600,
  contentMaxWidth: 2100,
  contentMaxWidthStandard: 1400,
  contentMaxWidthCompact: 1100,

  chartHeight: 600,
  chartHeightSm: 400,
  chartHeightLg: 600,
} as const;

// ========== BREAKPOINTS ==========

export const breakpoints = {
  xs: 480,
  sm: 768,
  md: 1024,
  lg: 1440,
  xl: 1920,
  xxl: 2560,
} as const;

// ========== TYPE EXPORTS ==========

export type ColorPalette = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Shadows = typeof shadows;
export type Animations = typeof animations;
export type Layout = typeof layout;
export type Breakpoints = typeof breakpoints;

// ========== UTILITY FUNCTIONS ==========

/**
 * Get data depth color based on value ratio
 * @param value - Current value
 * @param maxValue - Maximum value
 * @returns Color hex code
 */
export function getDataDepthColor(value: number, maxValue: number): string {
  const ratio = value / maxValue;

  if (ratio < 0.33) return colors.depth.light;
  if (ratio < 0.67) return colors.depth.medium;
  return colors.depth.dark;
}

/**
 * Format rate value for display
 * @param value - Rate value (0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatRate(
  value: number | null | undefined,
  decimals: number = 1
): string {
  if (value == null) return '—';
  return value.toFixed(decimals);
}

/**
 * Get status color based on threshold
 * @param value - Current value
 * @param thresholds - Object with good, warning thresholds
 * @returns Status color
 */
export function getStatusColor(
  value: number,
  thresholds: { good: number; warning: number }
): string {
  if (value < thresholds.good) return colors.status.good;
  if (value < thresholds.warning) return colors.status.warning;
  return colors.status.danger;
}
