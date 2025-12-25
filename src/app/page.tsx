"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Org } from "@/schemas/types";
import { allocateAnnualToMonthly, monthlyToQuarterly, monthlyToYtd, calculateActual2025Weights, calculateFutureTargets } from "@/domain/allocation";
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
import { loadAllocationRules, loadOrgs, loadTargetsAnnual2026, loadActualsAnnual2025, loadActualsMonthly2026, loadActualsMonthly2025, loadHeadquartersTargetsAnnual2026 } from "@/services/loaders";
import { lsRemove, LS_KEYS } from "@/services/storage";
import { colors, getGrowthPointColor } from "@/styles/tokens";
import { getQuarterlyStatus } from "@/lib/utils";
import { generateChartTitle } from "@/lib/chart-title";
import { FONT_SIZE } from "@/lib/typography";
import {
  UniversalChart,
  createQuarterlyPremiumAdapter,
  createMonthlyPremiumAdapter,
  createHqPredictionAdapter,
} from "@/components/charts/UniversalChart";
import type {
  QuarterlyDataInput,
  MonthlyDataInput,
  HqPredictionDataInput,
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

export default function Page() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [weights, setWeights] = useState<number[]>([]);
  const [month, setMonth] = useState<number>(1);
  const [viewKey, setViewKey] = useState<string>("all");
  const [product, setProduct] = useState<ProductView>("total");
  const [progressMode, setProgressMode] = useState<ProgressMode>("weighted");
  const [dataResetTick, setDataResetTick] = useState(0);

  const [annualTargets, setAnnualTargets] = useState<any>(null);
  const [annualActuals2025, setAnnualActuals2025] = useState<any>(null);
  const [monthlyActuals2025, setMonthlyActuals2025] = useState<any>(null);
  const [monthlyActuals2026, setMonthlyActuals2026] = useState<any>(null);
  const [headquartersTargets, setHeadquartersTargets] = useState<any>(null);

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

  const orgMap = useMemo(() => new Map(orgs.map((o) => [o.org_id, o])), [orgs]);
  const viewLabel = useMemo(() => {
    if (viewKey === "all") return "全省";
    if (viewKey === "local") return "同城";
    if (viewKey === "remote") return "异地";
    return orgMap.get(viewKey)?.org_cn ?? "全省";
  }, [viewKey, orgMap]);

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

  const actualsPeriod2026 = useMemo(() => {
    const records = monthlyActuals2026?.records;
    if (!records?.length) return { month: null, quarter: null, ytd: null };

    const q = monthToQuarter(month);
    const quarterStart = (q - 1) * 3 + 1;

    function aggFor(predicate: (r: any) => boolean) {
      const rows = records
        .filter(predicate)
        .map((r: any) => ({ org_id: r.org_id, product: r.product, value: r.monthly_actual }))
        .filter(Boolean);

      return aggregateToViewsAndAllWithCounts(rows as any, orgMap);
    }

    const key = `${viewKey}__${product}`;
    const m = valueOrNull(aggFor((r) => r.month === month), key);
    const qtd = valueOrNull(aggFor((r) => r.month >= quarterStart && r.month <= month), key);
    const ytd = valueOrNull(aggFor((r) => r.month <= month), key);

    return { month: m, quarter: qtd, ytd };
  }, [monthlyActuals2026, month, orgMap, viewKey, product]);

  const actualsPeriod2025 = useMemo(() => {
    const records = monthlyActuals2025?.records;
    if (!records?.length) return { month: null, quarter: null, ytd: null };

    const q = monthToQuarter(month);
    const quarterStart = (q - 1) * 3 + 1;

    function aggFor(predicate: (r: any) => boolean) {
      const rows = records
        .filter(predicate)
        .map((r: any) => ({ org_id: r.org_id, product: r.product, value: r.monthly_actual }))
        .filter(Boolean);

      return aggregateToViewsAndAllWithCounts(rows as any, orgMap);
    }

    const key = `${viewKey}__${product}`;
    const m = valueOrNull(aggFor((r) => r.month === month), key);
    const qtd = valueOrNull(aggFor((r) => r.month >= quarterStart && r.month <= month), key);
    const ytd = valueOrNull(aggFor((r) => r.month <= month), key);

    return { month: m, quarter: qtd, ytd };
  }, [monthlyActuals2025, month, orgMap, viewKey, product]);

  const monthlyAgg2025 = useMemo(() => {
    const records = monthlyActuals2025?.records;
    if (!records?.length) return null;
    return aggregateMonthlyActuals(records, orgMap);
  }, [monthlyActuals2025, orgMap]);

  const monthlyAgg2026 = useMemo(() => {
    const records = monthlyActuals2026?.records;
    if (!records?.length) return null;
    return aggregateMonthlyActuals(records, orgMap);
  }, [monthlyActuals2026, orgMap]);

  const monthlyActualSeries2025 = useMemo(() => {
    if (!monthlyAgg2025) return Array.from({ length: 12 }, () => null);
    return monthlySeriesFor(monthlyAgg2025, viewKey, product);
  }, [monthlyAgg2025, viewKey, product]);

  const monthlyActualSeries2026 = useMemo(() => {
    if (!monthlyAgg2026) return Array.from({ length: 12 }, () => null);
    return monthlySeriesFor(monthlyAgg2026, viewKey, product);
  }, [monthlyAgg2026, viewKey, product]);

  const kpi = useMemo(() => {
    if (!annualTargetAgg || weights.length !== 12) return null;

    const key = `${viewKey}__${product}`;
    const annual = annualTargetAgg.get(key) ?? 0;

    const monthlyTargets = allocateAnnualToMonthly(annual, weights, "2dp");
    const monthlyTargetsLinear = allocateAnnualToMonthly(annual, Array(12).fill(1 / 12), "2dp");
    const actual2025Weights = calculateActual2025Weights(monthlyActualSeries2025);
    const monthlyTargetsActual2025 = allocateAnnualToMonthly(annual, actual2025Weights, "2dp");
    const quarterlyTargets = monthlyToQuarterly(monthlyTargets);
    const ytdTarget = monthlyToYtd(monthlyTargets, month);

    const q = Math.ceil(month / 3);
    const qtdTarget = quarterlyTargets[q - 1];

    const progressLinearYear = linearProgressYear(month);
    const progressWeightedYear = weightedProgressYear(weights, month);
    const progressActual2025Year = actual2025ProgressYear(monthlyActualSeries2025, month);

    const progressLinearQuarter = linearProgressQuarter(month);
    const progressWeightedQuarter = weightedProgressQuarter(weights, month);
    const progressActual2025Quarter = actual2025ProgressQuarter(monthlyActualSeries2025, month);

    const expectedCumYearLinear = annual * progressLinearYear;
    const expectedCumYearWeighted = annual * progressWeightedYear;
    const expectedCumYearActual2025 = annual * progressActual2025Year;

    const timeAchYearLinear =
      actualsPeriod2026.ytd === null ? null : safeDivide(actualsPeriod2026.ytd, expectedCumYearLinear).value;
    const timeAchYearWeighted =
      actualsPeriod2026.ytd === null ? null : safeDivide(actualsPeriod2026.ytd, expectedCumYearWeighted).value;
    const timeAchYearActual2025 =
      actualsPeriod2026.ytd === null ? null : safeDivide(actualsPeriod2026.ytd, expectedCumYearActual2025).value;

    // 计算增长率指标（严格口径：2026 实际 vs 2025 同期实际）
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
  }, [annualTargetAgg, weights, viewKey, product, month, actualsPeriod2026, actualsPeriod2025, monthlyActualSeries2025]);

  // 总公司目标达成预测计算
  const hqPrediction = useMemo(() => {
    if (!headquartersTargets || !annualTargetAgg || weights.length !== 12) return null;

    // 聚合总公司目标
    const hqTargetMap = aggregateHqTargetsByProduct(headquartersTargets.records);

    // 计算全省各产品的实际完成情况（分月/分季/累计）
    const result: any = {};

    ["auto", "property", "life", "total"].forEach((prod) => {
      const hqTarget = hqTargetMap.get(prod) ?? 0;

      // 获取月度序列：优先使用实际数据，降级到目标数据
      let monthlySeries: Array<number | null>;
      let dataSource: 'actual' | 'target';

      if (monthlyAgg2026) {
        // 优先使用实际数据
        monthlySeries = monthlySeriesFor(monthlyAgg2026, "all", prod as ProductView);
        dataSource = 'actual';
      } else {
        // 降级到目标数据：按 progressMode 拆分三级机构年度目标
        const key = `all__${prod}`;
        const annual = annualTargetAgg.get(key) ?? 0;

        // 根据 progressMode 选择拆分方式
        if (progressMode === "linear") {
          monthlySeries = allocateAnnualToMonthly(annual, Array(12).fill(1 / 12), "2dp");
        } else if (progressMode === "actual2025") {
          const actual2025Weights = calculateActual2025Weights(monthlyActualSeries2025);
          monthlySeries = allocateAnnualToMonthly(annual, actual2025Weights, "2dp");
        } else {
          // weighted
          monthlySeries = allocateAnnualToMonthly(annual, weights, "2dp");
        }
        dataSource = 'target';
      }

      // 计算时间进度（根据 progressMode）
      const getProgress = (monthIndex: number): number => {
        if (progressMode === "linear") {
          return (monthIndex + 1) / 12;
        } else if (progressMode === "weighted") {
          return weights.slice(0, monthIndex + 1).reduce((sum, w) => sum + w, 0);
        } else {
          // actual2025
          return actual2025ProgressYear(monthlyActualSeries2025, monthIndex + 1);
        }
      };

      // 月度预测数据
      const monthlyPredictions = monthlySeries.map((v, idx) => {
        const cumActual = monthlySeries.slice(0, idx + 1).reduce((sum: number, val) => sum + (val ?? 0), 0);
        const progress = getProgress(idx);
        const cumTarget = hqTarget * progress;
        const rate = calculateHqAchievementRate(cumActual, cumTarget).value;
        return { month: idx + 1, cumActual, cumTarget, rate };
      });

      // 季度预测数据
      const quarterlyPredictions = [1, 2, 3, 4].map((q) => {
        const quarterStart = (q - 1) * 3 + 1;
        const quarterEnd = q * 3;
        const quarterActual = monthlySeries
          .slice(quarterStart - 1, quarterEnd)
          .reduce((sum: number, val) => sum + (val ?? 0), 0);

        // 计算季度进度
        const quarterProgress = getProgress(quarterEnd - 1) - (q > 1 ? getProgress(quarterStart - 2) : 0);
        const quarterTarget = hqTarget * quarterProgress;
        const rate = calculateHqAchievementRate(quarterActual, quarterTarget).value;
        return { quarter: q, actual: quarterActual, target: quarterTarget, rate };
      });

      result[prod] = {
        annualTarget: hqTarget,
        monthly: monthlyPredictions,
        quarterly: quarterlyPredictions,
        dataSource, // 标记数据来源
      };
    });

    return result;
  }, [headquartersTargets, monthlyAgg2026, annualTargetAgg, weights, progressMode, monthlyActualSeries2025]);

  const chartOption = useMemo(() => {
    if (!kpi) return null;

    const targetColor = colors.chart.claimRate;
    const actualColor = colors.chart.expenseRate;
    const growthColor = colors.status.good;
    const warningColor = colors.status.warning;
    const orangeColor = "#FF9500"; // 橙色（预警时柱状图）
    const darkRedColor = "#8B0000"; // 深红色（预警时文字）
    const grayColor = "#6B7280"; // 灰色（柱状图标签默认）
    const blueColor = "#3B82F6"; // 蓝色（折线图标签默认）
    const darkBlueColor = "#1E40AF"; // 深蓝色（折线图线条）

    const monthlyEstimateTargets =
      progressMode === "linear" ? kpi.monthlyTargetsLinear :
      progressMode === "actual2025" ? kpi.monthlyTargetsActual2025 :
      kpi.monthlyTargets;
    const monthlyCurrentForGrowth = monthlyActualSeries2026.map(
      (value, idx) => value ?? monthlyEstimateTargets[idx]
    );
    const growthSeries = monthlyCurrentForGrowth.map((current, idx) => {
      const baseline = monthlyActualSeries2025[idx];
      if (baseline === null || current === null) return null;
      return safeDivide(current - baseline, baseline).value;
    });

    const barWidth = Math.round(24 * 1.618);
    const warningThreshold = 0.05; // 5%预警线

    // 为2025实际数据生成颜色（对应增长率低于5%时变橙色）
    const actualBarColors = monthlyActualSeries2025.map((v, idx) => {
      const growthRate = growthSeries[idx];
      return growthRate !== null && growthRate < warningThreshold ? orangeColor : actualColor;
    });

    const barLabel = {
      show: true,
      position: "top" as const,
      fontWeight: "bold" as const,
      overflow: "truncate" as const,
      width: barWidth,
      formatter: (params: any) => {
        const value = params?.value as number | null;
        if (value === null) return "";
        const growthRate = growthSeries[params.dataIndex];
        const isWarning = growthRate !== null && growthRate < warningThreshold;
        const color = isWarning ? darkRedColor : grayColor;
        return `{${isWarning ? 'warning' : 'normal'}|${Math.round(value)}}`;
      },
      rich: {
        normal: {
          color: grayColor,
        },
        warning: {
          color: darkRedColor,
        },
      },
    };

    return {
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const items = Array.isArray(params) ? params : [params];
          const title = items[0]?.axisValue ?? "";
          const lines = items.map((item: any) => {
            const value = item.value as number | null;
            if (item.seriesName === "增长率") {
              const text = value === null ? "—" : `${(value * 100).toFixed(1)}%`;
              return `${item.marker}${item.seriesName}: ${text}`;
            }
            const text = value === null ? "—" : Number(value).toFixed(0);
            return `${item.marker}${item.seriesName}: ${text}`;
          });
          return [title, ...lines].join("<br/>");
        },
      },
      legend: { data: ["2026目标", "2025实际", "增长率"] },
      xAxis: {
        type: "category",
        data: Array.from({ length: 12 }, (_, i) => `${i + 1}月`),
        splitLine: { show: false },
      },
      yAxis: [
        { type: "value", name: "万元", splitLine: { show: false } },
        {
          type: "value",
          name: "增长率",
          axisLabel: { formatter: (value: number) => `${(value * 100).toFixed(1)}%` },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          type: "bar",
          data: monthlyEstimateTargets,
          name: "2026目标",
          itemStyle: { color: targetColor },
          barMaxWidth: barWidth,
          label: barLabel,
        },
        {
          type: "bar",
          data: monthlyActualSeries2025,
          name: "2025实际",
          itemStyle: {
            color: (params: any) => actualBarColors[params.dataIndex] ?? actualColor,
          },
          barMaxWidth: barWidth,
          label: barLabel,
          barGap: "30%",
        },
        {
          type: "line",
          data: growthSeries,
          name: "增长率",
          yAxisIndex: 1,
          lineStyle: {
            color: darkBlueColor, // 统一为深蓝色
          },
          itemStyle: {
            color: darkBlueColor, // 统一为深蓝色
          },
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          label: {
            show: true,
            position: "top",
            fontWeight: "bold",
            formatter: (params: any) => {
              const value = params?.value as number | null;
              if (value === null) return "";
              const isWarning = value !== null && value < warningThreshold;
              const color = isWarning ? darkRedColor : blueColor;
              return `{${isWarning ? 'warning' : 'normal'}|${(value * 100).toFixed(1)}%}`;
            },
            rich: {
              normal: {
                color: blueColor,
              },
              warning: {
                color: darkRedColor,
              },
            },
          },
          markLine: {
            symbol: "none",
            lineStyle: { color: warningColor, type: "dashed" },
            label: { formatter: "预警线 5%" },
            data: [{ yAxis: 0.05 }],
          },
        },
      ],
      grid: { left: 48, right: 60, top: 40, bottom: 30 },
    };
  }, [kpi, monthlyActualSeries2025, monthlyActualSeries2026, progressMode]);

  const quarterlyChartOption = useMemo(() => {
    if (!kpi) return null;

    // === 数据准备 ===
    const monthlyEstimateTargets =
      progressMode === "linear" ? kpi.monthlyTargetsLinear :
      progressMode === "actual2025" ? kpi.monthlyTargetsActual2025 :
      kpi.monthlyTargets;

    // 2026季度目标
    const quarterlyTargets = monthlyToQuarterly(monthlyEstimateTargets);

    // 2025季度实际（使用actuals_monthly_2025.json数据）
    const quarterlyActuals2025 = monthlyToQuarterly(
      monthlyActualSeries2025.map((v) => v ?? 0)
    ).map((value, idx) => {
      const hasAny = monthlyActualSeries2025
        .slice(idx * 3, idx * 3 + 3)
        .some((v) => v !== null);
      return hasAny ? value : null;
    });

    // 增速计算：2026目标/2025实际-1
    const growthSeries = quarterlyTargets.map((target, idx) => {
      const baseline = quarterlyActuals2025[idx];
      if (baseline === null || baseline === 0 || target === null) return null;
      return target / baseline - 1;
    });

    // 计算达成率（这里暂时不用，因为对比的是目标vs实际，不是实际vs目标）
    // 但保留以便状态判断使用
    const achievementRates = quarterlyActuals2025.map((actual, idx) => {
      const target = quarterlyTargets[idx];
      if (target === 0 || actual === null) return null;
      return actual / target;
    });

    // 计算每季度状态（主要基于增速）
    const quarterlyStatuses = quarterlyTargets.map((target, idx) => {
      const achievementRate = achievementRates[idx];
      const growthRate = growthSeries[idx];
      return getQuarterlyStatus(achievementRate, growthRate, {
        achievement: { excellent_min: 1.05, normal_min: 1.00, warning_min: 0.95 },
        growth: { excellent_min: 0.12, normal_min: 0.05 }
      });
    });

    const barWidth = 36;

    // === ECharts配置 ===
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: 'cross' },
        formatter: (params: any) => {
          const items = Array.isArray(params) ? params : [params];
          const title = items[0]?.axisValue ?? "";
          const lines = items.map((item: any) => {
            const value = item.value as number | null;
            if (item.seriesName === "增长率") {
              const text = value === null ? "—" : `${(value * 100).toFixed(1)}%`;
              return `${item.marker}${item.seriesName}: ${text}`;
            }
            const text = value === null ? "—" : Number(value).toFixed(0);
            return `${item.marker}${item.seriesName}: ${text}`;
          });
          return [title, ...lines].join("<br/>");
        },
      },
      legend: { show: false }, // 使用自定义HTML图例
      grid: {
        left: '70px',
        right: '70px',
        bottom: '60px',
        top: '20px',
        containLabel: false
      },
      xAxis: {
        type: "category",
        data: ["一季度", "二季度", "三季度", "四季度"],
        axisLine: { lineStyle: { color: '#d3d3d3' } },  // 浅灰色轴线
        axisLabel: { color: '#666', fontSize: FONT_SIZE.sm },
        axisTick: {
          alignWithLabel: true,
          lineStyle: { color: '#d3d3d3' }  // 浅灰色刻度线
        },
        splitLine: { show: false }
      },
      yAxis: [
        {
          type: "value",
          name: "保费(万元)",
          position: 'left',
          axisLine: { show: true, lineStyle: { color: '#d3d3d3' } },  // 浅灰色轴线
          axisLabel: { color: '#666', fontSize: FONT_SIZE.xs },
          axisTick: {
            show: true,
            lineStyle: { color: '#d3d3d3' }  // 浅灰色刻度线
          },
          splitLine: { show: false },  // 去掉网格线
          min: 0,
        },
        {
          type: "value",
          name: "增长率",
          position: 'right',
          axisLine: { show: true, lineStyle: { color: '#d3d3d3' } },  // 浅灰色轴线
          axisLabel: {
            color: '#666',
            fontSize: FONT_SIZE.xs,
            formatter: (value: number) => `${(value * 100).toFixed(0)}%`
          },
          axisTick: {
            show: true,
            lineStyle: { color: '#d3d3d3' }  // 浅灰色刻度线
          },
          splitLine: { show: false },  // 去掉网格线
        },
      ],
      series: [
        // Series 1: 2026目标柱
        {
          name: '2026目标',
          type: 'bar',
          yAxisIndex: 0,
          data: quarterlyTargets.map((value, idx) => {
            const status = quarterlyStatuses[idx];
            const isWarning = status === 'warning' || status === 'danger';

            return {
              value: value,
              itemStyle: {
                color: colors.chart.targetBarNormal,
                borderColor: isWarning ? colors.chart.targetBarWarningBorder : 'transparent',
                borderWidth: isWarning ? 1 : 0
              },
              label: {
                show: true,
                position: 'top',
                formatter: Math.round(value).toString(),
                fontSize: FONT_SIZE.xs,
                color: isWarning ? colors.chart.quarterlyLabelWarning : colors.chart.quarterlyLabelNormal
              }
            };
          }),
          barWidth: barWidth,
          barGap: '30%',
        },
        // Series 2: 2025实际柱
        {
          name: '2025实际',
          type: 'bar',
          yAxisIndex: 0,
          data: quarterlyActuals2025.map((value, idx) => {
            const status = quarterlyStatuses[idx];
            const isWarning = status === 'warning' || status === 'danger';

            return {
              value: value,
              itemStyle: {
                color: colors.chart.actualBarNormal,
                borderColor: isWarning ? colors.chart.actualBarWarningBorder : 'transparent',
                borderWidth: isWarning ? 1 : 0
              },
              label: {
                show: true,
                position: 'top',
                formatter: (params: any) => {
                  const val = params.value as number | null;
                  return val === null ? "" : Math.round(val).toString();
                },
                fontSize: FONT_SIZE.xs,
                color: isWarning ? colors.chart.quarterlyLabelWarning : colors.chart.quarterlyLabelNormal
              }
            };
          }),
          barWidth: barWidth,
        },
        // Series 3: 增长率折线
        {
          name: '增长率',
          type: 'line',
          yAxisIndex: 1,
          data: growthSeries.map((value, idx) => {
            const status = quarterlyStatuses[idx];
            const isWarning = status === 'warning' || status === 'danger';

            return {
              value: value,
              label: {
                show: true,
                position: 'top',
                formatter: (params: any) => {
                  const val = params.value as number | null;
                  return val === null ? "" : `${(val * 100).toFixed(1)}%`;
                },
                fontSize: FONT_SIZE.sm,
                fontWeight: 'bold',
                color: isWarning ? colors.chart.quarterlyLabelWarning : colors.chart.quarterlyLabelNormal
              }
            };
          }),
          smooth: true,
          lineStyle: { color: colors.chart.growthLine, width: 1 },
          itemStyle: {
            color: (params: any) => {
              const value = params.value as number | null;
              return getGrowthPointColor(value);
            }
          },
          symbol: 'circle',
          symbolSize: 8,
          markLine: {
            symbol: ['none', 'none'],
            label: {
              show: true,
              position: 'end',
              formatter: '预警线 5%',
              color: '#ffc000',  // 橙色
              fontSize: FONT_SIZE.xs,
              fontWeight: 500
            },
            lineStyle: {
              color: '#ffc000',  // 橙色预警线
              type: 'dashed',
              width: 1
            },
            data: [{ yAxis: 0.05 }]
          }
        }
      ]
    };
  }, [kpi, monthlyActualSeries2025, monthlyActualSeries2026, progressMode]);

  const monthlyShareChartOption = useMemo(() => {
    if (!kpi) return null;

    const targetColor = colors.chart.claimRate;
    const actualColor = colors.chart.expenseRate;
    const growthColor = colors.status.good;
    const warningColor = colors.status.warning;
    const orangeColor = "#FF9500"; // 橙色（预警时柱状图）
    const darkRedColor = "#8B0000"; // 深红色（预警时文字）
    const grayColor = "#6B7280"; // 灰色（柱状图标签默认）
    const blueColor = "#3B82F6"; // 蓝色（折线图标签默认）
    const darkBlueColor = "#1E40AF"; // 深蓝色（折线图线条）

    const monthlyEstimateTargets =
      progressMode === "linear" ? kpi.monthlyTargetsLinear :
      progressMode === "actual2025" ? kpi.monthlyTargetsActual2025 :
      kpi.monthlyTargets;
    const monthlyCurrentForGrowth = monthlyActualSeries2026.map(
      (value, idx) => value ?? monthlyEstimateTargets[idx]
    );
    const growthSeries = monthlyCurrentForGrowth.map((current, idx) => {
      const baseline = monthlyActualSeries2025[idx];
      if (baseline === null || current === null) return null;
      return safeDivide(current - baseline, baseline).value;
    });

    const totalTarget = kpi.annual;
    const totalActual2025 = monthlyActualSeries2025.reduce(
      (sum: number, v) => (v === null ? sum : sum + v),
      0
    );
    const targetShare = totalTarget > 0
      ? monthlyEstimateTargets.map((v) => v / totalTarget)
      : Array.from({ length: 12 }, () => null);
    const actualShare = totalActual2025 > 0
      ? monthlyActualSeries2025.map((v) => (v === null ? null : v / totalActual2025))
      : Array.from({ length: 12 }, () => null);

    const barWidth = Math.round(24 * 1.618);
    const warningThreshold = 0.05; // 5%预警线

    // 为2025实际占比数据生成颜色（对应增长率低于5%时变橙色）
    const actualBarColors = actualShare.map((v, idx) => {
      const growthRate = growthSeries[idx];
      return growthRate !== null && growthRate < warningThreshold ? orangeColor : actualColor;
    });

    const barLabel = {
      show: true,
      position: "top" as const,
      fontWeight: "bold" as const,
      overflow: "truncate" as const,
      width: barWidth,
      formatter: (params: any) => {
        const value = params?.value as number | null;
        if (value === null) return "";
        const growthRate = growthSeries[params.dataIndex];
        const isWarning = growthRate !== null && growthRate < warningThreshold;
        return `{${isWarning ? 'warning' : 'normal'}|${(value * 100).toFixed(1)}%}`;
      },
      rich: {
        normal: {
          color: grayColor,
        },
        warning: {
          color: darkRedColor,
        },
      },
    };

    return {
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const items = Array.isArray(params) ? params : [params];
          const title = items[0]?.axisValue ?? "";
          const lines = items.map((item: any) => {
            const value = item.value as number | null;
            const isRate = item.seriesName === "增长率";
            const text = value === null ? "—" : `${(value * 100).toFixed(1)}%`;
            return `${item.marker}${item.seriesName}: ${text}`;
          });
          return [title, ...lines].join("<br/>");
        },
      },
      legend: { data: ["2026规划占比", "2025实际占比", "增长率"] },
      xAxis: {
        type: "category",
        data: Array.from({ length: 12 }, (_, i) => `${i + 1}月`),
        splitLine: { show: false },
      },
      yAxis: [
        {
          type: "value",
          name: "占比",
          axisLabel: { formatter: (value: number) => `${(value * 100).toFixed(1)}%` },
          splitLine: { show: false },
        },
        {
          type: "value",
          name: "增长率",
          axisLabel: { formatter: (value: number) => `${(value * 100).toFixed(1)}%` },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          type: "bar",
          data: targetShare,
          name: "2026规划占比",
          itemStyle: { color: targetColor },
          barMaxWidth: barWidth,
          label: barLabel,
        },
        {
          type: "bar",
          data: actualShare,
          name: "2025实际占比",
          itemStyle: {
            color: (params: any) => actualBarColors[params.dataIndex] ?? actualColor,
          },
          barMaxWidth: barWidth,
          label: barLabel,
          barGap: "30%",
        },
        {
          type: "line",
          data: growthSeries,
          name: "增长率",
          yAxisIndex: 1,
          lineStyle: {
            color: darkBlueColor, // 统一为深蓝色
          },
          itemStyle: {
            color: darkBlueColor, // 统一为深蓝色
          },
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          label: {
            show: true,
            position: "top",
            fontWeight: "bold",
            formatter: (params: any) => {
              const value = params?.value as number | null;
              if (value === null) return "";
              const isWarning = value !== null && value < warningThreshold;
              return `{${isWarning ? 'warning' : 'normal'}|${(value * 100).toFixed(1)}%}`;
            },
            rich: {
              normal: {
                color: blueColor,
              },
              warning: {
                color: darkRedColor,
              },
            },
          },
          markLine: {
            symbol: "none",
            lineStyle: { color: warningColor, type: "dashed" },
            label: { formatter: "预警线 5%" },
            data: [{ yAxis: 0.05 }],
          },
        },
      ],
      grid: { left: 48, right: 60, top: 40, bottom: 30 },
    };
  }, [kpi, monthlyActualSeries2025, monthlyActualSeries2026, progressMode]);

  const quarterlyShareChartOption = useMemo(() => {
    if (!kpi) return null;

    const targetColor = colors.chart.claimRate;
    const actualColor = colors.chart.expenseRate;
    const growthColor = colors.status.good;
    const warningColor = colors.status.warning;
    const orangeColor = "#FF9500"; // 橙色（预警时柱状图）
    const darkRedColor = "#8B0000"; // 深红色（预警时文字）
    const grayColor = "#6B7280"; // 灰色（柱状图标签默认）
    const blueColor = "#3B82F6"; // 蓝色（折线图标签默认）
    const darkBlueColor = "#1E40AF"; // 深蓝色（折线图线条）

    const monthlyEstimateTargets =
      progressMode === "linear" ? kpi.monthlyTargetsLinear :
      progressMode === "actual2025" ? kpi.monthlyTargetsActual2025 :
      kpi.monthlyTargets;
    const monthlyCurrentForGrowth = monthlyActualSeries2026.map(
      (value, idx) => value ?? monthlyEstimateTargets[idx]
    );

    const quarterlyTargets = monthlyToQuarterly(monthlyEstimateTargets);
    const quarterlyActuals2025 = monthlyToQuarterly(
      monthlyActualSeries2025.map((v) => v ?? 0)
    ).map((value, idx) => {
      const hasAny = monthlyActualSeries2025
        .slice(idx * 3, idx * 3 + 3)
        .some((v) => v !== null);
      return hasAny ? value : null;
    });
    const quarterlyCurrent = monthlyToQuarterly(
      monthlyCurrentForGrowth.map((v) => v ?? 0)
    ).map((value, idx) => {
      const hasAny = monthlyCurrentForGrowth
        .slice(idx * 3, idx * 3 + 3)
        .some((v) => v !== null);
      return hasAny ? value : null;
    });

    const growthSeries = quarterlyCurrent.map((current, idx) => {
      const baseline = quarterlyActuals2025[idx];
      if (baseline === null || current === null) return null;
      return safeDivide(current - baseline, baseline).value;
    });

    const totalTarget = kpi.annual;
    const totalActual2025 = quarterlyActuals2025.reduce(
      (sum: number, v) => (v === null ? sum : sum + v),
      0
    );
    const targetShare = totalTarget > 0
      ? quarterlyTargets.map((v) => v / totalTarget)
      : Array.from({ length: 4 }, () => null);
    const actualShare = totalActual2025 > 0
      ? quarterlyActuals2025.map((v) => (v === null ? null : v / totalActual2025))
      : Array.from({ length: 4 }, () => null);

    const barWidth = Math.round(24 * 1.618);
    const warningThreshold = 0.05; // 5%预警线

    // 为2025实际占比数据生成颜色（对应增长率低于5%时变橙色）
    const actualBarColors = actualShare.map((v, idx) => {
      const growthRate = growthSeries[idx];
      return growthRate !== null && growthRate < warningThreshold ? orangeColor : actualColor;
    });

    const barLabel = {
      show: true,
      position: "top" as const,
      fontWeight: "bold" as const,
      overflow: "truncate" as const,
      width: barWidth,
      formatter: (params: any) => {
        const value = params?.value as number | null;
        if (value === null) return "";
        const growthRate = growthSeries[params.dataIndex];
        const isWarning = growthRate !== null && growthRate < warningThreshold;
        return `{${isWarning ? 'warning' : 'normal'}|${(value * 100).toFixed(1)}%}`;
      },
      rich: {
        normal: {
          color: grayColor,
        },
        warning: {
          color: darkRedColor,
        },
      },
    };

    return {
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const items = Array.isArray(params) ? params : [params];
          const title = items[0]?.axisValue ?? "";
          const lines = items.map((item: any) => {
            const value = item.value as number | null;
            const text = value === null ? "—" : `${(value * 100).toFixed(1)}%`;
            return `${item.marker}${item.seriesName}: ${text}`;
          });
          return [title, ...lines].join("<br/>");
        },
      },
      legend: { data: ["2026规划占比", "2025实际占比", "增长率"] },
      xAxis: {
        type: "category",
        data: ["一季度", "二季度", "三季度", "四季度"],
        splitLine: { show: false },
      },
      yAxis: [
        {
          type: "value",
          name: "占比",
          axisLabel: { formatter: (value: number) => `${(value * 100).toFixed(1)}%` },
          splitLine: { show: false },
        },
        {
          type: "value",
          name: "增长率",
          axisLabel: { formatter: (value: number) => `${(value * 100).toFixed(1)}%` },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          type: "bar",
          data: targetShare,
          name: "2026规划占比",
          itemStyle: { color: targetColor },
          barMaxWidth: barWidth,
          label: barLabel,
        },
        {
          type: "bar",
          data: actualShare,
          name: "2025实际占比",
          itemStyle: {
            color: (params: any) => actualBarColors[params.dataIndex] ?? actualColor,
          },
          barMaxWidth: barWidth,
          label: barLabel,
          barGap: "30%",
        },
        {
          type: "line",
          data: growthSeries,
          name: "增长率",
          yAxisIndex: 1,
          lineStyle: {
            color: darkBlueColor, // 统一为深蓝色
          },
          itemStyle: {
            color: darkBlueColor, // 统一为深蓝色
          },
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          label: {
            show: true,
            position: "top",
            fontWeight: "bold",
            formatter: (params: any) => {
              const value = params?.value as number | null;
              if (value === null) return "";
              const isWarning = value !== null && value < warningThreshold;
              return `{${isWarning ? 'warning' : 'normal'}|${(value * 100).toFixed(1)}%}`;
            },
            rich: {
              normal: {
                color: blueColor,
              },
              warning: {
                color: darkRedColor,
              },
            },
          },
          markLine: {
            symbol: "none",
            lineStyle: { color: warningColor, type: "dashed" },
            label: { formatter: "预警线 5%" },
            data: [{ yAxis: 0.05 }],
          },
        },
      ],
      grid: { left: 48, right: 60, top: 40, bottom: 30 },
    };
  }, [kpi, monthlyActualSeries2025, monthlyActualSeries2026, progressMode]);

  // 季度保费规划图数据（UniversalChart格式）
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

    // 增长率计算：(2026目标 - 2025实际) / 2025实际
    const growthSeries = quarterlyTargets.map((target, idx) => {
      const baseline = quarterlyActuals2025[idx];
      if (baseline === null || baseline === 0 || target === null) return null;
      return target / baseline - 1;
    });

    return {
      quarterlyTargets,
      quarterlyActuals2025,
      quarterlyCurrent: quarterlyTargets,  // 使用目标值作为 current
      totalTarget: kpi.annual,
      totalActual2025: quarterlyActuals2025.reduce(
        (sum: number, v) => (v === null ? sum : sum + v),
        0
      ),
      valueType: 'absolute',
      growthSeries,  // 手动传递增长率
    };
  }, [kpi, monthlyActualSeries2025, progressMode]);

  // 月度保费规划图数据（UniversalChart格式）
  const monthlyPremiumData = useMemo<MonthlyDataInput | null>(() => {
    if (!kpi) return null;

    // 1. 计算YTD实际
    const ytdActual = actualsPeriod2026.ytd ?? 0;

    // 2. 动态计算未来月份目标
    const dynamicTargets = calculateFutureTargets(
      kpi.annual,
      ytdActual,
      month,
      progressMode,
      weights,
      monthlyActualSeries2025
    );

    // 3. 合并实际数据与规划目标
    const monthlyCurrent = dynamicTargets.map((plannedTarget, idx) => {
      const monthIndex = idx + 1;

      // 已过月份：优先使用实际数据
      if (monthIndex <= month) {
        return monthlyActualSeries2026[idx] ?? plannedTarget;
      }

      // 未来月份：使用动态计算的规划目标
      return plannedTarget;
    });

    // 4. 增长率计算
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
  }, [kpi, monthlyActualSeries2025, monthlyActualSeries2026, progressMode, month, weights, actualsPeriod2026]);

  // 总公司预测图数据（UniversalChart格式）
  const hqPredictionData = useMemo<HqPredictionDataInput | null>(() => {
    if (!hqPrediction || !hqPrediction[product]) return null;

    const productData = hqPrediction[product];
    const monthlyData = productData.monthly;

    // 提取累计目标和累计实际
    const cumulativeTargets = monthlyData.map((m: any) => m.cumTarget);
    const cumulativeCurrent = monthlyData.map((m: any) => m.cumActual);

    // 对于2025基线，暂时使用累计目标的80%作为模拟数据
    // TODO: 如果有2025年总公司实际数据，应该使用真实的累计值
    const cumulativeActuals2025 = cumulativeTargets.map((target: number) => target * 0.85);

    return {
      cumulativeTargets,
      cumulativeActuals2025,
      cumulativeCurrent,
      totalTarget: productData.annualTarget,
      totalActual2025: cumulativeActuals2025[11] || 0, // 12月的累计值即为全年值
      valueType: 'achievement',
    };
  }, [hqPrediction, product]);

  const baseline2025 = useMemo(() => {
    if (!annualActualAgg2025) return null;
    const key = `${viewKey}__${product}`;
    return annualActualAgg2025.get(key) ?? 0;
  }, [annualActualAgg2025, viewKey, product]);

  const dataDiagnostics = useMemo(() => {
    const count2025 = monthlyActuals2025?.records?.length ?? 0;
    const count2026 = monthlyActuals2026?.records?.length ?? 0;
    const first2025 = monthlyActualSeries2025.find((v) => v !== null) ?? null;
    return { count2025, count2026, first2025 };
  }, [monthlyActuals2025, monthlyActuals2026, monthlyActualSeries2025]);

  if (!kpi || !chartOption) {
    return <div className="text-sm text-slate-600">正在加载数据…</div>;
  }

  const growthRateYtd = kpi.growthMetrics?.growth_ytd_rate ?? null;
  const growthVariant = growthRateYtd === null ? undefined : growthRateYtd >= 0 ? "good" : "danger";

  return (
    <div className="space-y-6">
      <section className="rounded-xl border p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-slate-600">视角</label>
            <select
              className="mt-1 rounded border px-2 py-1 text-sm"
              value={viewKey}
              onChange={(e) => setViewKey(e.target.value)}
            >
              <option value="all">全省</option>
              <option value="local">同城</option>
              <option value="remote">异地</option>
              {orgs
                .filter((o) => o.org_id !== "SC_local_benbu" && o.org_id !== "SC_local_xicai_junyuan")
                .map((o) => (
                  <option key={o.org_id} value={o.org_id}>
                    {o.org_cn}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600">产品</label>
            <select className="mt-1 rounded border px-2 py-1 text-sm" value={product} onChange={(e) => setProduct(e.target.value as any)}>
              <option value="total">汇总</option>
              <option value="auto">车险</option>
              <option value="property">财产险</option>
              <option value="life">人身险</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600">截至月份</label>
            <input className="mt-1 w-24 rounded border px-2 py-1 text-sm" type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-xs text-slate-600">时间进度口径</label>
            <select className="mt-1 rounded border px-2 py-1 text-sm" value={progressMode} onChange={(e) => setProgressMode(e.target.value as any)}>
              <option value="weighted">目标权重</option>
              <option value="linear">线性月份</option>
              <option value="actual2025">2025年实际</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-slate-500">
            2025 年度基线：{baseline2025 ?? "—"}（万元） · 同比口径：2026 实际 vs 2025 同期实际
            <div className="mt-1">
              数据诊断：2025 分月 {dataDiagnostics.count2025} 条，2026 分月 {dataDiagnostics.count2026} 条，
              2025 首月汇总 {dataDiagnostics.first2025 === null ? "—" : Math.round(dataDiagnostics.first2025)} 万元
            </div>
            <button
              type="button"
              className="mt-2 rounded border px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
              onClick={() => {
                lsRemove(LS_KEYS.actualsMonthly2025);
                lsRemove(LS_KEYS.actualsMonthly2026);
                setDataResetTick((v) => v + 1);
              }}
            >
              清空本地分月数据缓存
            </button>
          </div>
        </div>
      </section>

      {/* 季度保费规划图 - 使用 UniversalChart 组件 */}
      {quarterlyPremiumData && (
        <UniversalChart
          chartType="quarterlyPremium"
          data={createQuarterlyPremiumAdapter().adapt(quarterlyPremiumData)}
          config={{
            title: generateChartTitle(viewLabel, {
              product,
              granularity: 'quarterly',
              dataType: 'premium',
              progressMode,
            }),
            height: 360,
          }}
        />
      )}

      {/* 月度保费规划图 - 使用 UniversalChart 组件 */}
      {monthlyPremiumData && (
        <UniversalChart
          chartType="monthlyPremium"
          data={createMonthlyPremiumAdapter().adapt(monthlyPremiumData)}
          config={{
            title: generateChartTitle(viewLabel, {
              product,
              granularity: 'monthly',
              dataType: 'premium',
              progressMode,
            }),
            height: 360,
            showDataLabel: true,  // 显式启用增长率标签
            currentMonth: month,  // 传入当前截至月份
          }}
        />
      )}

      {/* 总公司目标达成预测 */}
      {hqPrediction && (
        <section className="rounded-xl border p-4 bg-blue-50">
          <div className="mb-4">
            <div className="text-base font-semibold text-blue-900">总公司目标达成预测</div>
            <div className="text-xs text-blue-700 mt-1">
              {hqPrediction.total?.dataSource === 'actual'
                ? '基于三级机构实际完成情况，预测四川分公司对总公司目标的达成度（不区分三级机构）'
                : `基于三级机构年度目标（按${progressMode === 'linear' ? '线性' : progressMode === 'weighted' ? '目标权重' : '2025实际'}口径拆分），预测四川分公司对总公司目标的达成度（不区分三级机构）`
              }
            </div>
            {hqPrediction.total?.dataSource === 'target' && (
              <div className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                当前使用目标数据测算，导入2026年月度实际数据后将自动切换为实际数据
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
            {["auto", "property", "life", "total"].map((prod) => {
              const data = hqPrediction[prod];
              const prodName = productLabel[prod as ProductView];
              const latestMonth = data.monthly[month - 1];
              const achievementRate = latestMonth?.rate ? (latestMonth.rate * 100).toFixed(1) : "—";
              const rateVariant = latestMonth?.rate && latestMonth.rate >= 1 ? "good" : latestMonth?.rate && latestMonth.rate < 0.8 ? "danger" : undefined;

              return (
                <div key={prod} className="rounded-lg border bg-white p-3">
                  <div className="text-xs text-slate-600">{prodName}</div>
                  <div className="mt-1 text-sm">
                    <span className="font-medium">总公司目标:</span> {Math.round(data.annualTarget)} 万元
                  </div>
                  <div className="mt-1 text-sm">
                    <span className="font-medium">YTD实际:</span> {Math.round(latestMonth?.cumActual ?? 0)} 万元
                  </div>
                  <div className={`mt-2 text-lg font-bold ${rateVariant === "good" ? "text-green-600" : rateVariant === "danger" ? "text-red-600" : "text-blue-600"}`}>
                    达成率: {achievementRate}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* 当前选择产品的详细预测图表 - 使用 UniversalChart 组件 */}
          {hqPredictionData && (
            <UniversalChart
              chartType="hqPrediction"
              data={createHqPredictionAdapter().adapt(hqPredictionData)}
              config={{
                title: `${productLabel[product]} - 月度累计达成预测`,
                height: 360,
              }}
            />
          )}
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <KpiCard title="年度目标" value={`${Math.round(kpi.annual)} 万元`} />
        <KpiCard title="截至本月目标（YTD）" value={`${Math.round(kpi.ytdTarget)} 万元`} />
        <KpiCard title="YTD实际" value={actualsPeriod2026.ytd === null ? "—" : `${Math.round(actualsPeriod2026.ytd)} 万元`} />
        <KpiCard
          title="年度达成率"
          value={actualsPeriod2026.ytd === null ? "—" : `${((actualsPeriod2026.ytd / kpi.annual) * 100).toFixed(1)}%`}
        />
        <KpiCard
          title="时间进度达成率"
          value={
            actualsPeriod2026.ytd === null
              ? "—"
              : `${((progressMode === "linear" ? kpi.timeAchYearLinear : progressMode === "weighted" ? kpi.timeAchYearWeighted : kpi.timeAchYearActual2025)! * 100).toFixed(2)}%`
          }
          hint={actualsPeriod2026.ytd === null ? "请在 /import 导入 2026 月度实际后点亮" : undefined}
        />
        <KpiCard 
          title="年累计增长率" 
          value={formatGrowthRate(kpi.growthMetrics?.growth_ytd_rate ?? null)}
          variant={growthVariant}
          hint={
            kpi.growthMetrics?.growth_ytd_rate === null
              ? "需同时具备 2025/2026 同期月度实际数据（无基期或分母为0将显示—）"
              : undefined
          }
        />
      </section>

      <section className="rounded-xl border p-4">
        <div className="mb-2 text-sm font-medium">季度目标（派生）</div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {kpi.quarterlyTargets.map((v: number, idx: number) => (
            <div key={idx} className="rounded-lg border p-3">
              <div className="text-xs text-slate-600">Q{idx + 1}</div>
              <div className="mt-1 text-base font-semibold">{Math.round(v)} 万元</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <div className="text-sm font-medium">下一步数据准备（严格口径）</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>导入 2026 月度实际（或先录入年度实际再按权重拆月）后，达成率与时间进度达成率自动生效。</li>
          <li>导入 2025 分月基线后，当月/当季/年累计增长率与增量自动点亮。</li>
        </ul>
      </section>
    </div>
  );
}

function KpiCard({
  title,
  value,
  hint,
  variant,
}: {
  title: string;
  value: string;
  hint?: string;
  variant?: "good" | "danger";
}) {
  const variantCls =
    variant === "good"
      ? "border-[color:var(--status-good)]"
      : variant === "danger"
        ? "border-[color:var(--status-danger)]"
        : "";

  return (
    <div className={`rounded-xl border p-4 ${variantCls}`.trim()}>
      <div className="text-xs text-slate-600">{title}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
      {hint ? <div className="mt-2 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}
