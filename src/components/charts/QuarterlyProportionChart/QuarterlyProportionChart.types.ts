/**
 * 季度占比规划图 - 类型定义
 *
 * @component QuarterlyProportionChart
 * @description 可复用的季度占比规划图表组件
 */

/**
 * 视图模式枚举
 * - proportion: 占比视图（显示百分比）
 * - absolute: 绝对值视图（显示实际数值）
 * - growth: 增长率聚焦视图（突出显示增长率）
 */
export type ViewMode = 'proportion' | 'absolute' | 'growth';

/**
 * 预警级别
 * - excellent: 优秀（增长率 ≥ 15%）
 * - normal: 正常（5% ≤ 增长率 < 15%）
 * - warning: 预警（0% ≤ 增长率 < 5%）
 * - danger: 危险（增长率 < 0%）
 */
export type WarningLevel = 'excellent' | 'normal' | 'warning' | 'danger';

/**
 * 季度索引类型（0-3，对应Q1-Q4）
 */
export type QuarterIndex = 0 | 1 | 2 | 3;

/**
 * 季度标签
 */
export const QUARTER_LABELS = ['一季度', '二季度', '三季度', '四季度'] as const;

/**
 * 季度详细数据
 */
export interface QuarterDetailData {
  /** 季度索引 */
  quarter: QuarterIndex;
  /** 季度标签 */
  quarterLabel: string;
  /** 2026目标值 */
  target: number;
  /** 2026规划占比 */
  targetShare: number;
  /** 2025实际值 */
  actual2025: number | null;
  /** 2025实际占比 */
  actualShare2025: number | null;
  /** 当前实际值 */
  current: number | null;
  /** 增长率 */
  growth: number | null;
  /** 预警级别 */
  warningLevel: WarningLevel;
}

/**
 * 季度占比数据输入
 */
export interface QuarterlyProportionData {
  /** 2026季度目标值数组（长度为4） */
  quarterlyTargets: number[];
  /** 2025季度实际值数组（长度为4，可能包含null） */
  quarterlyActuals2025: (number | null)[];
  /** 当前季度实际值数组（长度为4，可能包含null） */
  quarterlyCurrent: (number | null)[];
  /** 2026年度总目标 */
  totalTarget: number;
  /** 2025年度总实际 */
  totalActual2025: number;
  /** 增长率数组（长度为4，可能包含null） */
  growthSeries: (number | null)[];
}

/**
 * 图表配置选项
 */
export interface ChartConfig {
  /** 图表高度（像素），默认 400 */
  height?: number;
  /** 是否显示详情面板，默认 true */
  showDetailPanel?: boolean;
  /** 默认视图模式，默认 'proportion' */
  defaultViewMode?: ViewMode;
  /** 是否启用动画，默认 true */
  animation?: boolean;
  /** 柱状图最大宽度（像素），默认 60 */
  barMaxWidth?: number;
  /** 是否显示数据标签，默认 true */
  showDataLabel?: boolean;
}

/**
 * 组件 Props
 */
export interface QuarterlyProportionChartProps {
  /** 季度占比数据 */
  data: QuarterlyProportionData;
  /** 图表配置 */
  config?: ChartConfig;
  /** 季度点击回调 */
  onQuarterClick?: (quarter: QuarterIndex, detail: QuarterDetailData) => void;
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
 * 处理后的季度数据（用于图表渲染）
 */
export interface ProcessedQuarterData {
  /** 2026规划占比数组 */
  targetShare: (number | null)[];
  /** 2025实际占比数组 */
  actualShare: (number | null)[];
  /** 增长率数组 */
  growthSeries: (number | null)[];
  /** 季度详情数组 */
  quarterDetails: QuarterDetailData[];
}

/**
 * 图表交互状态
 */
export interface ChartInteractionState {
  /** 当前选中的季度索引 */
  selectedQuarter: QuarterIndex | null;
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
}

/**
 * 验证季度数据是否有效
 */
export function isValidQuarterData(data: QuarterlyProportionData): boolean {
  if (!data || typeof data !== 'object') return false;

  const {
    quarterlyTargets,
    quarterlyActuals2025,
    quarterlyCurrent,
    totalTarget,
    totalActual2025,
    growthSeries,
  } = data;

  // 检查数组长度
  if (
    !Array.isArray(quarterlyTargets) ||
    quarterlyTargets.length !== 4 ||
    !Array.isArray(quarterlyActuals2025) ||
    quarterlyActuals2025.length !== 4 ||
    !Array.isArray(quarterlyCurrent) ||
    quarterlyCurrent.length !== 4 ||
    !Array.isArray(growthSeries) ||
    growthSeries.length !== 4
  ) {
    return false;
  }

  // 检查数值类型
  if (typeof totalTarget !== 'number' || typeof totalActual2025 !== 'number') {
    return false;
  }

  // 检查目标值是否都有效
  if (quarterlyTargets.some((v) => typeof v !== 'number' || isNaN(v))) {
    return false;
  }

  return true;
}
