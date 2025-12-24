/**
 * 总公司预测数据适配器
 *
 * @module HqPredictionAdapter
 * @description 将总公司月度累计达成预测数据转换为UniversalChart通用格式
 */

import type { UniversalChartInputData, DataAdapter } from '../UniversalChart.types';
import {
  ensureGrowthSeries,
  ensureAchievementSeries,
  validateArrayLength,
} from './shared.adapter';

/**
 * 总公司预测数据输入格式
 */
export interface HqPredictionDataInput {
  /** 月度累计目标值数组（长度为12） */
  cumulativeTargets: number[];
  /** 2025月度累计实际值数组（长度为12） */
  cumulativeActuals2025: (number | null)[];
  /** 当前月度累计值数组（长度为12） */
  cumulativeCurrent: (number | null)[];
  /** 年度总目标 */
  totalTarget: number;
  /** 2025年度总实际（可选） */
  totalActual2025?: number;
  /** 增长率数组（可选，长度为12） */
  growthSeries?: (number | null)[];
  /** 达成率数组（可选，长度为12） */
  achievementSeries?: (number | null)[];
}

/**
 * 总公司预测数据适配器
 *
 * 特点：
 * - 使用月度累计数据
 * - valueType 固定为 'achievement'
 * - 自动计算达成率
 */
export class HqPredictionAdapter implements DataAdapter<HqPredictionDataInput> {
  /**
   * 将总公司预测数据转换为通用格式
   */
  adapt(input: HqPredictionDataInput): UniversalChartInputData {
    // 验证数据
    this.validate(input);

    const data: UniversalChartInputData = {
      timeGranularity: 'monthly',
      valueType: 'achievement',
      targets: input.cumulativeTargets,
      baseline2025: input.cumulativeActuals2025,
      current: input.cumulativeCurrent,
      totalTarget: input.totalTarget,
      totalBaseline2025: input.totalActual2025 || 0,
      growthSeries: input.growthSeries,
      achievementSeries: input.achievementSeries,
    };

    // 确保有增长率和达成率数据
    let result = ensureGrowthSeries(data);
    result = ensureAchievementSeries(result);

    return result;
  }

  /**
   * 验证输入数据
   */
  private validate(input: HqPredictionDataInput): void {
    if (!input || typeof input !== 'object') {
      throw new Error('HqPredictionAdapter: 输入数据无效');
    }

    validateArrayLength(input.cumulativeTargets, 12, 'cumulativeTargets');
    validateArrayLength(input.cumulativeActuals2025, 12, 'cumulativeActuals2025');
    validateArrayLength(input.cumulativeCurrent, 12, 'cumulativeCurrent');

    if (input.growthSeries) {
      validateArrayLength(input.growthSeries, 12, 'growthSeries');
    }

    if (input.achievementSeries) {
      validateArrayLength(input.achievementSeries, 12, 'achievementSeries');
    }
  }
}

/**
 * 便捷工厂函数：创建总公司预测适配器
 */
export function createHqPredictionAdapter(): HqPredictionAdapter {
  return new HqPredictionAdapter();
}

/**
 * 辅助函数：从月度数据计算累计数据
 *
 * @param monthlyData 月度数据数组（长度为12）
 * @returns 累计数据数组（长度为12）
 *
 * @example
 * calculateCumulative([10, 20, 30]) // 返回 [10, 30, 60]
 */
export function calculateCumulative(
  monthlyData: (number | null)[]
): (number | null)[] {
  const cumulative: (number | null)[] = [];
  let sum = 0;
  let hasNull = false;

  for (const value of monthlyData) {
    if (value === null || hasNull) {
      cumulative.push(null);
      hasNull = true;
    } else {
      sum += value;
      cumulative.push(sum);
    }
  }

  return cumulative;
}

/**
 * 辅助函数：从累计数据还原月度数据
 *
 * @param cumulativeData 累计数据数组（长度为12）
 * @returns 月度数据数组（长度为12）
 *
 * @example
 * reverseCalculateCumulative([10, 30, 60]) // 返回 [10, 20, 30]
 */
export function reverseCalculateCumulative(
  cumulativeData: (number | null)[]
): (number | null)[] {
  const monthly: (number | null)[] = [];

  for (let i = 0; i < cumulativeData.length; i++) {
    const current = cumulativeData[i];
    const previous = i > 0 ? cumulativeData[i - 1] : null;

    if (current === null) {
      monthly.push(null);
    } else if (previous === null && i > 0) {
      monthly.push(null);
    } else {
      monthly.push(current - (previous || 0));
    }
  }

  return monthly;
}
