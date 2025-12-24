/**
 * 季度占比规划图 - 数据处理 Hook
 *
 * @hook useChartData
 * @description 处理和验证季度占比数据，计算派生数据
 */

import { useMemo } from 'react';
import type {
  QuarterlyProportionData,
  QuarterDetailData,
  QuarterIndex,
  WarningLevel,
} from '../QuarterlyProportionChart.types';
import { QUARTER_LABELS } from '../QuarterlyProportionChart.types';
import type { ProcessedQuarterData } from '../QuarterlyProportionChart.types';
import { isValidQuarterData } from '../QuarterlyProportionChart.types';

/**
 * 获取预警级别
 * @param growth - 增长率（小数形式，如 0.15 表示 15%）
 * @returns 预警级别
 */
function getWarningLevel(growth: number | null): WarningLevel {
  if (growth === null) return 'normal';
  if (growth < 0) return 'danger';
  if (growth < 0.05) return 'warning';
  if (growth < 0.15) return 'normal';
  return 'excellent';
}

/**
 * 数据处理 Hook
 *
 * @param data - 原始季度占比数据
 * @returns 处理后的季度数据和派生信息
 *
 * @example
 * const { processedData, isValid, error } = useChartData(rawData);
 */
export function useChartData(data: QuarterlyProportionData) {
  const processedData = useMemo<ProcessedQuarterData>(() => {
    // 验证数据
    if (!isValidQuarterData(data)) {
      return {
        targetShare: [null, null, null, null],
        actualShare: [null, null, null, null],
        growthSeries: [null, null, null, null],
        quarterDetails: [],
      };
    }

    const {
      quarterlyTargets,
      quarterlyActuals2025,
      quarterlyCurrent,
      totalTarget,
      totalActual2025,
      growthSeries,
    } = data;

    // 计算占比
    const targetShare: (number | null)[] = quarterlyTargets.map((target) => {
      if (totalTarget === 0) return null;
      return target / totalTarget;
    });

    const actualShare: (number | null)[] = quarterlyActuals2025.map((actual) => {
      if (actual === null) return null;
      if (totalActual2025 === 0) return null;
      return actual / totalActual2025;
    });

    // 计算季度详情
    const quarterDetails: QuarterDetailData[] = quarterlyTargets.map(
      (target, index): QuarterDetailData => {
        const quarter = index as QuarterIndex;
        const actual2025 = quarterlyActuals2025[quarter];
        const current = quarterlyCurrent[quarter];
        const growth = growthSeries[quarter];

        return {
          quarter,
          quarterLabel: QUARTER_LABELS[quarter],
          target,
          targetShare: targetShare[quarter] ?? 0,
          actual2025,
          actualShare2025: actualShare[quarter],
          current,
          growth,
          warningLevel: getWarningLevel(growth),
        };
      }
    );

    return {
      targetShare,
      actualShare,
      growthSeries: growthSeries.map((g) => (g === null ? null : g)),
      quarterDetails,
    };
  }, [data]);

  const isValid = useMemo(() => {
    return isValidQuarterData(data);
  }, [data]);

  const error = useMemo(() => {
    if (isValid) return null;

    // 简单的错误提示
    if (!data || typeof data !== 'object') {
      return '数据格式错误：缺少必需的数据对象';
    }

    const {
      quarterlyTargets,
      quarterlyActuals2025,
      quarterlyCurrent,
      totalTarget,
      totalActual2025,
      growthSeries,
    } = data;

    if (
      !Array.isArray(quarterlyTargets) ||
      quarterlyTargets.length !== 4
    ) {
      return '数据格式错误：quarterlyTargets 必须是长度为 4 的数组';
    }

    if (
      !Array.isArray(quarterlyActuals2025) ||
      quarterlyActuals2025.length !== 4
    ) {
      return '数据格式错误：quarterlyActuals2025 必须是长度为 4 的数组';
    }

    if (
      !Array.isArray(quarterlyCurrent) ||
      quarterlyCurrent.length !== 4
    ) {
      return '数据格式错误：quarterlyCurrent 必须是长度为 4 的数组';
    }

    if (!Array.isArray(growthSeries) || growthSeries.length !== 4) {
      return '数据格式错误：growthSeries 必须是长度为 4 的数组';
    }

    if (typeof totalTarget !== 'number') {
      return '数据格式错误：totalTarget 必须是数字';
    }

    if (typeof totalActual2025 !== 'number') {
      return '数据格式错误：totalActual2025 必须是数字';
    }

    return '未知的数据格式错误';
  }, [data, isValid]);

  return {
    /** 处理后的季度数据 */
    processedData,
    /** 数据是否有效 */
    isValid,
    /** 错误信息（如果数据无效） */
    error,
  };
}
