/**
 * 安全除法，避免除零错误
 * 当除数为0时返回null，UI显示"—"
 * @doc docs/business/指标定义规范.md:144-147
 *
 * @param n 分子
 * @param d 分母
 * @returns 除法结果，分母为0时返回null
 */
export function safeDivide(n: number, d: number): { value: number | null; reason?: string } {
  if (d === 0) return { value: null, reason: "division_by_zero" };
  return { value: n / d };
}

/**
 * 计算差值（增量）
 * @doc docs/business/指标定义规范.md:121-147
 *
 * @param a 当前值
 * @param b 基期值
 * @returns 差值
 */
export function diff(a: number, b: number) {
  return a - b;
}

/**
 * 计算增长率
 * @doc docs/business/指标定义规范.md:144-147
 *
 * @param current 当前值
 * @param base 基期值
 * @returns 增长率（小数），分母为0时返回null
 */
export function growthRate(current: number, base: number) {
  return safeDivide(current - base, base);
}
