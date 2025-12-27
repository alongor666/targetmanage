/**
 * 数据适配器层 - 公共导出
 *
 * @module Adapters
 * @description 提供所有数据适配器的统一导出入口
 */

// 共享工具函数
export {
  calculateGrowthRate,
  calculateAchievementRate,
  calculateShare,
  getWarningLevel,
  calculateGrowthRateArray,
  calculateAchievementRateArray,
  calculateShareArray,
  validateArrayLength,
  ensureGrowthSeries,
  ensureAchievementSeries,
} from './shared.adapter';

// 季度数据适配器
export {
  QuarterlyPremiumAdapter,
  QuarterlyShareAdapter,
  createQuarterlyPremiumAdapter,
  createQuarterlyShareAdapter,
} from './quarterly.adapter';
export type { QuarterlyDataInput } from './quarterly.adapter';

// 月度数据适配器
export {
  MonthlyPremiumAdapter,
  MonthlyShareAdapter,
  createMonthlyPremiumAdapter,
  createMonthlyShareAdapter,
} from './monthly.adapter';
export type { MonthlyDataInput } from './monthly.adapter';

// 总公司预测数据适配器
export {
  HqPredictionAdapter,
  createHqPredictionAdapter,
  calculateCumulative,
  reverseCalculateCumulative,
} from './hqPrediction.adapter';
export type { HqPredictionDataInput } from './hqPrediction.adapter';

// 机构数据适配器
export {
  OrganizationPremiumAdapter,
  createOrganizationPremiumAdapter,
} from './organization.adapter';
export type { OrganizationDataInput } from './organization.adapter';

// 季度达成数据适配器
export {
  QuarterlyAchievementAdapter,
  createQuarterlyAchievementAdapter,
} from './quarterlyAchievement.adapter';
export type { QuarterlyAchievementDataInput } from './quarterlyAchievement.adapter';

// 月度达成数据适配器
export {
  MonthlyAchievementAdapter,
  createMonthlyAchievementAdapter,
} from './monthlyAchievement.adapter';
export type { MonthlyAchievementDataInput } from './monthlyAchievement.adapter';
