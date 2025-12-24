/**
 * 通用图表 - 数据处理 Hook
 *
 * @hook useUniversalData
 * @description 处理和验证通用图表数据，计算派生数据（占比、详情等）
 */

import { useMemo } from 'react';
import type {
  UniversalChartInputData,
  ProcessedChartData,
  PeriodDetailData,
  PeriodIndex,
} from '../UniversalChart.types';
import { isValidChartData, getPeriodLabel, getAllPeriodLabels } from '../UniversalChart.types';
import { calculateShare, getWarningLevel } from '../adapters/shared.adapter';

/**
 * 通用数据处理 Hook
 *
 * @param data 输入数据
 * @returns 处理后的图表数据
 *
 * @example
 * const { processedData, isValid } = useUniversalData(inputData);
 */
export function useUniversalData(data: UniversalChartInputData) {
  // 验证数据有效性
  const isValid = useMemo(() => isValidChartData(data), [data]);

  // 处理数据
  const processedData = useMemo<ProcessedChartData>(() => {
    if (!isValid) {
      const emptyLength = data.timeGranularity === 'quarterly' ? 4 : 12;
      const emptyArray = Array(emptyLength).fill(null);

      return {
        targetShare: emptyArray,
        baselineShare: emptyArray,
        growthSeries: emptyArray,
        achievementSeries: emptyArray,
        periodDetails: [],
        xAxisLabels: getAllPeriodLabels(data.timeGranularity),
      };
    }

    const {
      timeGranularity,
      valueType,
      targets,
      baseline2025,
      current,
      totalTarget,
      totalBaseline2025,
      growthSeries = [],
      achievementSeries = [],
    } = data;

    // 计算目标占比
    const targetShare = targets.map((target) => calculateShare(target, totalTarget));

    // 计算基准占比
    const baselineShare = baseline2025.map((baseline) =>
      calculateShare(baseline, totalBaseline2025)
    );

    // 计算周期详情
    const periodLength = timeGranularity === 'quarterly' ? 4 : 12;
    const periodDetails: PeriodDetailData[] = [];

    for (let i = 0; i < periodLength; i++) {
      const index = i as PeriodIndex;
      const target = targets[i];
      const baseline = baseline2025[i];
      const currentValue = current[i];
      const growth = growthSeries[i] ?? null;
      const achievement = achievementSeries[i] ?? null;

      periodDetails.push({
        index,
        label: getPeriodLabel(i, timeGranularity),
        target,
        targetShare: targetShare[i] ?? 0,
        baseline2025: baseline,
        baselineShare2025: baselineShare[i],
        current: currentValue,
        growth,
        achievement,
        warningLevel: getWarningLevel(growth),
      });
    }

    // 获取X轴标签
    const xAxisLabels = data.customLabels || getAllPeriodLabels(timeGranularity);

    return {
      targetShare,
      baselineShare,
      growthSeries,
      achievementSeries,
      periodDetails,
      xAxisLabels,
    };
  }, [data, isValid]);

  // 计算统计信息
  const stats = useMemo(() => {
    if (!isValid) {
      return {
        totalTargetSum: 0,
        totalBaselineSum: 0,
        totalCurrentSum: 0,
        averageGrowth: null,
        averageAchievement: null,
      };
    }

    const { targets, baseline2025, current, growthSeries = [], achievementSeries = [] } = data;

    const totalTargetSum = targets.reduce((sum: number, val) => sum + val, 0);
    const totalBaselineSum = baseline2025.reduce(
      (sum: number, val) => sum + (val || 0),
      0
    );
    const totalCurrentSum = current.reduce((sum: number, val) => sum + (val || 0), 0);

    // 计算平均增长率（排除null值）
    const validGrowths = growthSeries.filter((g): g is number => g !== null);
    const averageGrowth =
      validGrowths.length > 0
        ? validGrowths.reduce((sum, g) => sum + g, 0) / validGrowths.length
        : null;

    // 计算平均达成率（排除null值）
    const validAchievements = achievementSeries.filter((a): a is number => a !== null);
    const averageAchievement =
      validAchievements.length > 0
        ? validAchievements.reduce((sum, a) => sum + a, 0) / validAchievements.length
        : null;

    return {
      totalTargetSum,
      totalBaselineSum,
      totalCurrentSum,
      averageGrowth,
      averageAchievement,
    };
  }, [data, isValid]);

  return {
    processedData,
    isValid,
    stats,
  };
}
