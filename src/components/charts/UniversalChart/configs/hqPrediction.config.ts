/**
 * 总公司预测图 - 配置预设
 *
 * @module HqPredictionConfig
 * @description 总公司月度累计达成预测图的默认配置
 */

import type { UniversalChartConfig, ConfigPreset } from '../UniversalChart.types';

/**
 * 总公司预测图配置预设
 */
export class HqPredictionConfigPreset implements ConfigPreset {
  getConfig(): Partial<UniversalChartConfig> {
    return {
      height: 400,
      showDetailPanel: true,
      defaultViewMode: 'achievement',
      animation: true,
      barMaxWidth: 40, // 月度数据柱宽较小
      showDataLabel: false, // 月度数据点多，不显示标签
      title: '汇总 - 月度累计达成预测',
      showExportButtons: true,
      yAxisName: '累计保费（万元）',
      rightYAxisName: '累计达成率',
    };
  }
}

/**
 * 便捷工厂函数：创建总公司预测配置预设
 */
export function createHqPredictionConfig(): Partial<UniversalChartConfig> {
  return new HqPredictionConfigPreset().getConfig();
}
