export type RoundingMode = "none" | "2dp" | "integer";

/** 年度 -> 12 个月度目标（按权重） */
export function allocateAnnualToMonthly(
  annual: number,
  weights: number[],
  rounding: RoundingMode = "none"
): number[] {
  const raw = weights.map((w) => annual * w);
  return applyRoundingAndBalance(raw, annual, rounding);
}

/** 把月度数组聚合为季度（4 个值） */
export function monthlyToQuarterly(monthly: number[]): number[] {
  return [0, 1, 2, 3].map((q) => monthly.slice(q * 3, q * 3 + 3).reduce((a, b) => a + b, 0));
}

/** 截至某月的年累计 */
export function monthlyToYtd(monthly: number[], month: number): number {
  const idx = Math.max(1, Math.min(12, month));
  return monthly.slice(0, idx).reduce((a, b) => a + b, 0);
}

function round(value: number, mode: RoundingMode): number {
  if (mode === "none") return value;
  if (mode === "integer") return Math.round(value);
  // 2dp
  return Math.round(value * 100) / 100;
}

/**
 * 先逐月四舍五入，再把误差回补到最后一个月，确保总和=annual
 * 适用于展示与对账；若你更偏好“分摊回补”，可替换策略
 */
function applyRoundingAndBalance(monthlyRaw: number[], annual: number, mode: RoundingMode): number[] {
  if (mode === "none") return monthlyRaw;

  const rounded = monthlyRaw.map((v) => round(v, mode));
  const sum = rounded.reduce((a, b) => a + b, 0);
  const diff = round(annual - sum, mode);

  // 回补到 12 月，保证对账
  const out = [...rounded];
  out[out.length - 1] = round(out[out.length - 1] + diff, mode);
  return out;
}
