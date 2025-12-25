/**
 * 增长率与增量计算引擎
 * @doc docs/business/指标定义规范.md:121-147
 */

import { safeDivide } from "./achievement";

/**
 * 增长率与增量指标类型定义
 */
export type GrowthMetrics = {
  // === 增长率（同比）===
  growth_month_rate: number | null;      // 当月同比增长率
  growth_quarter_rate: number | null;    // 当季同比增长率
  growth_ytd_rate: number | null;        // 年累计同比增长率

  // === 增量（绝对差值）===
  inc_month: number | null;              // 当月增量（万元）
  inc_quarter: number | null;            // 当季增量（万元）
  inc_ytd: number | null;                // 年累计增量（万元）

  // === 元数据 ===
  reason?: string;                       // null原因码（如 division_by_zero）
};

type MaybeNumber = number | null;

function safeSubtract(a: MaybeNumber, b: MaybeNumber): MaybeNumber {
  if (a === null || b === null) return null;
  return a - b;
}

function safeGrowthRate(current: MaybeNumber, baseline: MaybeNumber): { value: MaybeNumber; reason?: string } {
  if (current === null) return { value: null, reason: "no_current_data" };
  if (baseline === null) return { value: null, reason: "no_baseline_data" };
  return safeDivide(current - baseline, baseline);
}

/**
 * 计算增长指标（月/季/年三种口径）
 * 分母为0时返回null，UI显示"—"
 * @doc docs/business/指标定义规范.md:121-147
 *
 * @param current 当前年度数据（当月、当季、年累计）
 * @param baseline 基期年度数据（当月、当季、年累计）
 * @returns 增长指标对象
 */
export function calculateGrowthMetrics(
  current: { month: MaybeNumber; quarter: MaybeNumber; ytd: MaybeNumber },
  baseline: { month: MaybeNumber; quarter: MaybeNumber; ytd: MaybeNumber }
): GrowthMetrics {
  // 计算增长率（使用安全除法 + 无基期数据保护）
  const growth_month = safeGrowthRate(current.month, baseline.month);
  const growth_quarter = safeGrowthRate(current.quarter, baseline.quarter);
  const growth_ytd = safeGrowthRate(current.ytd, baseline.ytd);

  return {
    growth_month_rate: growth_month.value,
    growth_quarter_rate: growth_quarter.value,
    growth_ytd_rate: growth_ytd.value,

    inc_month: safeSubtract(current.month, baseline.month),
    inc_quarter: safeSubtract(current.quarter, baseline.quarter),
    inc_ytd: safeSubtract(current.ytd, baseline.ytd),

    reason: growth_month.reason || growth_quarter.reason || growth_ytd.reason,
  };
}

/**
 * 格式化增长率为显示文本
 * @doc docs/business/指标定义规范.md:121-147
 * @param rate 增长率数值
 * @returns 格式化后的字符串（null转为"—"）
 */
export function formatGrowthRate(rate: number | null): string {
  if (rate === null) return "—";
  return `${(rate * 100).toFixed(1)}%`;
}

/**
 * 格式化增量为显示文本
 * @doc docs/business/指标定义规范.md:121-147
 * @param inc 增量数值（万元）
 * @returns 格式化后的字符串（null转为"—"）
 */
export function formatIncrement(inc: number | null): string {
  if (inc === null) return "—";
  return `${inc.toFixed(0)}`;
}
