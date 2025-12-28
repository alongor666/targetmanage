"use client";

/**
 * 主页面 - 川分目标管理系统
 *
 * 整合了 Demo V2 的核心功能 + 机构对比分析
 * 布局原则：每一行只能有一张图，避免并列（除非是要比较左右两边的数据）
 */

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from "next/dynamic";
import type { Org } from "@/schemas/types";
import {
  Button,
  Card,
  KpiCard,
  Dropdown,
} from '@/components/v2';
import { colorsV2, layoutV2, typographyV2 } from '@/styles/design-tokens-v2';
import {
  allocateAnnualToMonthly,
  monthlyToQuarterly,
  monthlyToYtd,
  calculateActual2025Weights,
  calculateFutureTargets,
} from "@/domain/allocation";
import {
  linearProgressYear,
  weightedProgressYear,
  linearProgressQuarter,
  weightedProgressQuarter,
  actual2025ProgressYear,
  actual2025ProgressQuarter,
  monthToQuarter,
} from "@/domain/time";
import { calculateGrowthMetrics, formatGrowthRate } from "@/domain/growth";
import { safeDivide } from "@/domain/achievement";
import { aggregateHqTargetsByProduct, calculateHqAchievementRate } from "@/domain/headquarters";
import { generateMonthlyPlannedActuals, filterMonthlyActuals } from "@/domain/plannedActuals";
import type { TimeProgressMode } from "@/domain/plannedActuals";
import {
  loadAllocationRules,
  loadOrgs,
  loadTargetsAnnual2026,
  loadActualsAnnual2025,
  loadActualsMonthly2026,
  loadActualsMonthly2025,
  loadHeadquartersTargetsAnnual2026,
} from "@/services/loaders";
import { lsRemove, LS_KEYS } from "@/services/storage";
import {
  UniversalChart,
  createQuarterlyPremiumAdapter,
  createMonthlyPremiumAdapter,
  createHqPredictionAdapter,
  createQuarterlyAchievementAdapter,
  createMonthlyAchievementAdapter,
} from "@/components/charts/UniversalChart";
import type {
  QuarterlyDataInput,
  MonthlyDataInput,
  HqPredictionDataInput,
  QuarterlyAchievementDataInput,
  MonthlyAchievementDataInput,
} from "@/components/charts/UniversalChart";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type GroupView = "all" | "local" | "remote";
type ProductView = "total" | "auto" | "property" | "life";
type ProgressMode = "linear" | "weighted" | "actual2025";

const productLabel: Record<ProductView, string> = {
  total: "汇总",
  auto: "车险",
  property: "财产险",
  life: "人身险",
};

const supportedProducts: Array<Exclude<ProductView, "total">> = ["auto", "property", "life"];

function isSupportedProduct(value: string): value is Exclude<ProductView, "total"> {
  return supportedProducts.includes(value as Exclude<ProductView, "total">);
}

