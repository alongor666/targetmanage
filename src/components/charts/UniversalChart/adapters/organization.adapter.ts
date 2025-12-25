/**
 * 机构数据适配器
 *
 * @module OrganizationAdapter
 * @description 将三级机构数据转换为UniversalChart通用格式
 * @doc docs/business/指标定义规范.md
 */

import type { UniversalChartInputData, DataAdapter } from '../UniversalChart.types';
import { ensureGrowthSeries, validateArrayLength } from './shared.adapter';

/**
 * 机构数据输入格式
 */
export interface OrganizationDataInput {
  /** 三级机构ID数组（长度可变，排除本部和西财俊苑） */
  orgIds: string[];
  /** 机构名称数组（长度可变） */
  orgNames: string[];
  /** 2026年目标值数组（长度可变） */
  annualTargets2026: number[];
  /** 2025年实际值数组（长度可变） */
  annualActuals2025: (number | null)[];
  /** 当前值数组（长度可变，可用2026目标作为默认值） */
  current: (number | null)[];
  /** 2026年度总目标 */
  totalTarget2026: number;
  /** 2025年度总实际（允许null） */
  totalActual2025: number | null;
  /** 增长率数组（可选，长度可变） */
  growthSeries?: (number | null)[];
}

/**
 * 机构保费数据适配器
 */
export class OrganizationPremiumAdapter implements DataAdapter<OrganizationDataInput> {
  /**
   * 将机构保费数据转换为通用格式
   */
  adapt(input: OrganizationDataInput): UniversalChartInputData {
    // 验证数据
    const validationResult = this.validate(input);
    if (!validationResult.valid) {
      console.error('OrganizationPremiumAdapter: 数据验证失败', validationResult.error);
      // 返回一个空的有效数据
      return {
        timeGranularity: 'organization',
        valueType: 'absolute',
        targets: [],
        baseline2025: [],
        current: [],
        totalTarget: 0,
        totalBaseline2025: 0,
        customLabels: [],
      };
    }

    const data: UniversalChartInputData = {
      timeGranularity: 'organization',
      valueType: 'absolute',
      targets: input.annualTargets2026,
      baseline2025: input.annualActuals2025,
      current: input.current,
      totalTarget: input.totalTarget2026,
      totalBaseline2025: input.totalActual2025 ?? 0, // 处理 null 值
      growthSeries: input.growthSeries,
      customLabels: input.orgNames,
    };

    // 确保有增长率数据
    return ensureGrowthSeries(data);
  }

  /**
   * 验证输入数据
   */
  private validate(input: OrganizationDataInput): { valid: boolean; error?: string } {
    if (!input || typeof input !== 'object') {
      return { valid: false, error: '输入数据无效' };
    }

    // 验证所有数组长度一致
    const orgCount = input.orgIds.length;

    if (orgCount === 0) {
      return { valid: false, error: '机构列表为空' };
    }

    if (input.orgNames.length !== orgCount) {
      return { valid: false, error: `orgNames 长度 ${input.orgNames.length} 与 orgIds 长度 ${orgCount} 不一致` };
    }
    if (input.annualTargets2026.length !== orgCount) {
      return { valid: false, error: `annualTargets2026 长度 ${input.annualTargets2026.length} 与 orgIds 长度 ${orgCount} 不一致` };
    }
    if (input.annualActuals2025.length !== orgCount) {
      return { valid: false, error: `annualActuals2025 长度 ${input.annualActuals2025.length} 与 orgIds 长度 ${orgCount} 不一致` };
    }
    if (input.current.length !== orgCount) {
      return { valid: false, error: `current 长度 ${input.current.length} 与 orgIds 长度 ${orgCount} 不一致` };
    }
    if (input.growthSeries && input.growthSeries.length !== orgCount) {
      return { valid: false, error: `growthSeries 长度 ${input.growthSeries.length} 与 orgIds 长度 ${orgCount} 不一致` };
    }

    // 验证机构数量有效（1-12个机构）
    if (orgCount < 1 || orgCount > 12) {
      return { valid: false, error: `机构数量 ${orgCount} 无效，应在 1-12 之间` };
    }

    return { valid: true };
  }
}

/**
 * 便捷工厂函数：创建机构保费适配器
 */
export function createOrganizationPremiumAdapter(): OrganizationPremiumAdapter {
  return new OrganizationPremiumAdapter();
}
