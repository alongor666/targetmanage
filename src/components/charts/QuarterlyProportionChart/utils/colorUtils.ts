/**
 * 颜色工具函数
 *
 * @description 颜色计算、转换、处理工具
 */

import type { WarningLevel } from '../QuarterlyProportionChart.types';

/**
 * 默认颜色配置
 */
export const DEFAULT_COLORS = {
  // 目标柱颜色
  target: {
    normal: '#dceef9',
    gradient: ['#dceef9', '#b0d8ef'],
    hover: '#c5e3f7',
  },
  // 实际柱颜色
  actual: {
    normal: '#f2f2f2',
    hover: '#e5e5e5',
  },
  // 增长率颜色
  growth: {
    line: '#0070c0',
    positive: '#4caf50',
    neutral: '#757575',
    negative: '#f44336',
  },
  // 预警颜色
  warning: {
    orange: '#ffc000',
    red: '#d32f2f',
  },
} as const;

/**
 * 预警级别对应的颜色配置
 */
export const WARNING_LEVEL_COLORS: Record<
  WarningLevel,
  {
    text: string;
    bg: string;
    border: string;
    icon: string;
  }
> = {
  excellent: {
    text: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: '✓',
  },
  normal: {
    text: 'text-gray-700',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: '•',
  },
  warning: {
    text: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: '⚠',
  },
  danger: {
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '⚠',
  },
};

/**
 * 根据预警级别获取颜色
 * @param level - 预警级别
 * @returns 颜色值
 */
export function getWarningLevelColor(level: WarningLevel): string {
  switch (level) {
    case 'excellent':
      return DEFAULT_COLORS.growth.positive;
    case 'normal':
      return DEFAULT_COLORS.growth.neutral;
    case 'warning':
      return DEFAULT_COLORS.warning.orange;
    case 'danger':
      return DEFAULT_COLORS.growth.negative;
  }
}

/**
 * 根据增长率获取预警级别
 * @param growth - 增长率（小数形式）
 * @returns 预警级别
 */
export function getWarningLevelByGrowth(growth: number | null): WarningLevel {
  if (growth === null || isNaN(growth)) return 'normal';
  if (growth < 0) return 'danger';
  if (growth < 0.05) return 'warning';
  if (growth < 0.15) return 'normal';
  return 'excellent';
}

/**
 * 根据增长率获取颜色类名
 * @param growth - 增长率（小数形式）
 * @returns Tailwind CSS 颜色类名
 */
export function getGrowthColorClass(growth: number | null): string {
  if (growth === null || isNaN(growth)) return 'text-gray-400';
  if (growth < 0) return 'text-red-600';
  if (growth < 0.05) return 'text-orange-600';
  if (growth < 0.15) return 'text-gray-700';
  return 'text-green-600';
}

/**
 * 调整颜色亮度
 * @param color - 十六进制颜色
 * @param amount - 调整量（-1 到 1）
 * @returns 调整后的颜色
 */
export function adjustBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const adjust = (value: number) => {
    const adjusted = Math.round(value + amount * 255);
    return Math.max(0, Math.min(255, adjusted));
  };

  const toHex = (value: number) => {
    const hex = value.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`;
}

/**
 * 转换颜色为 RGBA
 * @param color - 十六进制颜色
 * @param alpha - 透明度（0-1）
 * @returns RGBA 颜色字符串
 */
export function hexToRgba(color: string, alpha: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * 创建渐变色
 * @param startColor - 起始颜色
 * @param endColor - 结束颜色
 * @param steps - 步数
 * @returns 颜色数组
 */
export function createGradient(
  startColor: string,
  endColor: string,
  steps: number
): string[] {
  const start = {
    r: parseInt(startColor.substring(1, 3), 16),
    g: parseInt(startColor.substring(3, 5), 16),
    b: parseInt(startColor.substring(5, 7), 16),
  };

  const end = {
    r: parseInt(endColor.substring(1, 3), 16),
    g: parseInt(endColor.substring(3, 5), 16),
    b: parseInt(endColor.substring(5, 7), 16),
  };

  const colors: string[] = [];

  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const r = Math.round(start.r + (end.r - start.r) * ratio);
    const g = Math.round(start.g + (end.g - start.g) * ratio);
    const b = Math.round(start.b + (end.b - start.b) * ratio);

    colors.push(
      `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    );
  }

  return colors;
}

/**
 * 根据阈值获取热力图颜色
 * @param value - 数值
 * @param min - 最小值
 * @param max - 最大值
 * @param colorScheme - 颜色方案
 * @returns 颜色值
 */
export function getHeatmapColor(
  value: number,
  min: number,
  max: number,
  colorScheme: 'green-red' | 'blue-orange' | 'purple-yellow' = 'green-red'
): string {
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const schemes = {
    'green-red': {
      start: [76, 175, 80], // green
      end: [244, 67, 54], // red
    },
    'blue-orange': {
      start: [33, 150, 243], // blue
      end: [255, 152, 0], // orange
    },
    'purple-yellow': {
      start: [156, 39, 176], // purple
      end: [255, 235, 59], // yellow
    },
  };

  const { start, end } = schemes[colorScheme];

  const r = Math.round(start[0] + (end[0] - start[0]) * ratio);
  const g = Math.round(start[1] + (end[1] - start[1]) * ratio);
  const b = Math.round(start[2] + (end[2] - start[2]) * ratio);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * 检查颜色是否为深色
 * @param color - 十六进制颜色
 * @returns 是否为深色
 */
export function isDarkColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 计算亮度
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

/**
 * 获取对比色（黑色或白色）
 * @param color - 十六进制颜色
 * @returns 对比色（#000 或 #fff）
 */
export function getContrastColor(color: string): string {
  return isDarkColor(color) ? '#ffffff' : '#000000';
}

/**
 * 混合两种颜色
 * @param color1 - 颜色1
 * @param color2 - 颜色2
 * @param ratio - 混合比例（0-1）
 * @returns 混合后的颜色
 */
export function blendColors(
  color1: string,
  color2: string,
  ratio: number
): string {
  const c1 = {
    r: parseInt(color1.substring(1, 3), 16),
    g: parseInt(color1.substring(3, 5), 16),
    b: parseInt(color1.substring(5, 7), 16),
  };

  const c2 = {
    r: parseInt(color2.substring(1, 3), 16),
    g: parseInt(color2.substring(3, 5), 16),
    b: parseInt(color2.substring(5, 7), 16),
  };

  const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
  const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
  const b = Math.round(c1.b + (c2.b - c1.b) * ratio);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * 获取颜色透明度变体
 * @param color - 十六进制颜色
 * @param opacity - 透明度（0-1）
 * @returns RGBA 颜色字符串
 */
export function withOpacity(color: string, opacity: number): string {
  return hexToRgba(color, opacity);
}

/**
 * 生成调色板
 * @param baseColor - 基础颜色
 * @param steps - 步数
 * @returns 调色板数组
 */
export function generatePalette(baseColor: string, steps: number = 5): string[] {
  const palette: string[] = [];
  const stepSize = 1 / (steps - 1);

  for (let i = 0; i < steps; i++) {
    if (i === Math.floor(steps / 2)) {
      palette.push(baseColor);
    } else if (i < steps / 2) {
      // 变亮
      const amount = (steps / 2 - i) * stepSize * 0.5;
      palette.push(adjustBrightness(baseColor, amount));
    } else {
      // 变暗
      const amount = (i - steps / 2) * stepSize * 0.5;
      palette.push(adjustBrightness(baseColor, -amount));
    }
  }

  return palette;
}
