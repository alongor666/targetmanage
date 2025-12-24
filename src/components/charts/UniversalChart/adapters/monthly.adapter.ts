/**
 * 月度数据适配器
 *
 * @module MonthlyAdapter
 * @description 将月度保费/占比数据转换为UniversalChart通用格式
 */

import type { UniversalChartInputData, DataAdapter, ValueType } from '../UniversalChart.types';
import { ensureGrowthSeries, validateArrayLength } from './shared.adapter';

/**
 * 月度数据输入格式
 */
export interface MonthlyDataInput {
  /** 月度目标值数组（长度为12） */
  monthlyTargets: number[];
  /** 2025月度实际值数组（长度为12） */
  monthlyActuals2025: (number | null)[];
  /** 当前月度值数组（长度为12） */
  monthlyCurrent: (number | null)[];
  /** 年度总目标 */
  totalTarget: number;
  /** 2025年度总实际 */
  totalActual2025: number;
  /** 增长率数组（可选，长度为12） */
  growthSeries?: (number | null)[];
  /** 值类型 */
  valueType?: ValueType;
}

/**
 * 月度保费数据适配器
 */
export class MonthlyPremiumAdapter implements DataAdapter<MonthlyDataInput> {
  /**
   * 将月度保费数据转换为通用格式
   */
  adapt(input: MonthlyDataInput): UniversalChartInputData {
    // 验证数据
    this.validate(input);

    const data: UniversalChartInputData = {
      timeGranularity: 'monthly',
      valueType: input.valueType || 'absolute',
      targets: input.monthlyTargets,
      baseline2025: input.monthlyActuals2025,
      current: input.monthlyCurrent,
      totalTarget: input.totalTarget,
      totalBaseline2025: input.totalActual2025,
      growthSeries: input.growthSeries,
    };

    // 确保有增长率数据
    return ensureGrowthSeries(data);
  }

  /**
   * 验证输入数据
   */
  private validate(input: MonthlyDataInput): void {
    if (!input || typeof input !== 'object') {
      throw new Error('MonthlyPremiumAdapter: 输入数据无效');
    }

    validateArrayLength(input.monthlyTargets, 12, 'monthlyTargets');
    validateArrayLength(input.monthlyActuals2025, 12, 'monthlyActuals2025');
    validateArrayLength(input.monthlyCurrent, 12, 'monthlyCurrent');

    if (input.growthSeries) {
      validateArrayLength(input.growthSeries, 12, 'growthSeries');
    }
  }
}

/**
 * 月度占比数据适配器
 */
export class MonthlyShareAdapter implements DataAdapter<MonthlyDataInput> {
  /**
   * 将月度占比数据转换为通用格式
   */
  adapt(input: MonthlyDataInput): UniversalChartInputData {
    // 验证数据
    this.validate(input);

    const data: UniversalChartInputData = {
      timeGranularity: 'monthly',
      valueType: 'proportion',
      targets: input.monthlyTargets,
      baseline2025: input.monthlyActuals2025,
      current: input.monthlyCurrent,
      totalTarget: input.totalTarget,
      totalBaseline2025: input.totalActual2025,
      growthSeries: input.growthSeries,
    };

    // 确保有增长率数据
    return ensureGrowthSeries(data);
  }

  /**
   * 验证输入数据
   */
  private validate(input: MonthlyDataInput): void {
    if (!input || typeof input !== 'object') {
      throw new Error('MonthlyShareAdapter: 输入数据无效');
    }

    validateArrayLength(input.monthlyTargets, 12, 'monthlyTargets');
    validateArrayLength(input.monthlyActuals2025, 12, 'monthlyActuals2025');
    validateArrayLength(input.monthlyCurrent, 12, 'monthlyCurrent');

    if (input.growthSeries) {
      validateArrayLength(input.growthSeries, 12, 'growthSeries');
    }
  }
}

/**
 * 便捷工厂函数：创建月度保费适配器
 */
export function createMonthlyPremiumAdapter(): MonthlyPremiumAdapter {
  return new MonthlyPremiumAdapter();
}

/**
 * 便捷工厂函数：创建月度占比适配器
 */
export function createMonthlyShareAdapter(): MonthlyShareAdapter {
  return new MonthlyShareAdapter();
}
