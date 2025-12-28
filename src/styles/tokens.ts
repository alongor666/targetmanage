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
 *     itemStyle: { color: colors.chart.targetNormal }
 *   }]
 * };
 */

// ========== COLOR SYSTEM ==========

export const colors = {
  // ==================== 品牌色 ====================
  brand: {
    primaryRed: '#a02724',       // 主色调 - 红色 (用于重要标题、强调)
    primaryRedHover: '#8a2220',  // 主色调悬停 - 略深的红色
    teslaBlue: '#0070c0',        // 特斯拉蓝 (用于链接、交互元素)
  },

  // ==================== 状态色 ====================
  status: {
    good: '#00b050',          // 优秀/正常 - 绿色
    warning: '#ffc000',       // 预警/注意 - 橙色
    danger: '#c00000',        // 危险/负增长 - 深红色
    normal: '#666666',        // 正常/默认 - 灰色
    info: '#0070c0',          // 信息提示 - 蓝色
  },

  // ==================== 文字色 ====================
  text: {
    primary: '#333333',       // 主要文字 (标题、正文)
    secondary: '#666666',     // 次要文字 (标签、描述)
    muted: '#999999',         // 辅助文字 (占位符、提示)
    inverse: '#ffffff',       // 反白文字 (在深色背景上)
  },

  // ==================== 边框色 ====================
  border: {
    light: '#e0e0e0',         // 浅色边框 (默认分割线)
    medium: '#cccccc',        // 中等边框 (强调分割线)
    dark: '#999999',          // 深色边框 (高对比度分割线)
  },

  // ==================== 背景色 ====================
  background: {
    primary: '#ffffff',       // 主背景 (卡片、容器)
    secondary: '#f8f9fa',     // 次背景 (页面背景)
    overlay: 'rgba(0, 0, 0, 0.5)', // 遮罩层 (模态框背景)
    tertiary: '#f5f5f5',      // 第三级背景 (禁用状态、浅色区域)
  },

  // ==================== 交互色 ====================
  interaction: {
    hover: 'rgba(0, 112, 192, 0.05)',     // 悬停背景色
    active: 'rgba(0, 112, 192, 0.1)',     // 激活背景色
    focus: 'rgba(0, 112, 192, 0.2)',      // 焦点阴影色
    disabled: '#f0f0f0',                  // 禁用背景色
    pressed: 'rgba(0, 112, 192, 0.15)',   // 按下背景色
  },

  // ==================== 图表专用色 ====================
  chart: {
    // 柱状图配色
    targetNormal: '#b0d8ef',              // 目标值柱子(正常) - 浅天蓝色
    targetNormalBorder: 'transparent',    // 目标值柱子边框色
    targetNormalBorderWidth: '0px',       // 目标值柱子边框粗细
    targetWarning: '#d3d3d3',             // 目标值柱子(预警) - 浅灰色填充
    targetWarningBorder: '#ffc000',       // 目标值柱子(预警边框) - 橙色1px
    targetWarningBorderWidth: '1px',      // 目标值柱子(预警边框)粗细
    actual: '#d3d3d3',                    // 实际值柱子(固定) - 浅灰色
    actualBorder: 'transparent',          // 实际值柱子边框色
    actualBorderWidth: '0px',             // 实际值柱子边框粗细

    // 折线图配色
    line: '#0070c0',                      // 折线 - 蓝色
    warningLine: '#ffc000',               // 预警线 - 橙色虚线

    // 标签配色
    labelDefault: '#666666',              // 柱状图标签(正常) - 灰色
    labelWarning: '#c00000',              // 柱状图标签(预警) - 深红色
    lineLabelDefault: '#0070c0',          // 折线图标签(正常) - 蓝色
    lineLabelWarning: '#c00000',          // 折线图标签(预警) - 深红色

    // 其他图表元素
    grayLine: '#808080',                  // 灰色参考线
    progressLine: '#808080',              // 进度线

    // 兼容旧命名
    claimRate: '#b0d8ef',                 // @deprecated 使用 targetNormal
    expenseRate: '#d3d3d3',               // @deprecated 使用 actual
    warningDash: '#ffc000',               // @deprecated 使用 warningLine

    // === 季度图表专用色系（参考：配色示例.html） ===
    targetBarNormal: '#dceef9',           // 季度目标柱(正常) - 浅天蓝
    targetBarWarningBorder: '#ffc000',    // 季度目标柱(预警边框) - 橙色

    actualBarNormal: '#f2f2f2',           // 实际达成柱(正常) - 浅灰
    actualBarWarningBorder: '#ffc000',    // 实际达成柱(预警边框) - 橙色

    growthLine: '#0070c0',                // 增长率线 - 蓝色
    growthPointExcellent: '#00b050',      // 增长率点(≥12%) - 绿色
    growthPointNormal: '#666666',         // 增长率点(5-12%) - 灰色
    growthPointWarning: '#ffc000',        // 增长率点(0-5%) - 橙色
    growthPointDanger: '#c00000',         // 增长率点(<0%) - 红色

    quarterlyLabelNormal: '#0070c0',      // 季度图标签(正常) - 蓝色
    quarterlyLabelWarning: '#a02724',     // 季度图标签(预警) - 主红色

    warningLineColor: '#a02724',          // 预警线 - 主红色

    // === 实际 vs 规划数据颜色系统 ===
    actualDataBar: '#d3d3d3',             // 实际数据柱（深灰色，视觉权重高）
    plannedDataBar: '#e8f4fd',            // 规划数据柱（极浅蓝色，视觉权重低）
    plannedDataBorder: '#b0d8ef',         // 规划数据柱边框（浅蓝色，增强识别性）

    // === 年度对比数据颜色系统（2025-12-27新增） ===
    // 渐变色序列：从灰到蓝的连续渐变，体现时间推进和确定性层次
    // @doc docs/design/全局设计规范.md:106-119
    actual2025: '#BDC3C7',                // 2025年实际（浅灰色，历史基线，渐变起点）
    actual2026: '#5B9BD5',                // 2026年实际（中蓝色，当期数据，实心柱）
    target2026: '#B0D8EF',                // 2026年目标（浅蓝色，计划目标，渐变中段）
    planned2026: '#E8F4FD',               // 2026年规划（极浅蓝，预测规划，渐变终点）
    planned2026Border: '#B0D8EF',         // 2026年规划边框（浅蓝色，增强识别性）
  },

  // ==================== KPI卡片专用色 ====================
  kpiCard: {
    // 正常状态
    defaultBorder: '#e0e0e0',             // 默认边框
    defaultValue: '#333333',              // 默认数值颜色

    // 优秀状态
    goodBorder: 'rgba(0, 176, 80, 0.2)',  // 优秀边框 (绿色20%透明)
    goodValue: '#00b050',                 // 优秀数值颜色
    goodBg: 'rgba(0, 176, 80, 0.1)',      // 优秀背景 (绿色10%透明)

    // 预警状态
    warningBorder: 'rgba(255, 192, 0, 0.2)', // 预警边框 (橙色20%透明)
    warningValue: '#ffc000',              // 预警数值颜色
    warningBg: 'rgba(255, 192, 0, 0.1)',  // 预警背景 (橙色10%透明)

    // 危险状态
    dangerBorder: 'rgba(192, 0, 0, 0.2)', // 危险边框 (红色20%透明)
    dangerValue: '#c00000',               // 危险数值颜色
    dangerBg: 'rgba(192, 0, 0, 0.1)',     // 危险背景 (红色10%透明)
  },

  // ==================== 徽章专用色 ====================
  badge: {
    // 填充样式
    defaultFill: '#e0e0e0',               // 默认填充
    goodFill: '#00b050',                  // 优秀填充
    warningFill: '#ffc000',               // 预警填充
    dangerFill: '#c00000',                // 危险填充
    infoFill: '#0070c0',                  // 信息填充

    // 轮廓样式
    defaultOutline: '#e0e0e0',            // 默认轮廓边框
    goodOutline: '#00b050',               // 优秀轮廓边框
    warningOutline: '#ffc000',            // 预警轮廓边框
    dangerOutline: '#c00000',             // 危险轮廓边框
    infoOutline: '#0070c0',               // 信息轮廓边框

    // 文字颜色
    defaultText: '#333333',               // 默认文字
    goodText: '#ffffff',                  // 优秀文字 (反白)
    warningText: '#333333',               // 预警文字 (深色)
    dangerText: '#ffffff',                // 危险文字 (反白)
    infoText: '#ffffff',                  // 信息文字 (反白)
  },

  // ==================== 筛选器专用色 ====================
  filter: {
    defaultBorder: '#e0e0e0',             // 默认边框
    hoverBorder: '#0070c0',               // 悬停边框 (特斯拉蓝)
    activeBg: '#0070c0',                  // 激活背景 (特斯拉蓝)
    activeText: '#ffffff',                // 激活文字 (反白)
    disabledBg: '#f0f0f0',                // 禁用背景
    disabledText: '#999999',              // 禁用文字
    focusShadow: '0 0 0 3px rgba(0, 112, 192, 0.2)', // 焦点阴影
  },

  // ==================== 维度颜色标识（用于筛选标签边框） ====================
  dimension: {
    org: '#0070c0',                       // 三级机构 - 蓝色
    customer: '#00b050',                  // 客户类别 - 绿色
    business: '#ff0000',                  // 业务类型 - 红色
    energy: '#5b9bd5',                    // 能源类型 - 浅蓝
    renewal: '#a9d18e',                   // 续保状态 - 浅绿
    terminal: '#ffd966',                  // 终端来源 - 黄色
  } as const,

  // ==================== 表格专用色 ====================
  table: {
    headerBg: '#f8f9fa',                  // 表头背景
    border: '#e0e0e0',                    // 单元格边框
    stripe: 'rgba(0, 0, 0, 0.02)',        // 斑马纹 (偶数行)
    hover: 'rgba(0, 112, 192, 0.05)',     // 悬停行背景
    selected: 'rgba(0, 112, 192, 0.1)',   // 选中行背景
  },

  // ==================== 反馈状态色 ====================
  feedback: {
    loading: '#0070c0',                   // 加载状态 (蓝色)
    empty: '#999999',                     // 空状态图标/文字
    successBg: 'rgba(0, 176, 80, 0.1)',   // 成功提示背景
    successText: '#00b050',               // 成功提示文字
    errorBg: 'rgba(192, 0, 0, 0.1)',      // 错误提示背景
    errorText: '#c00000',                 // 错误提示文字
  },

  // ==================== 数据深度色 ====================
  depth: {
    light: '#e6f3ff',                     // 浅层数据
    medium: '#4d94ff',                    // 中层数据
    dark: '#0066cc',                      // 深层数据
  },

  // ==================== 渐变色 ====================
  gradient: {
    primary: 'linear-gradient(135deg, #a02724 0%, #c43531 100%)',     // 红色渐变
    blue: 'linear-gradient(135deg, #0070c0 0%, #0088ff 100%)',        // 蓝色渐变
    success: 'linear-gradient(135deg, #00b050 0%, #00d664 100%)',     // 绿色渐变
    warning: 'linear-gradient(135deg, #ffc000 0%, #ffd633 100%)',     // 橙色渐变
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
  full: 50, // percent
} as const;

// ========== SHADOWS ==========

export const shadows = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
  md: '0 2px 12px rgba(0, 0, 0, 0.08)',
  lg: '0 4px 20px rgba(0, 0, 0, 0.12)',
  xl: '0 8px 32px rgba(0, 0, 0, 0.12)',
  focus: '0 0 0 3px rgba(0, 112, 192, 0.2)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  hover: '0 2px 8px rgba(0, 112, 192, 0.15)',  // 悬停阴影 - 极浅蓝色阴影
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
    in: 'cubic-bezier(0.4, 0, 1, 1)',
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

// ========== Z-INDEX LAYERS ==========

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
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
export type ZIndex = typeof zIndex;

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
 * @deprecated Use getAchievementStatusColor or getGrowthStatusColor for threshold-based determination
 */
export function getStatusColor(
  value: number,
  thresholds: { good: number; warning: number }
): string {
  if (value < thresholds.good) return colors.status.good;
  if (value < thresholds.warning) return colors.status.warning;
  return colors.status.danger;
}

/**
 * Get achievement status variant based on rate and thresholds
 *
 * Status determination:
 * - good: rate >= good_min (e.g., >= 105%)
 * - normal: 1 <= rate < good_min (e.g., 100% - 105%)
 * - warning: warning_min <= rate < 1 (e.g., 95% - 100%)
 * - danger: rate < warning_min (e.g., < 95%)
 *
 * @param rate - Achievement rate as decimal (e.g., 1.05 for 105%)
 * @param thresholds - Achievement thresholds { good_min, warning_min }
 * @returns Status variant
 *
 * @example
 * getAchievementStatus(1.08, { good_min: 1.05, warning_min: 0.95 }) // 'good'
 * getAchievementStatus(0.98, { good_min: 1.05, warning_min: 0.95 }) // 'warning'
 */
export function getAchievementStatus(
  rate: number,
  thresholds: { good_min: number; warning_min: number }
): 'good' | 'normal' | 'warning' | 'danger' {
  if (rate >= thresholds.good_min) return 'good';
  if (rate >= 1) return 'normal';
  if (rate >= thresholds.warning_min) return 'warning';
  return 'danger';
}

/**
 * Get growth status variant based on rate and thresholds
 *
 * Status determination:
 * - good: rate >= good_min (e.g., >= 12%)
 * - normal: warning_min <= rate < good_min (e.g., 5% - 12%)
 * - warning: 0 <= rate < warning_min (e.g., 0% - 5%)
 * - danger: rate < 0 (negative growth)
 *
 * @param rate - Growth rate as decimal (e.g., 0.12 for 12%)
 * @param thresholds - Growth thresholds { good_min, warning_min }
 * @returns Status variant
 *
 * @example
 * getGrowthStatus(0.15, { good_min: 0.12, warning_min: 0.05 }) // 'good'
 * getGrowthStatus(-0.03, { good_min: 0.12, warning_min: 0.05 }) // 'danger'
 */
export function getGrowthStatus(
  rate: number,
  thresholds: { good_min: number; warning_min: number }
): 'good' | 'normal' | 'warning' | 'danger' {
  if (rate >= thresholds.good_min) return 'good';
  if (rate >= thresholds.warning_min) return 'normal';
  if (rate >= 0) return 'warning';
  return 'danger';
}

/**
 * Get status color by status variant
 * @param variant - Status variant
 * @returns Status color hex code
 */
export function getStatusColorByVariant(
  variant: 'good' | 'normal' | 'warning' | 'danger'
): string {
  switch (variant) {
    case 'good':
      return colors.status.good;
    case 'normal':
      return colors.status.normal;
    case 'warning':
      return colors.status.warning;
    case 'danger':
      return colors.status.danger;
  }
}

/**
 * Get KPI card colors based on variant
 * @param variant - KPI card variant
 * @returns Object with border, value, and background colors
 */
export function getKpiCardColors(
  variant: 'default' | 'good' | 'warning' | 'danger'
): { border: string; value: string; bg?: string } {
  switch (variant) {
    case 'good':
      return {
        border: colors.kpiCard.goodBorder,
        value: colors.kpiCard.goodValue,
        bg: colors.kpiCard.goodBg,
      };
    case 'warning':
      return {
        border: colors.kpiCard.warningBorder,
        value: colors.kpiCard.warningValue,
        bg: colors.kpiCard.warningBg,
      };
    case 'danger':
      return {
        border: colors.kpiCard.dangerBorder,
        value: colors.kpiCard.dangerValue,
        bg: colors.kpiCard.dangerBg,
      };
    default:
      return {
        border: colors.kpiCard.defaultBorder,
        value: colors.kpiCard.defaultValue,
      };
  }
}

/**
 * Get badge colors based on variant and style
 * @param variant - Badge variant
 * @param outline - Whether to use outline style
 * @returns Object with background and text colors
 */
export function getBadgeColors(
  variant: 'default' | 'good' | 'warning' | 'danger' | 'info',
  outline: boolean = false
): { bg: string; text: string; border?: string } {
  if (outline) {
    return {
      bg: 'transparent',
      text: colors.badge[`${variant}Outline` as keyof typeof colors.badge] as string,
      border: colors.badge[`${variant}Outline` as keyof typeof colors.badge] as string,
    };
  }

  return {
    bg: colors.badge[`${variant}Fill` as keyof typeof colors.badge] as string,
    text: colors.badge[`${variant}Text` as keyof typeof colors.badge] as string,
  };
}

/**
 * Get chart color for target bar based on warning status
 * @param isWarning - Whether the bar is in warning state
 * @returns Object with fill and border colors
 */
export function getTargetBarColors(isWarning: boolean): {
  fill: string;
  border: string;
  borderWidth: number;
} {
  if (isWarning) {
    return {
      fill: colors.chart.targetWarning,
      border: colors.chart.targetWarningBorder,
      borderWidth: 1,
    };
  }
  return {
    fill: colors.chart.targetNormal,
    border: 'transparent',
    borderWidth: 0,
  };
}

/**
 * 根据增长率获取点的颜色
 *
 * 颜色阈值（参考：配色示例.html）：
 * - ≥12%: 绿色 (优秀)
 * - 5-12%: 灰色 (正常)
 * - 0-5%: 橙色 (预警)
 * - <0%: 红色 (危险)
 *
 * @param growthRate 增长率（小数形式，如0.128表示12.8%）
 * @returns 颜色代码
 *
 * @example
 * getGrowthPointColor(0.15) // '#00b050' (绿色)
 * getGrowthPointColor(0.08) // '#666666' (灰色)
 * getGrowthPointColor(0.03) // '#ffc000' (橙色)
 * getGrowthPointColor(-0.02) // '#c00000' (红色)
 * getGrowthPointColor(null) // '#666666' (默认灰色)
 */
export function getGrowthPointColor(growthRate: number | null): string {
  if (growthRate === null) return colors.chart.growthPointNormal;

  if (growthRate >= 0.12) return colors.chart.growthPointExcellent;
  if (growthRate >= 0.05) return colors.chart.growthPointNormal;
  if (growthRate >= 0) return colors.chart.growthPointWarning;
  return colors.chart.growthPointDanger;
}
