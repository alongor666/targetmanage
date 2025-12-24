/**
 * 季度数据适配器
 *
 * @module QuarterlyAdapter
 * @description 将季度保费/占比数据转换为UniversalChart通用格式
 */

import type { UniversalChartInputData, DataAdapter, ValueType } from '../UniversalChart.types';
import { ensureGrowthSeries, validateArrayLength } from './shared.adapter';

/**
 * 季度数据输入格式
 */
export interface QuarterlyDataInput {
  /** 季度目标值数组（长度为4） */
  quarterlyTargets: number[];
  /** 2025季度实际值数组（长度为4） */
  quarterlyActuals2025: (number | null)[];
  /** 当前季度值数组（长度为4） */
  quarterlyCurrent: (number | null)[];
  /** 年度总目标 */
  totalTarget: number;
  /** 2025年度总实际 */
  totalActual2025: number;
  /** 增长率数组（可选，长度为4） */
  growthSeries?: (number | null)[];
  /** 值类型 */
  valueType?: ValueType;
}

/**
 * 季度保费数据适配器
 */
export class QuarterlyPremiumAdapter implements DataAdapter<QuarterlyDataInput> {
  /**
   * 将季度保费数据转换为通用格式
   */
  adapt(input: QuarterlyDataInput): UniversalChartInputData {
    // 验证数据
    this.validate(input);

    const data: UniversalChartInputData = {
      timeGranularity: 'quarterly',
      valueType: input.valueType || 'absolute',
      targets: input.quarterlyTargets,
      baseline2025: input.quarterlyActuals2025,
      current: input.quarterlyCurrent,
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
  private validate(input: QuarterlyDataInput): void {
    if (!input || typeof input !== 'object') {
      throw new Error('QuarterlyPremiumAdapter: 输入数据无效');
    }

    validateArrayLength(input.quarterlyTargets, 4, 'quarterlyTargets');
    validateArrayLength(input.quarterlyActuals2025, 4, 'quarterlyActuals2025');
    validateArrayLength(input.quarterlyCurrent, 4, 'quarterlyCurrent');

    if (input.growthSeries) {
      validateArrayLength(input.growthSeries, 4, 'growthSeries');
    }
  }
}

/**
 * 季度占比数据适配器
 */
export class QuarterlyShareAdapter implements DataAdapter<QuarterlyDataInput> {
  /**
   * 将季度占比数据转换为通用格式
   */
  adapt(input: QuarterlyDataInput): UniversalChartInputData {
    // 验证数据
    this.validate(input);

    const data: UniversalChartInputData = {
      timeGranularity: 'quarterly',
      valueType: 'proportion',
      targets: input.quarterlyTargets,
      baseline2025: input.quarterlyActuals2025,
      current: input.quarterlyCurrent,
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
  private validate(input: QuarterlyDataInput): void {
    if (!input || typeof input !== 'object') {
      throw new Error('QuarterlyShareAdapter: 输入数据无效');
    }

    validateArrayLength(input.quarterlyTargets, 4, 'quarterlyTargets');
    validateArrayLength(input.quarterlyActuals2025, 4, 'quarterlyActuals2025');
    validateArrayLength(input.quarterlyCurrent, 4, 'quarterlyCurrent');

    if (input.growthSeries) {
      validateArrayLength(input.growthSeries, 4, 'growthSeries');
    }
  }
}

/**
 * 便捷工厂函数：创建季度保费适配器
 */
export function createQuarterlyPremiumAdapter(): QuarterlyPremiumAdapter {
  return new QuarterlyPremiumAdapter();
}

/**
 * 便捷工厂函数：创建季度占比适配器
 */
export function createQuarterlyShareAdapter(): QuarterlyShareAdapter {
  return new QuarterlyShareAdapter();
}
