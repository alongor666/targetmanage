/**
 * Threshold Rules Configuration
 *
 * Default threshold rules for achievement rate and growth rate status determination.
 *
 * Status Determination Logic:
 *
 * Achievement Rate (达成率):
 * - Excellent (优秀): rate >= good_min (e.g., >= 105%)
 * - Normal (正常): 1 <= rate < good_min (e.g., 100% - 105%)
 * - Warning (预警): warning_min <= rate < 1 (e.g., 95% - 100%)
 * - Danger (危险): rate < warning_min (e.g., < 95%)
 *
 * Growth Rate (增长率):
 * - Excellent (优秀): rate >= good_min (e.g., >= 12%)
 * - Normal (正常): warning_min <= rate < good_min (e.g., 5% - 12%)
 * - Warning (预警): 0 <= rate < warning_min (e.g., 0% - 5%)
 * - Danger (危险): rate < 0 (negative growth)
 *
 * @doc docs/business/指标定义规范.md
 */

import type { ThresholdRule } from '@/schemas/types';

/**
 * Default threshold rules
 * Users can configure these values in the Rules page
 */
export const DEFAULT_THRESHOLD_RULES: ThresholdRule = {
  rule_id: 'THRESHOLD_GLOBAL_2026_DEFAULT',
  scope: 'global',

  achievement: {
    good_min: 1.05,      // 105% - 优秀
    warning_min: 0.95,   // 95% - 预警线
  },

  growth: {
    good_min: 0.12,      // 12% - 优秀
    warning_min: 0.05,   // 5% - 预警线
  },

  notes_cn: '默认阈值规则：达成率≥105%优秀，100-105%正常，95-100%预警，<95%危险；增长率≥12%优秀，5-12%正常，0-5%预警，<0%危险',
};

/**
 * Get achievement status based on rate and thresholds
 * @param rate - Achievement rate (decimal, e.g., 0.95 for 95%)
 * @param thresholds - Threshold configuration
 * @returns Status variant: 'good' | 'normal' | 'warning' | 'danger'
 */
export function getAchievementStatus(
  rate: number,
  thresholds: ThresholdRule['achievement'] = DEFAULT_THRESHOLD_RULES.achievement
): 'good' | 'normal' | 'warning' | 'danger' {
  if (rate >= thresholds.good_min) return 'good';
  if (rate >= 1) return 'normal';
  if (rate >= thresholds.warning_min) return 'warning';
  return 'danger';
}

/**
 * Get growth status based on rate and thresholds
 * @param rate - Growth rate (decimal, e.g., 0.12 for 12%)
 * @param thresholds - Threshold configuration
 * @returns Status variant: 'good' | 'normal' | 'warning' | 'danger'
 */
export function getGrowthStatus(
  rate: number,
  thresholds: ThresholdRule['growth'] = DEFAULT_THRESHOLD_RULES.growth
): 'good' | 'normal' | 'warning' | 'danger' {
  if (rate >= thresholds.good_min) return 'good';
  if (rate >= thresholds.warning_min) return 'normal';
  if (rate >= 0) return 'warning';
  return 'danger';
}
