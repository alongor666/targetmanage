/**
 * 格式化工具函数
 *
 * @description 数字、百分比、货币等格式化工具
 */

/**
 * 格式化百分比
 * @param value - 小数形式的百分比值（如 0.15 表示 15%）
 * @param decimals - 小数位数，默认 1
 * @returns 格式化后的百分比字符串
 *
 * @example
 * formatPercent(0.15) // "15.0%"
 * formatPercent(0.0556, 2) // "5.56%"
 * formatPercent(null) // "—"
 */
export function formatPercent(value: number | null, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 格式化数字（带千分位）
 * @param value - 要格式化的数字
 * @param decimals - 小数位数，默认 0
 * @returns 格式化后的数字字符串
 *
 * @example
 * formatNumber(1234567) // "1,234,567"
 * formatNumber(1234.56, 2) // "1,234.56"
 * formatNumber(null) // "—"
 */
export function formatNumber(value: number | null, decimals: number = 0): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 格式化货币
 * @param value - 金额
 * @param currency - 货币符号，默认 '¥'
 * @returns 格式化后的货币字符串
 *
 * @example
 * formatCurrency(1234567) // "¥1,234,567"
 * formatCurrency(1234.56) // "¥1,234.56"
 */
export function formatCurrency(value: number | null, currency: string = '¥'): string {
  const formatted = formatNumber(value, value !== null && !Number.isInteger(value) ? 2 : 0);
  return formatted !== '—' ? `${currency}${formatted}` : '—';
}

/**
 * 获取增长率趋势箭头
 * @param growth - 增长率（小数形式）
 * @returns 趋势箭头符号
 *
 * @example
 * getGrowthArrow(0.15) // "↗"
 * getGrowthArrow(0) // "→"
 * getGrowthArrow(-0.05) // "↘"
 */
export function getGrowthArrow(growth: number | null): string {
  if (growth === null || growth === undefined || isNaN(growth)) {
    return '—';
  }
  if (growth > 0) return '↗';
  if (growth < 0) return '↘';
  return '→';
}

/**
 * 格式化增长率（带箭头）
 * @param growth - 增长率（小数形式）
 * @param decimals - 小数位数，默认 2
 * @returns 格式化后的增长率字符串
 *
 * @example
 * formatGrowth(0.15) // "↗ 15.00%"
 * formatGrowth(-0.05, 1) // "↘ 5.0%"
 */
export function formatGrowth(growth: number | null, decimals: number = 2): string {
  const arrow = getGrowthArrow(growth);
  const percent = formatPercent(growth, decimals);
  return `${arrow} ${percent}`;
}

/**
 * 格式化季度数据
 * @param data - 季度详细数据
 * @returns 格式化后的数据对象
 */
export function formatQuarterData(data: {
  target: number;
  targetShare: number;
  actual2025: number | null;
  actualShare2025: number | null;
  current: number | null;
  growth: number | null;
}) {
  return {
    target: formatNumber(data.target),
    targetShare: formatPercent(data.targetShare),
    actual2025: formatNumber(data.actual2025),
    actualShare2025: formatPercent(data.actualShare2025),
    current: formatNumber(data.current),
    growth: formatGrowth(data.growth),
  };
}

/**
 * 格式化文件名（移除特殊字符）
 * @param filename - 原始文件名
 * @returns 安全的文件名
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '') // 移除不允许的字符
    .replace(/\s+/g, '_') // 空格替换为下划线
    .slice(0, 200); // 限制长度
}

/**
 * 格式化日期时间
 * @param date - 日期对象或时间戳
 * @param format - 格式类型
 * @returns 格式化后的日期字符串
 */
export function formatDateTime(
  date: Date | number,
  format: 'datetime' | 'date' | 'time' = 'datetime'
): string {
  const d = typeof date === 'number' ? new Date(date) : date;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'date':
      return `${year}-${month}-${day}`;
    case 'time':
      return `${hours}:${minutes}:${seconds}`;
    case 'datetime':
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}

/**
 * 格式化文件大小
 * @param bytes - 字节数
 * @returns 格式化后的大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 格式化时长（秒转换为时分秒）
 * @param seconds - 秒数
 * @returns 格式化后的时长字符串
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}小时${minutes}分${secs}秒`;
  } else if (minutes > 0) {
    return `${minutes}分${secs}秒`;
  } else {
    return `${secs}秒`;
  }
}

/**
 * 截断文本（添加省略号）
 * @param text - 原始文本
 * @param maxLength - 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * 高亮数值（根据正负值）
 * @param value - 数值
 * @returns 样式类名
 */
export function getValueColorClass(value: number | null): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'text-gray-400';
  }
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
}

/**
 * 格式化数值范围
 * @param min - 最小值
 * @param max - 最大值
 * @returns 格式化后的范围字符串
 */
export function formatRange(min: number, max: number): string {
  return `${formatNumber(min)} - ${formatNumber(max)}`;
}
