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
