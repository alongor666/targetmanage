import type { UniversalChartInputData, DataAdapter } from '../UniversalChart.types';
import {
  ensureAchievementSeries,
  validateArrayLength
} from './shared.adapter';

export interface QuarterlyAchievementDataInput {
  quarterlyTargets: number[];
  quarterlyCurrent2026: (number | null)[];
  totalTarget: number;
  totalCurrent2026: number;
  achievementSeries?: (number | null)[];
}

export class QuarterlyAchievementAdapter implements DataAdapter<QuarterlyAchievementDataInput> {
  adapt(input: QuarterlyAchievementDataInput): UniversalChartInputData {
    this.validate(input);

    const data: UniversalChartInputData = {
      timeGranularity: 'quarterly',
      valueType: 'achievement',
      targets: input.quarterlyTargets,
      baseline2025: [0, 0, 0, 0],  // 使用长度为4的数组，填充0（不显示2025基线）
      current: input.quarterlyCurrent2026,
      totalTarget: input.totalTarget,
      totalBaseline2025: 0,
      achievementSeries: input.achievementSeries,
    };

    return ensureAchievementSeries(data);
  }

  private validate(input: QuarterlyAchievementDataInput): void {
    validateArrayLength(input.quarterlyTargets, 4, 'quarterlyTargets');
    validateArrayLength(input.quarterlyCurrent2026, 4, 'quarterlyCurrent2026');
    if (input.achievementSeries) {
      validateArrayLength(input.achievementSeries, 4, 'achievementSeries');
    }
  }
}

export function createQuarterlyAchievementAdapter(): QuarterlyAchievementAdapter {
  return new QuarterlyAchievementAdapter();
}
