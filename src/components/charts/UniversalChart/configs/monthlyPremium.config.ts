/**
 * 月度保费规划图 - 配置预设
 *
 * @module MonthlyPremiumConfig
 * @description 月度保费规划图的默认配置
 */

import type { UniversalChartConfig, ConfigPreset } from '../UniversalChart.types';

/**
 * 月度保费规划图配置预设
 */
export class MonthlyPremiumConfigPreset implements ConfigPreset {
  getConfig(): Partial<UniversalChartConfig> {
    return {
      height: 360,
      showDetailPanel: true,
      defaultViewMode: 'absolute',
      animation: true,
      barMaxWidth: 40, // 月度数据柱宽较小
      showDataLabel: false, // 月度数据点多，不显示标签
      title: '全省月度保费规划图',
      showExportButtons: true,
      yAxisName: '保费（万元）',
      rightYAxisName: '同比增长率',
    };
  }
}

/**
 * 便捷工厂函数：创建月度保费配置预设
 */
export function createMonthlyPremiumConfig(): Partial<UniversalChartConfig> {
  return new MonthlyPremiumConfigPreset().getConfig();
}
