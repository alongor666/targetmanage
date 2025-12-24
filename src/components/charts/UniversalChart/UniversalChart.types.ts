/**
 * 通用图表组件 - 类型定义
 *
 * @component UniversalChart
 * @description 高度参数化的通用图表组件，支持月度/季度、绝对值/占比/达成率等多种场景
 * @doc docs/fangan.md
 */

/**
 * 时间粒度枚举
 * - quarterly: 季度（4个数据点，对应Q1-Q4）
 * - monthly: 月度（12个数据点，对应1-12月）
 */
export type TimeGranularity = 'quarterly' | 'monthly';

/**
 * 值类型枚举
 * - absolute: 绝对值（万元）
 * - proportion: 占比（百分比）
 * - achievement: 达成率（百分比）
 */
export type ValueType = 'absolute' | 'proportion' | 'achievement';

/**
 * 图表类型枚举（用于预设配置）
 * - quarterlyPremium: 季度保费规划图
 * - quarterlyShare: 季度占比规划图
 * - monthlyPremium: 月度保费规划图
 * - monthlyShare: 月度占比规划图
 * - hqPrediction: 总公司预测图
 */
export type ChartType =
  | 'quarterlyPremium'
  | 'quarterlyShare'
  | 'monthlyPremium'
  | 'monthlyShare'
  | 'hqPrediction';

/**
 * 视图模式枚举
 * - proportion: 占比视图（显示百分比）
 * - absolute: 绝对值视图（显示实际数值）
 * - growth: 增长率聚焦视图（突出显示增长率）
 * - achievement: 达成率视图（用于总公司预测图）
 */
export type ViewMode = 'proportion' | 'absolute' | 'growth' | 'achievement';

/**
 * 预警级别
 * - excellent: 优秀（增长率 ≥ 15%）
 * - normal: 正常（5% ≤ 增长率 < 15%）
 * - warning: 预警（0% ≤ 增长率 < 5%）
 * - danger: 危险（增长率 < 0%）
 */
export type WarningLevel = 'excellent' | 'normal' | 'warning' | 'danger';

/**
 * 时间单位索引类型
 */
export type QuarterIndex = 0 | 1 | 2 | 3;
export type MonthIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type PeriodIndex = QuarterIndex | MonthIndex;

/**
 * 季度和月份标签常量
 */
export const QUARTER_LABELS = ['一季度', '二季度', '三季度', '四季度'] as const;
export const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] as const;

/**
 * 通用图表输入数据（统一格式）
 *
 * 所有图表类型都需要转换为这个统一格式
 */
export interface UniversalChartInputData {
  /** 时间粒度 */
  timeGranularity: TimeGranularity;
  /** 值类型 */
  valueType: ValueType;
  /** 目标值数组（长度为4或12，根据timeGranularity决定） */
  targets: number[];
  /** 2025基准值数组（可能包含null） */
  baseline2025: (number | null)[];
  /** 当前值数组（可能包含null） */
  current: (number | null)[];
  /** 年度总目标 */
  totalTarget: number;
  /** 2025年度总实际 */
  totalBaseline2025: number;
  /** 增长率数组（可能包含null，可选） */
  growthSeries?: (number | null)[];
  /** 达成率数组（可能包含null，可选，用于总公司预测图） */
  achievementSeries?: (number | null)[];
  /** 自定义标签（可选，默认使用季度/月份标签） */
  customLabels?: string[];
}

/**
 * 周期详细数据（通用）
 */
export interface PeriodDetailData {
  /** 周期索引 */
  index: PeriodIndex;
  /** 周期标签 */
  label: string;
  /** 目标值 */
  target: number;
  /** 目标占比 */
  targetShare: number;
  /** 2025基准值 */
  baseline2025: number | null;
  /** 2025基准占比 */
  baselineShare2025: number | null;
  /** 当前值 */
  current: number | null;
  /** 增长率 */
  growth: number | null;
  /** 达成率（可选，用于总公司预测图） */
  achievement: number | null;
  /** 预警级别 */
  warningLevel: WarningLevel;
}

/**
 * 图表配置选项（扩展QuarterlyProportionChart的配置）
 */
export interface UniversalChartConfig {
  /** 图表高度（像素），默认 400 */
  height?: number;
  /** 是否显示详情面板，默认 true */
  showDetailPanel?: boolean;
  /** 默认视图模式 */
  defaultViewMode?: ViewMode;
  /** 是否启用动画，默认 true */
  animation?: boolean;
  /** 柱状图最大宽度（像素） */
  barMaxWidth?: number;
  /** 是否显示数据标签，默认 true */
  showDataLabel?: boolean;
  /** 图表标题（可选） */
  title?: string;
  /** 是否显示导出按钮，默认 true */
  showExportButtons?: boolean;
  /** 自定义Y轴名称（可选） */
  yAxisName?: string;
  /** 自定义右侧Y轴名称（可选，用于增长率） */
  rightYAxisName?: string;
}

