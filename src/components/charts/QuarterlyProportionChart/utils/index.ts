/**
 * 工具函数导出
 *
 * @description 导出所有工具函数供外部使用
 */

// 格式化工具
export {
  formatPercent,
  formatNumber,
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
} from './formatter';

// 颜色工具
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
} from './colorUtils';

// 导出工具
export {
  exportToCSV,
  exportToImage,
  exportQuarterDetails,
  exportToJSON,
  printChart,
  copyToClipboard,
  generateReport,
} from './export';
