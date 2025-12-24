/**
 * 季度占比规划图 - 导出入口
 *
 * @component QuarterlyProportionChart
 * @description 可复用的季度占比规划图表组件
 *
 * @example
 * ```tsx
 * import { QuarterlyProportionChart } from '@/components/charts/QuarterlyProportionChart';
 *
 * <QuarterlyProportionChart
 *   data={data}
 *   config={{ height: 400 }}
 * />
 * ```
 */

// 主组件
export { QuarterlyProportionChart as default } from './QuarterlyProportionChart';
export { QuarterlyProportionChart } from './QuarterlyProportionChart';

// 类型导出
export type {
  // 主要类型
  ViewMode,
  WarningLevel,
  QuarterIndex,
  QUARTER_LABELS,
  // 数据接口
  QuarterlyProportionData,
  QuarterDetailData,
  ProcessedQuarterData,
  ChartInteractionState,
  // 配置接口
  ChartConfig,
  QuarterlyProportionChartProps,
  // 工具类型
  EChartsOption,
  ColorScheme,
  TooltipFormatterParams,
  SeriesConfig,
} from './QuarterlyProportionChart.types';

// Hooks 导出
export { useChartData } from './hooks/useChartData';
export { useChartConfig } from './hooks/useChartConfig';

// 子组件导出
export {
  ChartHeader,
  CompactChartHeader,
  DetailPanel,
  ViewSwitcher,
  WarningBadge,
} from './components';

// 工具函数导出
export * from './utils';
export { getWarningLevelColor, getDefaultColors } from './hooks/useChartConfig';
export { isValidQuarterData } from './QuarterlyProportionChart.types';

/**
 * 组件元数据
 */
export const COMPONENT_META = {
  name: 'QuarterlyProportionChart',
  version: '1.0.0',
  description: '季度占比规划图表组件',
  author: 'Development Team',
  tags: ['chart', 'quarterly', 'proportion', 'growth', 'visualization'],
} as const;
