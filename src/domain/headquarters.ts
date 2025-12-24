import type { HeadquartersTargetRecord } from "@/schemas/types";
import { safeDivide } from "./achievement";

/**
 * 总公司目标达成预测
 * @doc docs/business/指标定义规范.md
 *
 * 基于三级机构的实际达成情况，预测四川分公司对总公司目标的完成度
 */

/**
 * 计算总公司目标达成率
 * @param actualValue 实际完成值（三级机构聚合）
 * @param hqTarget 总公司目标值
 * @returns 达成率（百分比形式，如 0.95 表示 95%）
 */
export function calculateHqAchievementRate(
  actualValue: number,
  hqTarget: number
): { value: number | null; reason?: string } {
  return safeDivide(actualValue, hqTarget);
}

/**
 * 计算总公司目标差距
 * @param actualValue 实际完成值
 * @param hqTarget 总公司目标值
 * @returns 差距值（正数表示超额完成，负数表示未达标）
 */
export function calculateHqGap(
  actualValue: number,
  hqTarget: number
): number {
  return actualValue - hqTarget;
}

/**
 * 按产品聚合总公司目标
 * @param records 总公司目标记录数组
 * @returns 按产品分组的目标值映射
 */
export function aggregateHqTargetsByProduct(
  records: HeadquartersTargetRecord[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (const record of records) {
    if (record.product === "health") continue;
    map.set(record.product, record.annual_target);
  }
  // 计算total
  const total = Array.from(map.values()).reduce((sum, val) => sum + val, 0);
  map.set("total", total);
  return map;
}

/**
 * 预测月度/季度达成情况
 * @param monthlyActuals 月度实际数据数组（单产品）
 * @param annualHqTarget 总公司年度目标
 * @param weights 月度权重数组（可选，用于加权计算）
 * @returns 每月的预测达成率数组
 */
export function predictMonthlyHqAchievement(
  monthlyActuals: Array<number | null>,
  annualHqTarget: number,
  weights?: number[]
): Array<{ month: number; cumActual: number; cumTarget: number; rate: number | null }> {
  const result: Array<{ month: number; cumActual: number; cumTarget: number; rate: number | null }> = [];
  let cumActual = 0;

  for (let i = 0; i < 12; i++) {
    const monthValue = monthlyActuals[i] ?? 0;
    cumActual += monthValue;

    // 计算累计应完成目标（根据线性或权重）
    const progress = weights
      ? weights.slice(0, i + 1).reduce((sum, w) => sum + w, 0)
      : (i + 1) / 12;

    const cumTarget = annualHqTarget * progress;
    const { value: rate } = safeDivide(cumActual, cumTarget);

    result.push({
      month: i + 1,
      cumActual,
      cumTarget,
      rate,
    });
  }

  return result;
}

/**
 * 计算季度预测达成率
 * @param quarterActual 季度实际完成值
 * @param quarterHqTarget 总公司季度目标
 * @returns 季度达成率
 */
export function calculateQuarterHqAchievementRate(
  quarterActual: number,
  quarterHqTarget: number
): { value: number | null; reason?: string } {
  return safeDivide(quarterActual, quarterHqTarget);
}
