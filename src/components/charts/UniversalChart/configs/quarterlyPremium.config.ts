/**
 * 季度保费规划图 - 配置预设
 *
 * @module QuarterlyPremiumConfig
 * @description 季度保费规划图的默认配置
 */

import type { UniversalChartConfig, ConfigPreset } from '../UniversalChart.types';

/**
 * 季度保费规划图配置预设
 */
export class QuarterlyPremiumConfigPreset implements ConfigPreset {
  getConfig(): Partial<UniversalChartConfig> {
    return {
      height: 400,
      showDetailPanel: true,
      defaultViewMode: 'absolute',
      animation: true,
      barMaxWidth: 60,
      showDataLabel: true,
      title: '全省季度保费规划图',
      showExportButtons: true,
      yAxisName: '保费（万元）',
      rightYAxisName: '同比增长率',
    };
  }
}

/**
 * 便捷工厂函数：创建季度保费配置预设
 */
export function createQuarterlyPremiumConfig(): Partial<UniversalChartConfig> {
  return new QuarterlyPremiumConfigPreset().getConfig();
}
