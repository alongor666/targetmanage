/**
 * 工具函数 - 公共导出
 *
 * @module Utils
 * @description 复用QuarterlyProportionChart的工具函数
 */

// 从QuarterlyProportionChart导入所有工具函数
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
} from '../../QuarterlyProportionChart/utils/formatter';

export {
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
} from '../../QuarterlyProportionChart/utils/colorUtils';

export {
  exportToCSV,
  exportToImage,
  exportQuarterDetails,
  exportToJSON,
  printChart,
  copyToClipboard,
  generateReport,
} from '../../QuarterlyProportionChart/utils/export';
