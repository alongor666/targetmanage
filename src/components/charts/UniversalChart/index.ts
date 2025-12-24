/**
 * UniversalChart - 公共API导出
 *
 * @module UniversalChart
 * @description 通用图表组件的统一导出入口
 */

// 主组件
export { UniversalChart, default } from './UniversalChart';

// 类型定义
export type {
  UniversalChartProps,
  UniversalChartInputData,
  UniversalChartConfig,
  ProcessedChartData,
  PeriodDetailData,
  ChartInteractionState,
  TimeGranularity,
  ValueType,
  ChartType,
  ViewMode,
  WarningLevel,
  PeriodIndex,
  QuarterIndex,
  MonthIndex,
  ColorScheme,
  SeriesConfig,
  EChartsOption,
  DataAdapter,
  ConfigPreset,
} from './UniversalChart.types';

export {
  isValidChartData,
  getPeriodLabel,
  getAllPeriodLabels,
  QUARTER_LABELS,
  MONTH_LABELS,
} from './UniversalChart.types';

// 数据适配器
export {
  // 共享工具
  calculateGrowthRate,
  calculateAchievementRate,
  calculateShare,
  getWarningLevel,
  calculateGrowthRateArray,
  calculateAchievementRateArray,
  calculateShareArray,
  validateArrayLength,
  ensureGrowthSeries,
  ensureAchievementSeries,

  // 季度适配器
  QuarterlyPremiumAdapter,
  QuarterlyShareAdapter,
  createQuarterlyPremiumAdapter,
  createQuarterlyShareAdapter,

  // 月度适配器
  MonthlyPremiumAdapter,
  MonthlyShareAdapter,
  createMonthlyPremiumAdapter,
  createMonthlyShareAdapter,

  // 总公司预测适配器
  HqPredictionAdapter,
  createHqPredictionAdapter,
  calculateCumulative,
  reverseCalculateCumulative,
} from './adapters';

export type {
  QuarterlyDataInput,
  MonthlyDataInput,
  HqPredictionDataInput,
} from './adapters';

// 配置预设
export {
  QuarterlyPremiumConfigPreset,
  createQuarterlyPremiumConfig,
  QuarterlyShareConfigPreset,
  createQuarterlyShareConfig,
  MonthlyPremiumConfigPreset,
  createMonthlyPremiumConfig,
  MonthlyShareConfigPreset,
  createMonthlyShareConfig,
  HqPredictionConfigPreset,
  createHqPredictionConfig,
  getPresetConfig,
  mergeConfig,
} from './configs';

// Hooks
export { useUniversalData } from './hooks/useUniversalData';
export { useUniversalConfig } from './hooks/useUniversalConfig';
export { useChartInteractions } from './hooks/useChartInteractions';

// 工具函数（从QuarterlyProportionChart复用）
export {
  formatNumber,
  formatPercent,
  formatCurrency,
  getGrowthArrow,
  formatGrowth,
  formatQuarterData,
  sanitizeFilename,
  formatDateTime,
  formatFileSize,
  formatDuration,
  truncateText,
  getValueColorClass,
  formatRange,
  DEFAULT_COLORS,
  WARNING_LEVEL_COLORS,
  getWarningLevelColor,
  getWarningLevelByGrowth,
  getGrowthColorClass,
  adjustBrightness,
  hexToRgba,
  createGradient,
  getHeatmapColor,
  isDarkColor,
  getContrastColor,
  blendColors,
  withOpacity,
  generatePalette,
  exportToCSV,
  exportToImage,
  exportQuarterDetails,
  exportToJSON,
  printChart,
  copyToClipboard,
  generateReport,
} from './utils';
