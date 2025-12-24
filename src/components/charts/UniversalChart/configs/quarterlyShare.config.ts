/**
 * 季度占比规划图 - 配置预设
 *
 * @module QuarterlyShareConfig
 * @description 季度占比规划图的默认配置
 */

import type { UniversalChartConfig, ConfigPreset } from '../UniversalChart.types';

/**
 * 季度占比规划图配置预设
 */
export class QuarterlyShareConfigPreset implements ConfigPreset {
  getConfig(): Partial<UniversalChartConfig> {
    return {
      height: 360,
      showDetailPanel: true,
      defaultViewMode: 'proportion',
      animation: true,
      barMaxWidth: 60,
      showDataLabel: true,
      title: '全省季度占比规划图',
      showExportButtons: true,
      yAxisName: '占比（%）',
      rightYAxisName: '同比增长率',
    };
  }
}

/**
 * 便捷工厂函数：创建季度占比配置预设
 */
export function createQuarterlyShareConfig(): Partial<UniversalChartConfig> {
  return new QuarterlyShareConfigPreset().getConfig();
}
