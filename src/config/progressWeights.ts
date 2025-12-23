/**
 * 默认月度权重配置（可由用户在设置页调整）
 * 总和 = 100% (1.0)
 */
export const DEFAULT_MONTHLY_WEIGHTS = [
  0.070, // 1月 - 7.0%
  0.073, // 2月 - 7.3%
  0.092, // 3月 - 9.2%
  0.088, // 4月 - 8.8%
  0.094, // 5月 - 9.4%
  0.099, // 6月 - 9.9%
  0.066, // 7月 - 6.6%
  0.066, // 8月 - 6.6%
  0.068, // 9月 - 6.8%
  0.083, // 10月 - 8.3%
  0.083, // 11月 - 8.3%
  0.118, // 12月 - 11.8%
] as const;

/**
 * 默认季度权重配置（派生）
 */
export const DEFAULT_QUARTERLY_WEIGHTS = {
  Q1: 0.27, // 27%（1-3月）
  Q2: 0.28, // 28%（4-6月）
  Q3: 0.20, // 20%（7-9月）
  Q4: 0.25, // 25%（10-12月）
} as const;

/**
 * 验证权重数组总和是否为1（容差1e-6）
 * @param weights 权重数组
 * @returns 是否有效
 */
export function validateWeightsSum(weights: number[]): boolean {
  const sum = weights.reduce((a, b) => a + b, 0);
  return Math.abs(sum - 1.0) < 1e-6;
}

/**
 * 根据月度权重计算季度权重
 * @param monthlyWeights 月度权重数组
 * @returns 季度权重对象
 */
export function calculateQuarterlyWeights(monthlyWeights: number[]): {
  Q1: number;
  Q2: number;
  Q3: number;
  Q4: number;
} {
  return {
    Q1: monthlyWeights.slice(0, 3).reduce((a, b) => a + b, 0),
    Q2: monthlyWeights.slice(3, 6).reduce((a, b) => a + b, 0),
    Q3: monthlyWeights.slice(6, 9).reduce((a, b) => a + b, 0),
    Q4: monthlyWeights.slice(9, 12).reduce((a, b) => a + b, 0),
  };
}