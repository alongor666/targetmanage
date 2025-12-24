import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with proper precedence
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 *
 * @example
 * cn('px-2 py-1', condition && 'bg-blue-500', 'px-4')
 * // Returns: 'py-1 bg-blue-500 px-4' (px-4 overrides px-2)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ========== QUARTERLY STATUS SYSTEM ==========

/**
 * 季度状态等级
 * - excellent: 优秀（增长率≥12% 或 达成率≥105%）
 * - normal: 正常（增长率5-12% 或 达成率100-105%）
 * - warning: 预警（增长率0-5% 或 达成率95-100%）
 * - danger: 危险（增长率<0% 或 达成率<95%）
 */
export type QuarterlyStatus = 'excellent' | 'normal' | 'warning' | 'danger';

/**
 * 季度状态判断规则阈值
 */
export interface QuarterlyStatusRules {
  achievement: {
    excellent_min: number;  // 1.05 (105%)
    normal_min: number;     // 1.00 (100%)
    warning_min: number;    // 0.95 (95%)
  };
  growth: {
    excellent_min: number;  // 0.12 (12%)
    normal_min: number;     // 0.05 (5%)
  };
}

/**
 * 判断季度状态（基于增长率和达成率）
 *
 * 优先使用增长率判断，无基线数据时使用达成率
 *
 * 判断逻辑：
 * 1. 如果有增长率数据，优先使用增长率判断：
 *    - excellent: ≥12%
 *    - normal: 5-12%
 *    - warning: 0-5%
 *    - danger: <0%
 *
 * 2. 如果无增长率数据，使用达成率判断：
 *    - excellent: ≥105%
 *    - normal: 100-105%
 *    - warning: 95-100%
 *    - danger: <95%
 *
 * 3. 两者都无则返回normal
 *
 * @param achievementRate 达成率 (实际/目标，如1.08表示108%)
 * @param growthRate 增长率 ((实际-基线)/基线，如0.128表示12.8%)
 * @param rules 状态阈值规则
 * @returns 状态等级
 *
 * @example
 * // 使用增长率判断（优先）
 * getQuarterlyStatus(1.08, 0.15, rules) // 'excellent' (15% > 12%)
 * getQuarterlyStatus(0.98, 0.03, rules) // 'warning' (3% in 0-5%)
 * getQuarterlyStatus(1.02, -0.05, rules) // 'danger' (负增长)
 *
 * // 无增长率时使用达成率
 * getQuarterlyStatus(1.08, null, rules) // 'excellent' (108% > 105%)
 * getQuarterlyStatus(0.97, null, rules) // 'warning' (97% in 95-100%)
 */
export function getQuarterlyStatus(
  achievementRate: number | null,
  growthRate: number | null,
  rules: QuarterlyStatusRules
): QuarterlyStatus {
  // 空值保护
  if (growthRate === null && achievementRate === null) return 'normal';

  // 优先：增长率判断
  if (growthRate !== null) {
    if (growthRate >= rules.growth.excellent_min) return 'excellent';
    if (growthRate >= rules.growth.normal_min) return 'normal';
    if (growthRate >= 0) return 'warning';
    return 'danger';
  }

  // 备用：达成率判断（无基线数据时）
  if (achievementRate !== null) {
    if (achievementRate >= rules.achievement.excellent_min) return 'excellent';
    if (achievementRate >= rules.achievement.normal_min) return 'normal';
    if (achievementRate >= rules.achievement.warning_min) return 'warning';
    return 'danger';
  }

  return 'normal';
}
