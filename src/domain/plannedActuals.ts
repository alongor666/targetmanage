/**
 * 月度规划实际值生成逻辑
 *
 * @module domain/plannedActuals
 * @description 基于已有实际数据和时间进度口径，动态生成未来月份的规划实际值
 * @doc docs/business/目标分配规则.md
 */

import type { MonthlyActualRecord } from '@/schemas/types';

/**
 * 时间进度计算模式
 */
export type TimeProgressMode = 'linear' | 'weighted' | '2025-actual';

/**
 * 生成月度规划实际值
 *
 * @doc docs/business/目标分配规则.md
 * @description
 * 核心逻辑：
 * 1. 如果某月有真实数据 → 使用真实值
 * 2. 如果某月无真实数据 → 计算规划值
 *    - 计算剩余缺口 = 年度目标 - 已有实际总和
 *    - 根据时间进度口径，将缺口重新分配到未来月份
 *
 * @param annualTarget 年度目标
 * @param actualRecords 已有的月度实际数据记录（可能为空或部分月份）
 * @param progressMode 时间进度口径
 * @param weights 月度权重数组（weighted模式必需，长度12，总和1.0）
 * @param actuals2025 2025年月度实际数组（2025-actual模式必需，长度12）
 * @returns 12个月的规划实际值数组（已有真实数据月份使用真实值，其他月份使用规划值）
 *
 * @example
 * // 无实际数据场景
 * const planned = generateMonthlyPlannedActuals(
 *   120000,
 *   [],
 *   'linear'
 * );
 * // 返回: [10000, 10000, 10000, ..., 10000] （均分）
 *
 * @example
 * // 有1月实际数据场景
 * const planned = generateMonthlyPlannedActuals(
 *   120000,
 *   [{ year: 2026, month: 1, org_id: 'ALL', product: 'auto', actual: 5000 }],
 *   'weighted',
 *   [0.06, 0.07, 0.08, 0.09, 0.10, 0.11, 0.10, 0.09, 0.08, 0.07, 0.08, 0.07]
 * );
 * // 返回: [5000, 8564, 9787, ...] （1月真实值，2-12月按剩余缺口重新分配）
 */
export function generateMonthlyPlannedActuals(
  annualTarget: number,
  actualRecords: MonthlyActualRecord[],
  progressMode: TimeProgressMode,
  weights?: number[],
  actuals2025?: number[]
): (number | null)[] {
  // 参数验证
  if (progressMode === 'weighted' && (!weights || weights.length !== 12)) {
    console.warn('generateMonthlyPlannedActuals: weighted模式需要提供长度为12的权重数组');
    return Array(12).fill(null);
  }

  if (progressMode === '2025-actual' && (!actuals2025 || actuals2025.length !== 12)) {
    console.warn('generateMonthlyPlannedActuals: 2025-actual模式需要提供长度为12的2025年实际数据');
    return Array(12).fill(null);
  }

  // Step 1: 构建月度实际值映射（1-12月）
  const actualMap = new Map<number, number>();
  actualRecords.forEach((record) => {
    if (record.month >= 1 && record.month <= 12 && record.actual !== null) {
      actualMap.set(record.month, record.actual);
    }
  });

  // Step 2: 计算已有实际数据总和
  let actualSum = 0;
  for (const value of actualMap.values()) {
    actualSum += value;
  }

  // Step 3: 计算剩余缺口
  const remainingGap = annualTarget - actualSum;

  // Step 4: 识别未来月份（没有实际数据的月份）
  const futureMonths: number[] = [];
  for (let month = 1; month <= 12; month++) {
    if (!actualMap.has(month)) {
      futureMonths.push(month);
    }
  }

  // Step 5: 如果没有剩余缺口或没有未来月份，直接返回
  if (futureMonths.length === 0 || remainingGap <= 0) {
    return Array.from({ length: 12 }, (_, i) => actualMap.get(i + 1) ?? null);
  }

  // Step 6: 根据时间进度口径，计算未来月份的规划值
  const plannedValues = allocateRemainingGap(
    remainingGap,
    futureMonths,
    progressMode,
    weights,
    actuals2025
  );

  // Step 7: 合并真实值和规划值
  const result: (number | null)[] = [];
  for (let month = 1; month <= 12; month++) {
    if (actualMap.has(month)) {
      // 有真实数据，使用真实值
      result.push(actualMap.get(month)!);
    } else {
      // 无真实数据，使用规划值
      const plannedValue = plannedValues.get(month);
      result.push(plannedValue !== undefined ? plannedValue : null);
    }
  }

  return result;
}

/**
 * 将剩余缺口按时间进度口径分配到未来月份
 *
 * @param remainingGap 剩余缺口
 * @param futureMonths 未来月份列表（1-12）
 * @param progressMode 时间进度口径
 * @param weights 月度权重数组
 * @param actuals2025 2025年月度实际数组
 * @returns 未来月份的规划值映射（月份 → 规划值）
 */
function allocateRemainingGap(
  remainingGap: number,
  futureMonths: number[],
  progressMode: TimeProgressMode,
  weights?: number[],
  actuals2025?: number[]
): Map<number, number> {
  const result = new Map<number, number>();

  switch (progressMode) {
    case 'linear': {
      // 均分到未来月份
      const valuePerMonth = remainingGap / futureMonths.length;
      futureMonths.forEach((month) => {
        result.set(month, valuePerMonth);
      });
      break;
    }

    case 'weighted': {
      if (!weights || weights.length !== 12) {
        console.error('allocateRemainingGap: weighted模式缺少权重数组');
        break;
      }

      // 计算未来月份的权重总和
      const futureWeightsSum = futureMonths.reduce(
        (sum, month) => sum + (weights[month - 1] || 0),
        0
      );

      if (futureWeightsSum === 0) {
        console.error('allocateRemainingGap: 未来月份权重总和为0');
        break;
      }

      // 按权重比例分配
      futureMonths.forEach((month) => {
        const weight = weights[month - 1] || 0;
        const value = remainingGap * (weight / futureWeightsSum);
        result.set(month, value);
      });
      break;
    }

    case '2025-actual': {
      if (!actuals2025 || actuals2025.length !== 12) {
        console.error('allocateRemainingGap: 2025-actual模式缺少2025年实际数据');
        break;
      }

      // 计算未来月份在2025年的实际总和
      const future2025Sum = futureMonths.reduce(
        (sum, month) => sum + (actuals2025[month - 1] || 0),
        0
      );

      if (future2025Sum === 0) {
        console.error('allocateRemainingGap: 未来月份在2025年的实际总和为0');
        break;
      }

      // 按2025年实际分布比例分配
      futureMonths.forEach((month) => {
        const actual2025 = actuals2025[month - 1] || 0;
        const value = remainingGap * (actual2025 / future2025Sum);
        result.set(month, value);
      });
      break;
    }

    default:
      console.error(`allocateRemainingGap: 未知的时间进度模式 ${progressMode}`);
  }

  return result;
}

/**
 * 获取指定视角和产品的月度实际记录
 *
 * @param allRecords 所有月度实际记录
 * @param orgId 机构ID（'ALL' 表示全省）
 * @param product 产品类型
 * @returns 过滤后的记录
 */
export function filterMonthlyActuals(
  allRecords: MonthlyActualRecord[],
  orgId: string,
  product: string
): MonthlyActualRecord[] {
  return allRecords.filter(
    (record) => record.org_id === orgId && record.product === product
  );
}
