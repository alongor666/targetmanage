/**
 * ECharts 公共配置工具函数
 *
 * 提供统一的图表配置，确保设计规范的一致性。
 */

import { colors } from '@/styles/tokens';

/**
 * X轴优化配置（倾斜45度 + 自动截断）
 *
 * 设计要求：
 * - 倾斜45度避免标签重叠
 * - 字号10px节省空间
 * - 超长文本截断（8字符 + "..."）
 * - 强制显示所有标签（interval: 0）
 *
 * @param maxLength 最大字符长度（默认8）
 * @returns ECharts xAxis 配置对象
 *
 * @example
 * ```ts
 * const chartOption = {
 *   xAxis: {
 *     ...getOptimizedXAxisConfig(),
 *     data: orgNames,
 *   },
 * };
 * ```
 */
export function getOptimizedXAxisConfig(maxLength: number = 8) {
  return {
    type: 'category' as const,
    axisLabel: {
      rotate: 45,              // 倾斜45度
      fontSize: 10,            // 小字号
      interval: 0,             // 强制显示所有标签
      formatter: (value: string) => {
        // 超长文本截断
        if (value.length > maxLength) {
          return value.substring(0, maxLength) + '...';
        }
        return value;
      },
      color: colors.text.secondary,
    },
    axisLine: {
      lineStyle: {
        color: colors.border.light,
      },
    },
    axisTick: {
      show: false,
    },
  };
}

/**
 * Y轴标准配置
 *
 * @param name Y轴名称（可选）
 * @returns ECharts yAxis 配置对象
 */
export function getStandardYAxisConfig(name?: string) {
  return {
    type: 'value' as const,
    name,
    nameTextStyle: {
      color: colors.text.secondary,
      fontSize: 12,
    },
    axisLabel: {
      color: colors.text.secondary,
      fontSize: 11,
    },
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      lineStyle: {
        color: colors.border.light,
        type: 'dashed' as const,
      },
    },
  };
}

/**
 * 网格配置（图表绘图区域）
 *
 * 设计要求：
 * - X轴倾斜后需要更大的底部空间
 * - 左侧预留Y轴标签空间
 *
 * @returns ECharts grid 配置对象
 */
export function getStandardGridConfig() {
  return {
    left: '3%',
    right: '4%',
    bottom: '15%',  // X轴倾斜后需要更大的底部空间
    top: '10%',
    containLabel: true,
  };
}

/**
 * Tooltip标准配置
 *
 * @returns ECharts tooltip 配置对象
 */
export function getStandardTooltipConfig() {
  return {
    trigger: 'axis' as const,
    axisPointer: {
      type: 'shadow' as const,
      shadowStyle: {
        color: 'rgba(0, 112, 192, 0.05)',
      },
    },
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: colors.border.light,
    borderWidth: 1,
    textStyle: {
      color: colors.text.primary,
      fontSize: 12,
    },
    padding: [8, 12],
    extraCssText: 'backdrop-filter: blur(10px); border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);',
  };
}

/**
 * 图例标准配置
 *
 * @param position 位置（默认顶部居中）
 * @returns ECharts legend 配置对象
 */
export function getStandardLegendConfig(position: 'top' | 'bottom' | 'left' | 'right' = 'top') {
  const positionConfig = {
    top: { top: '5%', left: 'center' },
    bottom: { bottom: '5%', left: 'center' },
    left: { left: '5%', top: 'center', orient: 'vertical' as const },
    right: { right: '5%', top: 'center', orient: 'vertical' as const },
  };

  return {
    ...positionConfig[position],
    textStyle: {
      color: colors.text.secondary,
      fontSize: 12,
    },
    itemWidth: 14,
    itemHeight: 14,
    itemGap: 16,
  };
}

/**
 * 经营概览图表专用配色
 *
 * 设计要求（2025-12-21更新）：
 * - 满期赔付率柱: #87ceeb (浅蓝色)
 * - 费用率柱: #d3d3d3 (浅灰色)
 * - 达成率折线: #808080 (灰色)
 */
export const operatingOverviewColors = {
  claimRateBar: '#87ceeb',      // 满期赔付率柱
  expenseRateBar: '#d3d3d3',    // 费用率柱
  achievementLine: '#808080',   // 达成率折线
};

/**
 * 创建柱状图系列配置
 *
 * @param name 系列名称
 * @param data 数据
 * @param color 颜色
 * @param showLabel 是否显示数据标签
 * @returns ECharts series 配置对象
 */
export function createBarSeries(
  name: string,
  data: number[],
  color: string,
  showLabel: boolean = true
) {
  return {
    name,
    type: 'bar' as const,
    data,
    itemStyle: {
      color,
      borderRadius: [4, 4, 0, 0],  // 顶部圆角
    },
    label: {
      show: showLabel,
      position: 'top' as const,
      fontSize: 11,
      fontWeight: 600,
      color: colors.text.primary,
      formatter: '{c}%',
    },
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
      },
    },
  };
}

/**
 * 创建折线图系列配置
 *
 * @param name 系列名称
 * @param data 数据
 * @param color 颜色
 * @param yAxisIndex Y轴索引（用于双Y轴）
 * @returns ECharts series 配置对象
 */
export function createLineSeries(
  name: string,
  data: number[],
  color: string,
  yAxisIndex: number = 0
) {
  return {
    name,
    type: 'line' as const,
    data,
    yAxisIndex,
    itemStyle: {
      color,
    },
    lineStyle: {
      color,
      width: 2,
    },
    symbol: 'circle',
    symbolSize: 6,
    label: {
      show: true,
      position: 'top' as const,
      fontSize: 11,
      fontWeight: 600,
      color,
      formatter: '{c}%',
    },
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
      },
    },
  };
}
