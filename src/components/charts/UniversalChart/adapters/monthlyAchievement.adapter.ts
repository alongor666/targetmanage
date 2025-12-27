import type { UniversalChartInputData, DataAdapter } from '../UniversalChart.types';
import {
  ensureAchievementSeries,
  validateArrayLength
} from './shared.adapter';

export interface MonthlyAchievementDataInput {
  monthlyTargets: number[];
  monthlyCurrent2026: (number | null)[];
  totalTarget: number;
  totalCurrent2026: number;
  achievementSeries?: (number | null)[];
}

export class MonthlyAchievementAdapter implements DataAdapter<MonthlyAchievementDataInput> {
  adapt(input: MonthlyAchievementDataInput): UniversalChartInputData {
    this.validate(input);

    const data: UniversalChartInputData = {
      timeGranularity: 'monthly',
      valueType: 'achievement',
      targets: input.monthlyTargets,
      baseline2025: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // 使用长度为12的数组，填充0（不显示2025基线）
      current: input.monthlyCurrent2026,
      totalTarget: input.totalTarget,
      totalBaseline2025: 0,
      achievementSeries: input.achievementSeries,
    };

    return ensureAchievementSeries(data);
  }

  private validate(input: MonthlyAchievementDataInput): void {
    validateArrayLength(input.monthlyTargets, 12, 'monthlyTargets');
    validateArrayLength(input.monthlyCurrent2026, 12, 'monthlyCurrent2026');
    if (input.achievementSeries) {
      validateArrayLength(input.achievementSeries, 12, 'achievementSeries');
    }
  }
}

export function createMonthlyAchievementAdapter(): MonthlyAchievementAdapter {
  return new MonthlyAchievementAdapter();
}