/**
 * 组件 Props
 */
export interface UniversalChartProps {
  /** 图表类型（用于自动应用预设配置） */
  chartType?: ChartType;
  /** 图表输入数据 */
  data: UniversalChartInputData;
  /** 图表配置 */
  config?: UniversalChartConfig;
  /** 周期点击回调 */
  onPeriodClick?: (index: PeriodIndex, detail: PeriodDetailData) => void;
  /** 视图模式变化回调 */
  onViewModeChange?: (viewMode: ViewMode) => void;
  /** 额外的CSS类名 */
  className?: string;
}

/**
 * ECharts 图表选项类型
 */
export type EChartsOption = Record<string, unknown>;

/**
 * 处理后的图表数据（用于图表渲染）
 */
export interface ProcessedChartData {
  /** 目标占比数组 */
  targetShare: (number | null)[];
  /** 基准占比数组 */
  baselineShare: (number | null)[];
  /** 增长率数组 */
  growthSeries: (number | null)[];
  /** 达成率数组（可选） */
  achievementSeries?: (number | null)[];
  /** 周期详情数组 */
  periodDetails: PeriodDetailData[];
  /** X轴标签 */
  xAxisLabels: string[];
}

/**
 * 图表交互状态
 */
export interface ChartInteractionState {
  /** 当前选中的周期索引 */
  selectedPeriod: PeriodIndex | null;
  /** 当前视图模式 */
  viewMode: ViewMode;
  /** 是否显示详情面板 */
  showDetailPanel: boolean;
}

/**
 * 颜色配置
 */
export interface ColorScheme {
  /** 目标柱颜色 */
  target: {
    normal: string;
    gradient: [string, string];
    hover: string;
  };
  /** 实际柱颜色 */
  actual: {
    normal: string;
    hover: string;
  };
  /** 增长率颜色 */
  growth: {
    line: string;
    positive: string;
    neutral: string;
    negative: string;
  };
  /** 预警颜色 */
  warning: {
    orange: string;
    red: string;
  };
}

/**
 * Tooltip 格式化参数
 */
export interface TooltipFormatterParams {
  dataIndex: number;
  componentType: string;
  seriesType: string;
  seriesName: string;
  value: number | null;
  marker: string;
}

/**
 * 图表系列配置
 */
export interface SeriesConfig {
  name: string;
  type: 'bar' | 'line';
  data: (number | null)[];
  yAxisIndex?: number;
  itemStyle?: Record<string, unknown>;
  lineStyle?: Record<string, unknown>;
  label?: Record<string, unknown>;
  emphasis?: Record<string, unknown>;
}

/**
 * 数据适配器接口
 * 每个图表类型都需要实现自己的适配器
 */
export interface DataAdapter<TInput = unknown> {
  /**
   * 将特定图表的输入数据转换为通用格式
   */
  adapt(input: TInput): UniversalChartInputData;
}

/**
 * 配置预设接口
 */
export interface ConfigPreset {
  /**
   * 获取预设配置
   */
  getConfig(): Partial<UniversalChartConfig>;
}

/**
 * 验证图表数据是否有效
 */
export function isValidChartData(data: UniversalChartInputData): boolean {
  if (!data || typeof data !== 'object') return false;

  const {
    timeGranularity,
    valueType,
    targets,
    baseline2025,
    current,
    totalTarget,
    totalBaseline2025,
  } = data;

  // 检查时间粒度和值类型
  if (
    !['quarterly', 'monthly'].includes(timeGranularity) ||
    !['absolute', 'proportion', 'achievement'].includes(valueType)
  ) {
    return false;
  }

  // 根据时间粒度检查数组长度
  const expectedLength = timeGranularity === 'quarterly' ? 4 : 12;

  if (
    !Array.isArray(targets) ||
    targets.length !== expectedLength ||
    !Array.isArray(baseline2025) ||
    baseline2025.length !== expectedLength ||
    !Array.isArray(current) ||
    current.length !== expectedLength
  ) {
    return false;
  }

  // 检查数值类型
  if (typeof totalTarget !== 'number' || typeof totalBaseline2025 !== 'number') {
    return false;
  }

  // 检查目标值是否都有效
  if (targets.some((v) => typeof v !== 'number' || isNaN(v))) {
    return false;
  }

  return true;
}

/**
 * 获取周期标签
 */
export function getPeriodLabel(index: number, timeGranularity: TimeGranularity): string {
  if (timeGranularity === 'quarterly') {
    return QUARTER_LABELS[index as QuarterIndex] || `Q${index + 1}`;
  } else {
    return MONTH_LABELS[index as MonthIndex] || `${index + 1}月`;
  }
}

/**
 * 获取所有周期标签
 */
export function getAllPeriodLabels(timeGranularity: TimeGranularity): string[] {
  return timeGranularity === 'quarterly'
    ? [...QUARTER_LABELS]
    : [...MONTH_LABELS];
}