function aggregateToViewsAndAllWithCounts(rows: any[], orgMap: Map<string, Org>): {
  sums: Map<string, number>;
  counts: Map<string, number>;
} {
  const sums = new Map<string, number>();
  const counts = new Map<string, number>();

  function add(key: { view: string; product: ProductView }, v: number) {
    const k = `${key.view}__${key.product}`;
    sums.set(k, (sums.get(k) ?? 0) + v);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  for (const r of rows) {
    if (!isSupportedProduct(r.product)) continue;
    const o = orgMap.get(r.org_id);
    if (!o) continue;
    add({ view: r.org_id, product: r.product }, r.value);
    add({ view: r.org_id, product: "total" }, r.value);
    add({ view: o.group, product: r.product }, r.value);
    add({ view: "all", product: r.product }, r.value);
    add({ view: o.group, product: "total" }, r.value);
    add({ view: "all", product: "total" }, r.value);
  }

  return { sums, counts };
}

function valueOrNull(agg: { sums: Map<string, number>; counts: Map<string, number> }, key: string): number | null {
  return (agg.counts.get(key) ?? 0) > 0 ? (agg.sums.get(key) ?? 0) : null;
}

type MonthlyAgg = {
  sums: Map<string, number>;
  counts: Map<string, number>;
};

function aggregateMonthlyActuals(records: any[], orgMap: Map<string, Org>): MonthlyAgg {
  const sums = new Map<string, number>();
  const counts = new Map<string, number>();

  function add(month: number, key: { view: string; product: ProductView }, v: number) {
    const k = `${month}__${key.view}__${key.product}`;
    sums.set(k, (sums.get(k) ?? 0) + v);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  for (const r of records) {
    if (!isSupportedProduct(r.product)) continue;
    const o = orgMap.get(r.org_id);
    if (!o) continue;
    add(r.month, { view: r.org_id, product: r.product }, r.monthly_actual);
    add(r.month, { view: r.org_id, product: "total" }, r.monthly_actual);
    add(r.month, { view: o.group, product: r.product }, r.monthly_actual);
    add(r.month, { view: "all", product: r.product }, r.monthly_actual);
    add(r.month, { view: o.group, product: "total" }, r.monthly_actual);
    add(r.month, { view: "all", product: "total" }, r.monthly_actual);
  }

  return { sums, counts };
}

function monthlySeriesFor(agg: MonthlyAgg, view: string, product: ProductView): Array<number | null> {
  const series: Array<number | null> = [];
  const key = `${view}__${product}`;
  for (let m = 1; m <= 12; m += 1) {
    const k = `${m}__${key}`;
    series.push((agg.counts.get(k) ?? 0) > 0 ? (agg.sums.get(k) ?? 0) : null);
  }
  return series;
}

function aggregateAnnualToViews(rows: any[], orgMap: Map<string, Org>): Map<string, number> {
  const map = new Map<string, number>();

  function add(view: string, product: ProductView, value: number) {
    const key = `${view}__${product}`;
    map.set(key, (map.get(key) ?? 0) + value);
  }

  for (const r of rows) {
    if (!isSupportedProduct(r.product)) continue;
    const o = orgMap.get(r.org_id);
    if (!o) continue;
    add(r.org_id, r.product, r.value);
    add(r.org_id, "total", r.value);
    add(o.group, r.product, r.value);
    add("all", r.product, r.value);
    add(o.group, "total", r.value);
    add("all", "total", r.value);
  }

  return map;
}

export default function HomePage() {
  // 数据状态
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [weights, setWeights] = useState<number[]>([]);
  const [annualTargets, setAnnualTargets] = useState<any>(null);
  const [annualActuals2025, setAnnualActuals2025] = useState<any>(null);
  const [monthlyActuals2025, setMonthlyActuals2025] = useState<any>(null);
  const [monthlyActuals2026, setMonthlyActuals2026] = useState<any>(null);
  const [headquartersTargets, setHeadquartersTargets] = useState<any>(null);
  const [dataResetTick, setDataResetTick] = useState(0);

  // 筛选器状态
  const [viewKey, setViewKey] = useState<string>('all');
  const [product, setProduct] = useState<ProductView>('total');
  const [month, setMonth] = useState<number | 'plan'>(6);
  const [progressMode, setProgressMode] = useState<ProgressMode>('weighted');

  // 数据加载
  useEffect(() => {
    (async () => {
      const [o, r, t, a25, m25, m26, hq] = await Promise.all([
        loadOrgs(),
        loadAllocationRules(),
        loadTargetsAnnual2026(),
        loadActualsAnnual2025(),
        loadActualsMonthly2025(),
        loadActualsMonthly2026(),
        loadHeadquartersTargetsAnnual2026(),
      ]);
      setOrgs(o.orgs);
      setWeights(r.rules[0].weights);
      setAnnualTargets(t);
      setAnnualActuals2025(a25);
      setMonthlyActuals2025(m25);
      setMonthlyActuals2026(m26);
      setHeadquartersTargets(hq);
    })().catch((e) => console.error(e));
  }, [dataResetTick]);

  // 筛选器选项
  const viewOptions = useMemo(() => [
    { value: 'all', label: '全省' },
    { value: 'local', label: '同城' },
    { value: 'remote', label: '异地' },
    ...orgs
      .filter((o) => o.org_id !== "SC_local_benbu" && o.org_id !== "SC_local_xicai_junyuan")
      .map((o) => ({ value: o.org_id, label: o.org_cn })),
  ], [orgs]);

  const productOptions = [
    { value: 'total', label: '汇总' },
    { value: 'auto', label: '车险' },
    { value: 'property', label: '财产险' },
    { value: 'life', label: '人身险' },
  ];

  const monthOptions = [
    ...Array.from({ length: 12 }, (_, i) => ({
      value: String(i + 1),
      label: `${i + 1}月`,
    })),
    { value: 'plan', label: '规划' },
  ];

  const progressModeOptions = [
    { value: 'weighted', label: '目标权重' },
    { value: 'linear', label: '线性月份' },
    { value: 'actual2025', label: '2025年实际' },
  ];

  // 数据处理
  const orgMap = useMemo(() => new Map(orgs.map((o) => [o.org_id, o])), [orgs]);

  const viewLabel = useMemo(() => {
    if (viewKey === "all") return "全省";
    if (viewKey === "local") return "同城";
    if (viewKey === "remote") return "异地";
    return orgMap.get(viewKey)?.org_cn ?? "全省";
  }, [viewKey, orgMap]);

  // 规划模式判断逻辑
  const isPlanMode = month === 'plan';
  const effectiveMonth = isPlanMode ? 12 : (month as number);

  const annualTargetAgg = useMemo(() => {
    if (!annualTargets) return null;

    const rows = annualTargets.records.map((r: any) => {
      const o = orgMap.get(r.org_id);
      if (!o) return null;
      return { org_id: r.org_id, group: o.group, product: r.product, value: r.annual_target };
    }).filter(Boolean);

    return aggregateAnnualToViews(rows as any, orgMap);
  }, [annualTargets, orgMap]);

  const annualActualAgg2025 = useMemo(() => {
    if (!annualActuals2025) return null;

    const rows = annualActuals2025.records.map((r: any) => {
      const o = orgMap.get(r.org_id);
      if (!o) return null;
      return { org_id: r.org_id, group: o.group, product: r.product, value: r.annual_actual };
    }).filter(Boolean);

    return aggregateAnnualToViews(rows as any, orgMap);
  }, [annualActuals2025, orgMap]);

  const actualsPeriod2025 = useMemo(() => {
    const records = monthlyActuals2025?.records;
    if (!records?.length) return { month: null, quarter: null, ytd: null };

    const q = monthToQuarter(effectiveMonth);
    const quarterStart = (q - 1) * 3 + 1;

    function aggFor(predicate: (r: any) => boolean) {
      const rows = records
        .filter(predicate)
        .map((r: any) => ({ org_id: r.org_id, product: r.product, value: r.monthly_actual }))
        .filter(Boolean);

      return aggregateToViewsAndAllWithCounts(rows as any, orgMap);
    }

    const key = `${viewKey}__${product}`;
    const m = valueOrNull(aggFor((r) => r.month === effectiveMonth), key);
    const qtd = valueOrNull(aggFor((r) => r.month >= quarterStart && r.month <= effectiveMonth), key);
    const ytd = valueOrNull(aggFor((r) => r.month <= effectiveMonth), key);

    return { month: m, quarter: qtd, ytd };
  }, [monthlyActuals2025, effectiveMonth, orgMap, viewKey, product]);

  const monthlyAgg2025 = useMemo(() => {
    const records = monthlyActuals2025?.records;
    if (!records?.length) return null;
    return aggregateMonthlyActuals(records, orgMap);
  }, [monthlyActuals2025, orgMap]);

  const monthlyActualSeries2025 = useMemo(() => {
    if (!monthlyAgg2025) return Array.from({ length: 12 }, () => null);
    return monthlySeriesFor(monthlyAgg2025, viewKey, product);
  }, [monthlyAgg2025, viewKey, product]);

  // 生成2026年月度规划实际值（基于真实数据 + 规划逻辑）
  const monthlyActualSeries2026 = useMemo(() => {
    if (!annualTargetAgg || weights.length !== 12) return Array.from({ length: 12 }, () => null);
    const key = `${viewKey}__${product}`;
    const annualTarget = annualTargetAgg.get(key) ?? 0;
    if (annualTarget === 0) return Array.from({ length: 12 }, () => null);

    const records = monthlyActuals2026?.records || [];
    const filteredRecords = filterMonthlyActuals(records, viewKey, product);

    const actual2025Weights = calculateActual2025Weights(monthlyActualSeries2025);
    const actuals2025Array = monthlyActualSeries2025.map(v => v ?? 0);

    return generateMonthlyPlannedActuals(
      annualTarget,
      filteredRecords,
      progressMode as TimeProgressMode,
      weights,
      actuals2025Array
    );
  }, [annualTargetAgg, viewKey, product, weights, monthlyActuals2026, progressMode, monthlyActualSeries2025]);

  const actualsPeriod2026 = useMemo(() => {
    const q = monthToQuarter(effectiveMonth);
    const quarterStart = (q - 1) * 3 + 1;

    const month = monthlyActualSeries2026[effectiveMonth - 1];

    let quarter = 0;
    for (let m = quarterStart; m <= effectiveMonth; m++) {
      const value = monthlyActualSeries2026[m - 1];
      if (value !== null) {
        quarter += value;
      }
    }

    let ytd = 0;
    for (let m = 1; m <= effectiveMonth; m++) {
      const value = monthlyActualSeries2026[m - 1];
      if (value !== null) {
        ytd += value;
      }
    }

    return {
      month: month === null ? null : month,
      quarter: quarter === 0 ? null : quarter,
      ytd: ytd === 0 ? null : ytd
    };
  }, [monthlyActualSeries2026, effectiveMonth]);

  const kpi = useMemo(() => {
    if (!annualTargetAgg || weights.length !== 12) return null;

    const key = `${viewKey}__${product}`;
    const annual = annualTargetAgg.get(key) ?? 0;

    const monthlyTargets = allocateAnnualToMonthly(annual, weights, "2dp");
    const monthlyTargetsLinear = allocateAnnualToMonthly(annual, Array(12).fill(1 / 12), "2dp");
    const actual2025Weights = calculateActual2025Weights(monthlyActualSeries2025);
    const monthlyTargetsActual2025 = allocateAnnualToMonthly(annual, actual2025Weights, "2dp");
    const quarterlyTargets = monthlyToQuarterly(monthlyTargets);
    const ytdTarget = monthlyToYtd(monthlyTargets, effectiveMonth);

    const q = Math.ceil(effectiveMonth / 3);
    const qtdTarget = quarterlyTargets[q - 1];

    const progressLinearYear = linearProgressYear(effectiveMonth);
    const progressWeightedYear = weightedProgressYear(weights, effectiveMonth);
    const progressActual2025Year = actual2025ProgressYear(monthlyActualSeries2025, effectiveMonth);

    const progressLinearQuarter = linearProgressQuarter(effectiveMonth);
    const progressWeightedQuarter = weightedProgressQuarter(weights, effectiveMonth);
    const progressActual2025Quarter = actual2025ProgressQuarter(monthlyActualSeries2025, effectiveMonth);

    const expectedCumYearLinear = annual * progressLinearYear;
    const expectedCumYearWeighted = annual * progressWeightedYear;
    const expectedCumYearActual2025 = annual * progressActual2025Year;

    const timeAchYearLinear =
      actualsPeriod2026.ytd === null ? null : safeDivide(actualsPeriod2026.ytd, expectedCumYearLinear).value;
    const timeAchYearWeighted =
      actualsPeriod2026.ytd === null ? null : safeDivide(actualsPeriod2026.ytd, expectedCumYearWeighted).value;
    const timeAchYearActual2025 =
      actualsPeriod2026.ytd === null ? null : safeDivide(actualsPeriod2026.ytd, expectedCumYearActual2025).value;

    const growthMetrics = calculateGrowthMetrics(actualsPeriod2026, actualsPeriod2025);

    return {
      annual,
      monthlyTargets,
      monthlyTargetsLinear,
      monthlyTargetsActual2025,
      quarterlyTargets,
      ytdTarget,
      qtdTarget,
      progressLinearYear,
      progressWeightedYear,
      progressActual2025Year,
      progressLinearQuarter,
      progressWeightedQuarter,
      progressActual2025Quarter,
      timeAchYearLinear,
      timeAchYearWeighted,
      timeAchYearActual2025,
      growthMetrics,
      ytdActual2025: actualsPeriod2025.ytd,
    };
  }, [annualTargetAgg, weights, viewKey, product, effectiveMonth, actualsPeriod2026, actualsPeriod2025, monthlyActualSeries2025]);

  // 总公司目标达成预测计算
  const hqPrediction = useMemo(() => {
    if (!headquartersTargets || !annualTargetAgg || weights.length !== 12) return null;

    const hqTargetMap = aggregateHqTargetsByProduct(headquartersTargets.records);
    const result: any = {};

    ["auto", "property", "life", "total"].forEach((prod) => {
      const hqTarget = hqTargetMap.get(prod) ?? 0;

      let monthlySeries: Array<number | null>;
      let dataSource: 'actual' | 'target';

      const key = `all__${prod}`;
      const annual = annualTargetAgg.get(key) ?? 0;

      const records = monthlyActuals2026?.records || [];
      const filteredRecords = filterMonthlyActuals(records, "all", prod);

      const actual2025Weights = calculateActual2025Weights(monthlyActualSeries2025);
      const actuals2025Array = monthlyActualSeries2025.map(v => v ?? 0);

      monthlySeries = generateMonthlyPlannedActuals(
        annual,
        filteredRecords,
        progressMode as TimeProgressMode,
        weights,
        actuals2025Array
      );
      dataSource = filteredRecords.length > 0 ? 'actual' : 'target';

      const getProgress = (monthIndex: number): number => {
        if (progressMode === "linear") {
          return (monthIndex + 1) / 12;
        } else if (progressMode === "weighted") {
          return weights.slice(0, monthIndex + 1).reduce((sum, w) => sum + w, 0);
        } else {
          return actual2025ProgressYear(monthlyActualSeries2025, monthIndex + 1);
        }
      };

      const monthlyPredictions = monthlySeries.map((v, idx) => {
        const cumActual = monthlySeries.slice(0, idx + 1).reduce((sum: number, val) => sum + (val ?? 0), 0);
        const progress = getProgress(idx);
        const cumTarget = hqTarget * progress;
        const rate = calculateHqAchievementRate(cumActual, cumTarget).value;
        return { month: idx + 1, cumActual, cumTarget, rate };
      });

      const quarterlyPredictions = [1, 2, 3, 4].map((q) => {
        const quarterStart = (q - 1) * 3 + 1;
        const quarterEnd = q * 3;
        const quarterActual = monthlySeries
          .slice(quarterStart - 1, quarterEnd)
          .reduce((sum: number, val) => sum + (val ?? 0), 0);

        const quarterProgress = getProgress(quarterEnd - 1) - (q > 1 ? getProgress(quarterStart - 2) : 0);
        const quarterTarget = hqTarget * quarterProgress;
        const rate = calculateHqAchievementRate(quarterActual, quarterTarget).value;
        return { quarter: q, actual: quarterActual, target: quarterTarget, rate };
      });

      result[prod] = {
        annualTarget: hqTarget,
        monthly: monthlyPredictions,
        quarterly: quarterlyPredictions,
        dataSource,
      };
    });

    return result;
  }, [headquartersTargets, monthlyActuals2026, annualTargetAgg, weights, progressMode, monthlyActualSeries2025]);

  // 季度保费规划图数据
  const quarterlyPremiumData = useMemo<QuarterlyDataInput | null>(() => {
    if (!kpi) return null;

    const monthlyEstimateTargets =
      progressMode === "linear" ? kpi.monthlyTargetsLinear :
      progressMode === "actual2025" ? kpi.monthlyTargetsActual2025 :
      kpi.monthlyTargets;

    const quarterlyTargets = monthlyToQuarterly(monthlyEstimateTargets);
    const quarterlyActuals2025 = monthlyToQuarterly(
      monthlyActualSeries2025.map((v) => v ?? 0)
    ).map((value, idx) => {
      const hasAny = monthlyActualSeries2025
        .slice(idx * 3, idx * 3 + 3)
        .some((v) => v !== null);
      return hasAny ? value : null;
    });

    const growthSeries = quarterlyTargets.map((target, idx) => {
      const baseline = quarterlyActuals2025[idx];
      if (baseline === null || baseline === 0 || target === null) return null;
      return target / baseline - 1;
    });

    return {
      quarterlyTargets,
      quarterlyActuals2025,
      quarterlyCurrent: quarterlyTargets,
      totalTarget: kpi.annual,
      totalActual2025: quarterlyActuals2025.reduce(
        (sum: number, v) => (v === null ? sum : sum + v),
        0
      ),
      valueType: 'absolute',
      growthSeries,
    };
  }, [kpi, monthlyActualSeries2025, progressMode]);

  // 月度保费规划图数据
  const monthlyPremiumData = useMemo<MonthlyDataInput | null>(() => {
    if (!kpi) return null;

    const ytdActual = actualsPeriod2026.ytd ?? 0;

    const dynamicTargets = calculateFutureTargets(
      kpi.annual,
      ytdActual,
      effectiveMonth,
      progressMode,
      weights,
      monthlyActualSeries2025
    );

    const monthlyCurrent = dynamicTargets.map((plannedTarget, idx) => {
      const monthIndex = idx + 1;

      if (monthIndex <= effectiveMonth) {
        return monthlyActualSeries2026[idx] ?? plannedTarget;
      }

      return plannedTarget;
    });

    const growthSeries = dynamicTargets.map((target, idx) => {
      const baseline = monthlyActualSeries2025[idx];
      if (baseline === null || baseline === 0 || target === null) return null;
      return target / baseline - 1;
    });

    return {
      monthlyTargets: dynamicTargets,
      monthlyActuals2025: monthlyActualSeries2025,
      monthlyCurrent,
      totalTarget: kpi.annual,
      totalActual2025: monthlyActualSeries2025.reduce(
        (sum: number, v) => (v === null ? sum : sum + v),
        0
      ),
      valueType: 'absolute',
      growthSeries,
    };
  }, [kpi, monthlyActualSeries2025, monthlyActualSeries2026, progressMode, effectiveMonth, weights, actualsPeriod2026]);

  // 总公司预测图数据
  const hqPredictionData = useMemo<HqPredictionDataInput | null>(() => {
    if (!hqPrediction || !hqPrediction[product]) return null;

    const productData = hqPrediction[product];
    const monthlyData = productData.monthly;

    const cumulativeTargets = monthlyData.map((m: any) => m.cumTarget);
    const cumulativeCurrent = monthlyData.map((m: any) => m.cumActual);
    const cumulativeActuals2025 = cumulativeTargets.map((target: number) => target * 0.85);

    return {
      cumulativeTargets,
      cumulativeActuals2025,
      cumulativeCurrent,
      totalTarget: productData.annualTarget,
      totalActual2025: cumulativeActuals2025[11] || 0,
      valueType: 'achievement',
    };
  }, [hqPrediction, product]);

  // 季度达成图数据
  const quarterlyAchievementData = useMemo<QuarterlyAchievementDataInput | null>(() => {
    if (!kpi) return null;

    const quarterlyTargets = kpi.quarterlyTargets;
    const quarterlyCurrent2026 = monthlyToQuarterly(
      monthlyActualSeries2026.map((v) => v ?? 0)
    ).map((value, idx) => {
      const hasAny = monthlyActualSeries2026
        .slice(idx * 3, idx * 3 + 3)
        .some((v) => v !== null);
      return hasAny ? value : null;
    });

    const achievementSeries = quarterlyTargets.map((target, idx) => {
      const actual = quarterlyCurrent2026[idx];
      if (actual === null || target === 0) return null;
      return actual / target;
    });

    return {
      quarterlyTargets,
      quarterlyCurrent2026,
      achievementSeries,
      totalTarget: kpi.annual,
      totalCurrent2026: quarterlyCurrent2026.reduce(
        (sum: number, v) => (v === null ? sum : sum + v),
        0
      ),
    };
  }, [kpi, monthlyActualSeries2026]);

  // 月度达成图数据
  const monthlyAchievementData = useMemo<MonthlyAchievementDataInput | null>(() => {
    if (!kpi) return null;

    const monthlyTargets = kpi.monthlyTargets;
    const monthlyCurrent2026 = monthlyActualSeries2026;

    const achievementSeries = monthlyTargets.map((target, idx) => {
      const actual = monthlyCurrent2026[idx];
      if (actual === null || target === 0) return null;
      return actual / target;
    });

    return {
      monthlyTargets,
      monthlyCurrent2026,
      achievementSeries,
      totalTarget: kpi.annual,
      totalCurrent2026: monthlyCurrent2026.reduce(
        (sum: number, v) => (v === null ? sum : sum + v),
        0
      ),
    };
  }, [kpi, monthlyActualSeries2026]);

  // 机构对比数据（从 orgs 页面整合）
  const tertiaryOrgs = useMemo(() => {
    return orgs.filter(
      (o) => o.org_id !== "SC_local_benbu" && o.org_id !== "SC_local_xicai_junyuan"
    );
  }, [orgs]);

  const targetByOrg = useMemo(() => {
    if (!annualTargets) return new Map<string, Record<ProductView, number>>();
    const map = new Map<string, Record<ProductView, number>>();

    for (const r of annualTargets.records) {
      if (!isSupportedProduct(r.product)) continue;
      const prev = map.get(r.org_id) ?? { total: 0, auto: 0, property: 0, life: 0 };
      const product = r.product as Exclude<ProductView, "total">;
      prev[product] += r.annual_target;
      prev.total += r.annual_target;
      map.set(r.org_id, prev);
    }
    return map;
  }, [annualTargets]);

  const actual2025ByOrg = useMemo(() => {
    if (!annualActuals2025) return new Map<string, Record<ProductView, number>>();
    const map = new Map<string, Record<ProductView, number>>();

    for (const r of annualActuals2025.records) {
      if (!isSupportedProduct(r.product)) continue;
      const prev = map.get(r.org_id) ?? { total: 0, auto: 0, property: 0, life: 0 };
      const product = r.product as Exclude<ProductView, "total">;
      prev[product] += r.annual_actual;
      prev.total += r.annual_actual;
      map.set(r.org_id, prev);
    }
    return map;
  }, [annualActuals2025]);

  const orgComparisonData = useMemo(() => {
    let filteredOrgs = tertiaryOrgs;

    if (filteredOrgs.length === 0) return null;

    const monthlyTargets: number[] = [];
    const monthlyActuals2025: (number | null)[] = [];
    const orgNames: string[] = [];

    for (const o of filteredOrgs) {
      const t = targetByOrg.get(o.org_id);
      const a25 = actual2025ByOrg.get(o.org_id);

      if (!t || !a25) continue;

      orgNames.push(o.org_cn);
      monthlyTargets.push(t[product]);
      monthlyActuals2025.push(a25[product] || 0);
    }

    if (monthlyTargets.length === 0) return null;

    const growthSeries = monthlyTargets.map((target, idx) => {
      const baseline = monthlyActuals2025[idx];
      if (baseline === null || baseline === 0 || target === null) return null;
      return (target - baseline) / baseline;
    });

    const totalTarget = monthlyTargets.reduce((sum, v) => sum + v, 0);
    const totalActual2025 = monthlyActuals2025.reduce((sum: number, v) => sum + (v || 0), 0);

    const data = {
      monthlyTargets,
      monthlyActuals2025,
      monthlyCurrent: monthlyTargets,
      totalTarget,
      totalActual2025,
      valueType: 'absolute' as const,
      growthSeries,
    };

    const adapted = createMonthlyPremiumAdapter().adapt(data);
    return {
      ...adapted,
      customLabels: orgNames,
    };
  }, [targetByOrg, actual2025ByOrg, tertiaryOrgs, product]);

  const baseline2025 = useMemo(() => {
    if (!annualActualAgg2025) return null;
    const key = `${viewKey}__${product}`;
    return annualActualAgg2025.get(key) ?? 0;
  }, [annualActualAgg2025, viewKey, product]);

  const dataDiagnostics = useMemo(() => {
    const count2025 = monthlyActuals2025?.records?.length ?? 0;
    const count2026Actual = monthlyActuals2026?.records?.length ?? 0;
    const count2026Planned = monthlyActualSeries2026.filter(v => v !== null).length;
    return { count2025, count2026Actual, count2026Planned };
  }, [monthlyActuals2025, monthlyActuals2026, monthlyActualSeries2026]);

  if (!kpi) {
    return <div className="text-sm text-slate-600">正在加载数据…</div>;
  }

  const growthRateYtd = kpi.growthMetrics?.growth_ytd_rate ?? null;
  const achievementRate = actualsPeriod2026.ytd !== null ? actualsPeriod2026.ytd / kpi.annual : null;
  const timeAchievementRate = progressMode === "linear"
    ? kpi.timeAchYearLinear
    : progressMode === "weighted"
    ? kpi.timeAchYearWeighted
    : kpi.timeAchYearActual2025;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colorsV2.background.primary }}>
      {/* 主内容区 */}
      <main
        className="mx-auto px-6 py-6"
        style={{
          maxWidth: '1400px',
        }}
      >
        {/* 2. 筛选控制区（单行布局：筛选器 + 操作按钮） */}
        <Card className="mb-7 sticky top-16 z-40">
          <div className="flex flex-wrap gap-4 items-end justify-between">
            {/* 左侧：筛选器组 */}
            <div className="flex flex-wrap gap-4 items-end">
              {/* 视角选择器 */}
              <div className="min-w-[140px]">
                <label
                  className="block mb-1 font-medium"
                  style={{
                    fontSize: `${typographyV2.fontSize.small}px`,
                    color: colorsV2.text.secondary,
                  }}
                >
                  区域
                </label>
                <Dropdown
                  value={viewKey}
                  options={viewOptions}
                  onChange={setViewKey}
                />
              </div>

              {/* 产品选择器 */}
              <div className="min-w-[120px]">
                <label
                  className="block mb-1 font-medium"
                  style={{
                    fontSize: `${typographyV2.fontSize.small}px`,
                    color: colorsV2.text.secondary,
                  }}
                >
                  产品
                </label>
                <Dropdown
                  value={product}
                  options={productOptions}
                  onChange={(val) => setProduct(val as ProductView)}
                />
              </div>

              {/* 截至月份 */}
              <div className="min-w-[100px]">
                <label
                  className="block mb-1 font-medium"
                  style={{
                    fontSize: `${typographyV2.fontSize.small}px`,
                    color: colorsV2.text.secondary,
                  }}
                >
                  时间
                </label>
                <Dropdown
                  value={String(month)}
                  options={monthOptions}
                  onChange={(val) => setMonth(val === 'plan' ? 'plan' : Number(val))}
                />
              </div>

              {/* 预测规则 */}
              <div className="min-w-[140px]">
                <label
                  className="block mb-1 font-medium"
                  style={{
                    fontSize: `${typographyV2.fontSize.small}px`,
                    color: colorsV2.text.secondary,
                  }}
                >
                  预测规则
                </label>
                <Dropdown
                  value={progressMode}
                  options={progressModeOptions}
                  onChange={(val) => setProgressMode(val as ProgressMode)}
                />
              </div>
            </div>

            {/* 右侧：操作按钮组 */}
            <div className="flex gap-2 items-end">
              {/* 高频操作：刷新数据 */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setDataResetTick((v) => v + 1)}
              >
                刷新数据
              </Button>

              {/* 中频操作：导出数据 */}
              <Button variant="outline" size="sm">
                导出数据
              </Button>

              {/* 低频操作：清空缓存 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  lsRemove(LS_KEYS.actualsMonthly2025);
                  lsRemove(LS_KEYS.actualsMonthly2026);
                  setDataResetTick((v) => v + 1);
                }}
              >
                清空缓存
              </Button>
            </div>
          </div>
        </Card>

        {/* 3. 核心KPI卡片区（4个年度指标） */}
        <div
          className="grid gap-5 mb-7"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: `${layoutV2.grid.gap}px`,
          }}
        >
          <KpiCard
            title="年度目标"
            value={`${Math.round(kpi.annual).toLocaleString()} 万元`}
            subtitle="2026年度总目标"
            progress={1}
            progressColor="success"
          />
          <KpiCard
            title="年度达成"
            value={actualsPeriod2026.ytd !== null ? `${Math.round(actualsPeriod2026.ytd).toLocaleString()} 万元` : '—'}
            subtitle={achievementRate !== null ? `已完成${(achievementRate * 100).toFixed(1)}%` : '暂无数据'}
            progress={achievementRate ?? 0}
            progressColor="success"
          />
          <KpiCard
            title="年增长率"
            value={growthRateYtd !== null ? `${growthRateYtd >= 0 ? '+' : ''}${(growthRateYtd * 100).toFixed(1)}%` : '—'}
            subtitle="同比2025年同期"
            progress={growthRateYtd !== null ? Math.abs(growthRateYtd) : 0}
            progressColor={growthRateYtd !== null && growthRateYtd >= 0 ? "success" : "danger"}
          />
          <KpiCard
            title="时间进度达成率"
            value={timeAchievementRate !== null ? `${(timeAchievementRate * 100).toFixed(1)}%` : '—'}
            subtitle="实际/预期比例"
            progress={timeAchievementRate ?? 0}
            progressColor={timeAchievementRate !== null && timeAchievementRate >= 1 ? "success" : "warning"}
          />
        </div>

        {/* 4. 图表展示区 - 季度保费规划图（全宽单独一行） */}
        {quarterlyPremiumData && (
          <Card className="mb-7">
            <UniversalChart
              chartType="quarterlyPremium"
              data={createQuarterlyPremiumAdapter().adapt(quarterlyPremiumData)}
              config={{
                title: `同比增长分析（季度） - ${viewLabel} - ${productLabel[product]}`,
                titleIcon: '📈',
                subtitle: '对比2025年同期实际数据，分析2026年目标的增长情况',
                height: 360,
              }}
            />
          </Card>
        )}

        {/* 季度达成图（全宽单独一行） */}
        {quarterlyAchievementData && (
          <Card className="mb-7">
            <UniversalChart
              chartType="quarterlyAchievement"
              data={createQuarterlyAchievementAdapter().adapt(quarterlyAchievementData)}
              config={{
                title: `目标达成监控（季度） - ${viewLabel} - ${productLabel[product]}`,
                titleIcon: '🎯',
                subtitle: '实时监控2026年季度目标完成进度与达成率',
                showViewSwitcher: false,
                height: 360,
              }}
            />
          </Card>
        )}

        {/* 图表展示区 - 月度保费规划图（全宽单独一行） */}
        {monthlyPremiumData && (
          <Card className="mb-7">
            <UniversalChart
              chartType="monthlyPremium"
              data={createMonthlyPremiumAdapter().adapt(monthlyPremiumData)}
              config={{
                title: `同比增长分析（月度） - ${viewLabel} - ${productLabel[product]}`,
                titleIcon: '📈',
                subtitle: '对比2025年同期实际数据，分析2026年目标的增长情况',
                height: 360,
                showDataLabel: true,
                currentMonth: effectiveMonth,
              }}
            />
          </Card>
        )}

        {/* 月度达成图（全宽单独一行） */}
        {monthlyAchievementData && (
          <Card className="mb-7">
            <UniversalChart
              chartType="monthlyAchievement"
              data={createMonthlyAchievementAdapter().adapt(monthlyAchievementData)}
              config={{
                title: `目标达成监控（月度） - ${viewLabel} - ${productLabel[product]}`,
                titleIcon: '🎯',
                subtitle: '实时监控2026年月度目标完成进度与达成率',
                showViewSwitcher: false,
                height: 360,
                showDataLabel: true,
                currentMonth: effectiveMonth,
              }}
            />
          </Card>
        )}

        {/* 5. 总公司目标达成预测区（全宽） */}
        {hqPrediction && (
          <Card
            className="mb-7"
            style={{
              backgroundColor: colorsV2.primary.blueLight,
            }}
          >
            <div className="mb-4">
              <h3
                className="font-semibold mb-2"
                style={{
                  fontSize: `${typographyV2.fontSize.h2}px`,
                  color: colorsV2.text.primary,
                }}
              >
                总公司目标达成预测
              </h3>
              <p
                className="text-sm"
                style={{
                  color: colorsV2.text.secondary,
                }}
              >
                {hqPrediction.total?.dataSource === 'actual'
                  ? '基于三级机构实际完成情况，预测四川分公司对总公司目标的达成度（不区分三级机构）'
                  : `基于三级机构年度目标（按${progressMode === 'linear' ? '线性' : progressMode === 'weighted' ? '目标权重' : '2025实际'}口径拆分），预测四川分公司对总公司目标的达成度（不区分三级机构）`
                }
              </p>
              {hqPrediction.total?.dataSource === 'target' && (
                <div className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                  当前使用目标数据测算，导入2026年月度实际数据后将自动切换为实际数据
                </div>
              )}
            </div>

            {/* 4个产品达成率汇总卡片（紧凑型） */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {["auto", "property", "life", "total"].map((prod) => {
                const data = hqPrediction[prod];
                const latestMonth = data.monthly[effectiveMonth - 1];
                const achievementRate = latestMonth?.rate ? (latestMonth.rate * 100).toFixed(1) : "—";
                const rateVariant = latestMonth?.rate && latestMonth.rate >= 1
                  ? "good"
                  : latestMonth?.rate && latestMonth.rate < 0.8
                  ? "danger"
                  : undefined;

                return (
                  <div
                    key={prod}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: colorsV2.background.card,
                    }}
                  >
                    <div className="text-sm font-medium mb-2" style={{ color: colorsV2.text.secondary }}>
                      {productLabel[prod as ProductView]}
                    </div>
                    <div className="text-xs mb-1" style={{ color: colorsV2.text.secondary }}>
                      总公司目标：{Math.round(data.annualTarget).toLocaleString()} 万元
                    </div>
                    <div className="text-xs mb-2" style={{ color: colorsV2.text.secondary }}>
                      YTD实际：{Math.round(latestMonth?.cumActual ?? 0).toLocaleString()} 万元
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{
                        color:
                          rateVariant === "good"
                            ? colorsV2.status.success
                            : rateVariant === "danger"
                            ? colorsV2.status.danger
                            : colorsV2.status.warning,
                      }}
                    >
                      {achievementRate}%
                    </div>
                    <div className="text-xs mt-1" style={{ color: colorsV2.text.tertiary }}>
                      达成率
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 详细预测图表（全宽） */}
            {hqPredictionData && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: colorsV2.background.card }}>
                <UniversalChart
                  chartType="hqPrediction"
                  data={createHqPredictionAdapter().adapt(hqPredictionData)}
                  config={{
                    title: `${productLabel[product]} - 月度累计达成预测`,
                    height: 320,
                  }}
                />
              </div>
            )}
          </Card>
        )}

        {/* 6. 三级机构对比区（整合自 orgs 页面） */}
        {orgComparisonData && (
          <Card className="mb-7">
            <h3
              className="font-semibold mb-4"
              style={{
                fontSize: `${typographyV2.fontSize.h2}px`,
                color: colorsV2.text.primary,
              }}
            >
              三级机构2026年度保费规划对比
            </h3>
            <UniversalChart
              data={orgComparisonData}
              config={{
                title: `三级机构 - ${productLabel[product]} - 年度保费规划（横向对比）`,
                height: 360,
                showDataLabel: true,
              }}
            />
          </Card>
        )}

        {/* 7. 季度目标派生数据（整合自旧版） */}
        <Card className="mb-7">
          <h3
            className="font-semibold mb-3"
            style={{
              fontSize: `${typographyV2.fontSize.h3}px`,
              color: colorsV2.text.primary,
            }}
          >
            季度目标（派生）
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {kpi.quarterlyTargets.map((v: number, idx: number) => (
              <div
                key={idx}
                className="rounded-lg p-3"
                style={{
                  backgroundColor: colorsV2.background.card,
                  border: `1px solid ${colorsV2.background.separator}`,
                }}
              >
                <div className="text-xs" style={{ color: colorsV2.text.secondary }}>Q{idx + 1}</div>
                <div className="mt-1 text-base font-semibold" style={{ color: colorsV2.text.primary }}>
                  {Math.round(v).toLocaleString()} 万元
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 8. 扩展信息区 - 下一步数据准备说明 */}
        <Card className="mb-7">
          <div className="text-xs" style={{ color: colorsV2.text.secondary }}>
            <div className="flex items-center gap-2 mb-1">
              <span>📊</span>
              <span>2025年度基线：</span>
              <span className="font-semibold" style={{ color: colorsV2.text.primary }}>
                {baseline2025?.toLocaleString() ?? '—'} 万元
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span>📦</span>
              <span>数据状态：</span>
              <div className="flex flex-wrap gap-3">
                <span>
                  2025分月
                  <span className="ml-1 font-semibold" style={{ color: colorsV2.status.success }}>
                    {dataDiagnostics.count2025}
                  </span>{' '}
                  条
                </span>
                <span className="text-gray-300">|</span>
                <span>
                  2026实际
                  <span className="ml-1 font-semibold" style={{ color: colorsV2.chart.mainLine }}>
                    {dataDiagnostics.count2026Actual}
                  </span>{' '}
                  条
                </span>
                <span className="text-gray-300">|</span>
                <span>
                  2026规划
                  <span className="ml-1 font-semibold" style={{ color: colorsV2.chart.dashLine }}>
                    {dataDiagnostics.count2026Planned}
                  </span>{' '}
                  条
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3
            className="font-semibold mb-3"
            style={{
              fontSize: `${typographyV2.fontSize.h3}px`,
              color: colorsV2.text.primary,
            }}
          >
            下一步数据准备（严格口径）
          </h3>
          <ul className="space-y-2" style={{ color: colorsV2.text.secondary }}>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="text-sm">
                导入 2026 月度实际（或先录入年度实际再按权重拆月）后，达成率与时间进度达成率自动生效
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="text-sm">
                导入 2025 分月基线后，当月/当季/年累计增长率与增量自动点亮
              </span>
            </li>
          </ul>
          <div className="mt-4 flex gap-2">
            <Button variant="primary" size="sm">
              立即导入数据
            </Button>
            <Button variant="outline" size="sm">
              查看导入指南
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
