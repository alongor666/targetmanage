/**
 * 数据适配器 - 共享工具函数
 *
 * @module SharedAdapter
 * @description 提供数据转换、增长率计算等共享功能
 */

import type { WarningLevel, UniversalChartInputData } from '../UniversalChart.types';

/**
 * 计算增长率
 *
 * @param current 当前值
 * @param baseline 基准值
 * @returns 增长率（0-1之间的小数）或null（如果基准值为0或null）
 *
 * @example
 * calculateGrowthRate(120, 100) // 返回 0.2 (20%增长)
 * calculateGrowthRate(80, 100) // 返回 -0.2 (-20%下降)
 * calculateGrowthRate(100, 0) // 返回 null
 */
export function calculateGrowthRate(
  current: number | null,
  baseline: number | null
): number | null {
  if (current === null || baseline === null || baseline === 0) {
    return null;
  }
  return (current - baseline) / baseline;
}

/**
 * 计算达成率
 *
 * @param actual 实际值
 * @param target 目标值
 * @returns 达成率（0-1之间的小数）或null（如果目标值为0或null）
 *
 * @example
 * calculateAchievementRate(120, 100) // 返回 1.2 (120%达成)
 * calculateAchievementRate(80, 100) // 返回 0.8 (80%达成)
 */
export function calculateAchievementRate(
  actual: number | null,
  target: number | null
): number | null {
  if (actual === null || target === null || target === 0) {
    return null;
  }
  return actual / target;
}

/**
 * 计算占比
 *
 * @param value 当前值
 * @param total 总值
 * @returns 占比（0-1之间的小数）或null（如果总值为0或null）
 *
 * @example
 * calculateShare(25, 100) // 返回 0.25 (25%)
 * calculateShare(50, 0) // 返回 null
 */
export function calculateShare(value: number | null, total: number): number | null {
  if (value === null || total === 0) {
    return null;
  }
  return value / total;
}

/**
 * 根据增长率确定预警级别
 *
 * @param growthRate 增长率（0-1之间的小数，可能为null）
 * @returns 预警级别
 *
 * 规则：
 * - excellent: 增长率 ≥ 15%
 * - normal: 5% ≤ 增长率 < 15%
 * - warning: 0% ≤ 增长率 < 5%
 * - danger: 增长率 < 0%
 */
export function getWarningLevel(growthRate: number | null): WarningLevel {
  if (growthRate === null) return 'normal';

  if (growthRate >= 0.15) return 'excellent';
  if (growthRate >= 0.05) return 'normal';
  if (growthRate >= 0) return 'warning';
  return 'danger';
}

/**
 * 批量计算增长率数组
 *
 * @param currentArray 当前值数组
 * @param baselineArray 基准值数组
 * @returns 增长率数组
 */
export function calculateGrowthRateArray(
  currentArray: (number | null)[],
  baselineArray: (number | null)[]
): (number | null)[] {
  if (currentArray.length !== baselineArray.length) {
    console.warn('calculateGrowthRateArray: 数组长度不匹配');
    return currentArray.map(() => null);
  }

  return currentArray.map((current, index) => {
    const baseline = baselineArray[index];
    return calculateGrowthRate(current, baseline);
  });
}

/**
 * 批量计算达成率数组
 *
 * @param actualArray 实际值数组
 * @param targetArray 目标值数组
 * @returns 达成率数组
 */
export function calculateAchievementRateArray(
  actualArray: (number | null)[],
  targetArray: number[]
): (number | null)[] {
  if (actualArray.length !== targetArray.length) {
    console.warn('calculateAchievementRateArray: 数组长度不匹配');
    return actualArray.map(() => null);
  }

  return actualArray.map((actual, index) => {
    const target = targetArray[index];
    return calculateAchievementRate(actual, target);
  });
}

/**
 * 批量计算占比数组
 *
 * @param valueArray 值数组
 * @param total 总值
 * @returns 占比数组
 */
export function calculateShareArray(
  valueArray: (number | null)[],
  total: number
): (number | null)[] {
  return valueArray.map((value) => calculateShare(value, total));
}

/**
 * 验证数组长度是否符合时间粒度要求
 *
 * @param array 要验证的数组
 * @param expectedLength 期望长度（4或12）
 * @param arrayName 数组名称（用于错误消息）
 * @returns 是否有效
 */
export function validateArrayLength(
  array: unknown[],
  expectedLength: number,
  arrayName: string
): boolean {
  if (!Array.isArray(array)) {
    console.error(`${arrayName} 不是数组`);
    return false;
  }

  if (array.length !== expectedLength) {
    console.error(
      `${arrayName} 长度不正确: 期望 ${expectedLength}, 实际 ${array.length}`
    );
    return false;
  }

  return true;
}

/**
 * 填充缺失的增长率数据（如果未提供）
 *
 * @param data 输入数据
 * @returns 补充了增长率的数据
 */
export function ensureGrowthSeries(
  data: UniversalChartInputData
): UniversalChartInputData {
  if (data.growthSeries && data.growthSeries.length > 0) {
    return data;
  }

  // 自动计算增长率
  const growthSeries = calculateGrowthRateArray(data.current, data.baseline2025);

  return {
    ...data,
    growthSeries,
  };
}

/**
 * 填充缺失的达成率数据（如果未提供）
 *
 * @param data 输入数据
 * @returns 补充了达成率的数据
 */
export function ensureAchievementSeries(
  data: UniversalChartInputData
): UniversalChartInputData {
  if (data.achievementSeries && data.achievementSeries.length > 0) {
    return data;
  }

  // 自动计算达成率
  const achievementSeries = calculateAchievementRateArray(data.current, data.targets);

  return {
    ...data,
    achievementSeries,
  };
}
