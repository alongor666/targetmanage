/**
 * 图表配置预设 - 公共导出
 *
 * @module Configs
 * @description 提供所有图表配置预设的统一导出入口
 */

import type { ChartType, UniversalChartConfig } from '../UniversalChart.types';
import { createQuarterlyPremiumConfig as createQPConfig } from './quarterlyPremium.config';
import { createQuarterlyShareConfig as createQSConfig } from './quarterlyShare.config';
import { createMonthlyPremiumConfig as createMPConfig } from './monthlyPremium.config';
import { createMonthlyShareConfig as createMSConfig } from './monthlyShare.config';
import { createHqPredictionConfig as createHQConfig } from './hqPrediction.config';
import { createOrgPremiumConfig as createOPConfig } from './orgPremium.config';

// 季度保费配置
export {
  QuarterlyPremiumConfigPreset,
  createQuarterlyPremiumConfig,
} from './quarterlyPremium.config';

// 季度占比配置
export {
  QuarterlyShareConfigPreset,
  createQuarterlyShareConfig,
} from './quarterlyShare.config';

// 月度保费配置
export {
  MonthlyPremiumConfigPreset,
  createMonthlyPremiumConfig,
} from './monthlyPremium.config';

// 月度占比配置
export {
  MonthlyShareConfigPreset,
  createMonthlyShareConfig,
} from './monthlyShare.config';

// 总公司预测配置
export {
  HqPredictionConfigPreset,
  createHqPredictionConfig,
} from './hqPrediction.config';

// 机构保费配置
export {
  OrgPremiumConfigPreset,
  createOrgPremiumConfig,
} from './orgPremium.config';

/**
 * 根据图表类型获取预设配置
 *
 * @param chartType 图表类型
 * @returns 预设配置对象
 */
export function getPresetConfig(chartType: ChartType): Partial<UniversalChartConfig> {
  switch (chartType) {
    case 'quarterlyPremium':
      return createQPConfig();
    case 'quarterlyShare':
      return createQSConfig();
    case 'monthlyPremium':
      return createMPConfig();
    case 'monthlyShare':
      return createMSConfig();
    case 'hqPrediction':
      return createHQConfig();
    case 'orgPremium':
      return createOPConfig();
    default:
      console.warn(`未知的图表类型: ${chartType}`);
      return {};
  }
}

/**
 * 深度合并配置对象
 *
 * @param preset 预设配置
 * @param custom 自定义配置
 * @returns 合并后的配置
 */
export function mergeConfig(
  preset: Partial<UniversalChartConfig>,
  custom?: Partial<UniversalChartConfig>
): Partial<UniversalChartConfig> {
  if (!custom) return preset;

  return {
    ...preset,
    ...custom,
  };
}
