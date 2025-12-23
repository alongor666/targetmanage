export function monthToQuarter(month: number): 1 | 2 | 3 | 4 {
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
}

/**
 * 年度线性进度 = m / 12
 * @param month 当前月份（1-12）
 */
export function linearProgressYear(month: number): number {
  return month / 12;
}

/**
 * 年度权重进度 = sum(weights[0..month-1])
 * @param weights 12个月权重数组，总和为1.0
 * @param month 当前月份（1-12）
 */
export function weightedProgressYear(weights: number[], month: number): number {
  const idx = Math.max(1, Math.min(12, month));
  const sum = weights.slice(0, idx).reduce((a, b) => a + b, 0);
  return sum;
}

/**
 * 季度线性进度 = (m - quarterStart + 1) / quarterMonths
 * @param month 当前月份（1-12）
 */
export function linearProgressQuarter(month: number): number {
  const q = monthToQuarter(month);
  const start = (q - 1) * 3 + 1;
  const elapsed = month - start + 1;
  return elapsed / 3;
}

/**
 * 季度权重进度 = sum(weights[quarterStart..month]) / sum(weights[quarterStart..quarterEnd])
 * @param weights 12个月权重数组
 * @param month 当前月份（1-12）
 */
export function weightedProgressQuarter(weights: number[], month: number): number {
  const q = monthToQuarter(month);
  const start = (q - 1) * 3; // 0-index
  const end = start + 3;
  const qWeights = weights.slice(start, end);
  const qTotal = qWeights.reduce((a, b) => a + b, 0);

  const mIdx = Math.max(1, Math.min(12, month));
  const within = mIdx - 1 - start + 1; // number of months in quarter elapsed
  const elapsedSum = qWeights.slice(0, within).reduce((a, b) => a + b, 0);
  return qTotal === 0 ? 0 : (elapsedSum / qTotal);
}

/**
 * 年度2025实际进度 = actuals2025[month-1] / sum(actuals2025[0..11])
 * @param actuals2025 2025年12个月实际数据数组（可能包含null）
 * @param month 当前月份（1-12）
 * @returns 当月占全年保费的占比（0-1），如果数据不足返回0
 */
export function actual2025ProgressYear(actuals2025: Array<number | null>, month: number): number {
  if (actuals2025.length !== 12) return 0;

  const idx = Math.max(1, Math.min(12, month));

  // 计算年度总计（过滤null值）
  const yearTotal = actuals2025.reduce((sum: number, v) => sum + (v ?? 0), 0);
  if (yearTotal === 0) return 0;

  // 获取当月数据
  const currentMonth = actuals2025[idx - 1];
  if (currentMonth === null || currentMonth === undefined) return 0;

  return currentMonth / yearTotal;
}

/**
 * 季度2025实际进度 = actuals2025[month-1] / sum(actuals2025[quarterStart..quarterEnd])
 * @param actuals2025 2025年12个月实际数据数组（可能包含null）
 * @param month 当前月份（1-12）
 * @returns 当月占季度保费的占比（0-1），如果数据不足返回0
 */
export function actual2025ProgressQuarter(actuals2025: Array<number | null>, month: number): number {
  if (actuals2025.length !== 12) return 0;

  const q = monthToQuarter(month);
  const start = (q - 1) * 3; // 0-index
  const end = start + 3;

  // 提取季度数据
  const qActuals = actuals2025.slice(start, end);
  const qTotal = qActuals.reduce((sum: number, v) => sum + (v ?? 0), 0);
  if (qTotal === 0) return 0;

  // 获取当月数据
  const mIdx = Math.max(1, Math.min(12, month));
  const currentMonth = actuals2025[mIdx - 1];
  if (currentMonth === null || currentMonth === undefined) return 0;

  return currentMonth / qTotal;
}
