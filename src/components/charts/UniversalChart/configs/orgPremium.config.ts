/**
 * 机构保费规划图 - 配置预设
 *
 * @module OrgPremiumConfig
 * @description 为三级机构保费规划图提供默认配置
 */

import type { UniversalChartConfig } from '../UniversalChart.types';

/**
 * 机构保费规划图默认配置
 */
export class OrgPremiumConfigPreset implements UniversalChartConfig {
  height = 400;
  showDetailPanel = true;
  animation = true;
  barMaxWidth = 36;
  showDataLabel = true;
  showExportButtons = true;
}

/**
 * 创建机构保费规划图配置
 */
export function createOrgPremiumConfig(): Partial<UniversalChartConfig> {
  return new OrgPremiumConfigPreset();
}
