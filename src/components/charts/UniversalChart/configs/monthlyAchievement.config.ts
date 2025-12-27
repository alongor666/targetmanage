import type { UniversalChartConfig, ConfigPreset } from '../UniversalChart.types';

/**
 * 月度目标达成图配置预设
 */
export class MonthlyAchievementConfigPreset implements ConfigPreset {
  getConfig(): Partial<UniversalChartConfig> {
    return {
      height: 400,
      showDetailPanel: true,
      defaultViewMode: 'achievement',
      animation: true,
      barMaxWidth: 40,
      showDataLabel: true,
      title: '月度目标达成情况',
      showExportButtons: true,
      yAxisName: '保费（万元）',
      rightYAxisName: '达成率',
    };
  }
}

export function createMonthlyAchievementConfig(): Partial<UniversalChartConfig> {
  return new MonthlyAchievementConfigPreset().getConfig();
}
