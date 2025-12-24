/**
 * 月度占比规划图 - 配置预设
 *
 * @module MonthlyShareConfig
 * @description 月度占比规划图的默认配置
 */

import type { UniversalChartConfig, ConfigPreset } from '../UniversalChart.types';

/**
 * 月度占比规划图配置预设
 */
export class MonthlyShareConfigPreset implements ConfigPreset {
  getConfig(): Partial<UniversalChartConfig> {
    return {
      height: 360,
      showDetailPanel: true,
      defaultViewMode: 'proportion',
      animation: true,
      barMaxWidth: 40, // 月度数据柱宽较小
      showDataLabel: false, // 月度数据点多，不显示标签
      title: '全省月度占比规划图',
      showExportButtons: true,
      yAxisName: '占比（%）',
      rightYAxisName: '同比增长率',
    };
  }
}

/**
 * 便捷工厂函数：创建月度占比配置预设
 */
export function createMonthlyShareConfig(): Partial<UniversalChartConfig> {
  return new MonthlyShareConfigPreset().getConfig();
}
