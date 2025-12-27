import type { UniversalChartConfig, ConfigPreset } from '../UniversalChart.types';

/**
 * 季度目标达成图配置预设
 */
export class QuarterlyAchievementConfigPreset implements ConfigPreset {
  getConfig(): Partial<UniversalChartConfig> {
    return {
      height: 400,
      showDetailPanel: true,
      defaultViewMode: 'achievement',
      animation: true,
      barMaxWidth: 60,
      showDataLabel: true,
      title: '季度目标达成情况',
      showExportButtons: true,
      yAxisName: '保费（万元）',
      rightYAxisName: '达成率',
    };
  }
}

export function createQuarterlyAchievementConfig(): Partial<UniversalChartConfig> {
  return new QuarterlyAchievementConfigPreset().getConfig();
}
