"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Org } from "@/schemas/types";
import { allocateAnnualToMonthly, monthlyToQuarterly, monthlyToYtd } from "@/domain/allocation";
import {
  linearProgressYear,
  weightedProgressYear,
  linearProgressQuarter,
  weightedProgressQuarter,
  monthToQuarter,
} from "@/domain/time";
import { calculateGrowthMetrics, formatGrowthRate } from "@/domain/growth";
import { safeDivide } from "@/domain/achievement";
import { loadAllocationRules, loadOrgs, loadTargetsAnnual2026, loadActualsAnnual2025, loadActualsMonthly2026, loadActualsMonthly2025 } from "@/services/loaders";
import { lsRemove, LS_KEYS } from "@/services/storage";
import { colors } from "@/styles/tokens";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type GroupView = "all" | "local" | "remote";
type ProductView = "total" | "auto" | "property" | "life" | "health";
type ProgressMode = "linear" | "weighted";

const productLabel: Record<ProductView, string> = {
  total: "汇总",
  auto: "车险",
  property: "财产险",
  life: "人身险",
  health: "健康险",
};

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

  useEffect(() => {
    (async () => {
      const [o, r, t, a25, m25, m26] = await Promise.all([
        loadOrgs(),
        loadAllocationRules(),
        loadTargetsAnnual2026(),
        loadActualsAnnual2025(),
        loadActualsMonthly2025(),
        loadActualsMonthly2026(),
      ]);
      setOrgs(o.orgs);
      setWeights(r.rules[0].weights);
      setAnnualTargets(t);
      setAnnualActuals2025(a25);
      setMonthlyActuals2025(m25);
      setMonthlyActuals2026(m26);
    })().catch((e) => console.error(e));
  }, [dataResetTick]);

  const orgMap = useMemo(() => new Map(orgs.map((o) => [o.org_id, o])), [orgs]);

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
    const quarterlyTargets = monthlyToQuarterly(monthlyTargets);
    const ytdTarget = monthlyToYtd(monthlyTargets, month);

    const q = Math.ceil(month / 3);
    const qtdTarget = quarterlyTargets[q - 1];

    const progressLinearYear = linearProgressYear(month);
    const progressWeightedYear = weightedProgressYear(weights, month);

    const progressLinearQuarter = linearProgressQuarter(month);
    const progressWeightedQuarter = weightedProgressQuarter(weights, month);

    const expectedCumYearLinear = annual * progressLinearYear;
    const expectedCumYearWeighted = annual * progressWeightedYear;

    const timeAchYearLinear =
      actualsPeriod2026.ytd === null ? null : safeDivide(actualsPeriod2026.ytd, expectedCumYearLinear).value;
    const timeAchYearWeighted =
      actualsPeriod2026.ytd === null ? null : safeDivide(actualsPeriod2026.ytd, expectedCumYearWeighted).value;

    // 计算增长率指标（严格口径：2026 实际 vs 2025 同期实际）
    const growthMetrics = calculateGrowthMetrics(actualsPeriod2026, actualsPeriod2025);

    return {
      annual,
      monthlyTargets,
      monthlyTargetsLinear,
      quarterlyTargets,
      ytdTarget,
      qtdTarget,
      progressLinearYear,
      progressWeightedYear,
      progressLinearQuarter,
      progressWeightedQuarter,
      timeAchYearLinear,
      timeAchYearWeighted,
      growthMetrics,
      ytdActual2025: actualsPeriod2025.ytd,
    };
  }, [annualTargetAgg, weights, viewKey, product, month, actualsPeriod2026, actualsPeriod2025]);

  const chartOption = useMemo(() => {
    if (!kpi) return null;

    const targetColor = colors.chart.claimRate;
    const actualColor = colors.chart.expenseRate;
    const growthColor = colors.status.good;
    const warningColor = colors.status.warning;

    const monthlyEstimateTargets =
      progressMode === "linear" ? kpi.monthlyTargetsLinear : kpi.monthlyTargets;
    const monthlyCurrentForGrowth = monthlyActualSeries2026.map(
      (value, idx) => value ?? monthlyEstimateTargets[idx]
    );
    const growthSeries = monthlyCurrentForGrowth.map((current, idx) => {
      const baseline = monthlyActualSeries2025[idx];
      if (baseline === null || current === null) return null;
      return safeDivide(current - baseline, baseline).value;
    });

    const barWidth = Math.round(24 * 1.618);
    const barLabel = {
      show: true,
      position: "top" as const,
      fontWeight: "bold" as const,
      overflow: "truncate" as const,
      width: barWidth,
      formatter: (params: any) => {
        const value = params?.value as number | null;
        return value === null ? "" : `${Math.round(value)}`;
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
          itemStyle: { color: actualColor },
          barMaxWidth: barWidth,
          label: barLabel,
          barGap: "30%",
        },
        {
          type: "line",
          data: growthSeries,
          name: "增长率",
          yAxisIndex: 1,
          lineStyle: { color: growthColor },
          itemStyle: { color: growthColor },
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          label: {
            show: true,
            position: "top",
            fontWeight: "bold",
            formatter: (params: any) => {
              const value = params?.value as number | null;
              return value === null ? "" : `${(value * 100).toFixed(1)}%`;
            },
          },
          markLine: {
            symbol: "none",
            lineStyle: { color: warningColor, type: "dashed" },
            label: { formatter: "预警线 3%" },
            data: [{ yAxis: 0.03 }],
          },
        },
      ],
      grid: { left: 48, right: 60, top: 40, bottom: 30 },
    };
  }, [kpi, monthlyActualSeries2025, monthlyActualSeries2026, progressMode]);

  const quarterlyChartOption = useMemo(() => {
    if (!kpi) return null;

    const targetColor = colors.chart.claimRate;
    const actualColor = colors.chart.expenseRate;
    const growthColor = colors.status.good;
    const warningColor = colors.status.warning;

    const monthlyEstimateTargets =
      progressMode === "linear" ? kpi.monthlyTargetsLinear : kpi.monthlyTargets;
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

    const barWidth = Math.round(24 * 1.618);
    const barLabel = {
      show: true,
      position: "top" as const,
      fontWeight: "bold" as const,
      overflow: "truncate" as const,
      width: barWidth,
      formatter: (params: any) => {
        const value = params?.value as number | null;
        return value === null ? "" : `${Math.round(value)}`;
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
        data: ["一季度", "二季度", "三季度", "四季度"],
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
          data: quarterlyTargets,
          name: "2026目标",
          itemStyle: { color: targetColor },
          barMaxWidth: barWidth,
          label: barLabel,
        },
        {
          type: "bar",
          data: quarterlyActuals2025,
          name: "2025实际",
          itemStyle: { color: actualColor },
          barMaxWidth: barWidth,
          label: barLabel,
          barGap: "30%",
        },
        {
          type: "line",
          data: growthSeries,
          name: "增长率",
          yAxisIndex: 1,
          lineStyle: { color: growthColor },
          itemStyle: { color: growthColor },
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          label: {
            show: true,
            position: "top",
            fontWeight: "bold",
            formatter: (params: any) => {
              const value = params?.value as number | null;
              return value === null ? "" : `${(value * 100).toFixed(1)}%`;
            },
          },
          markLine: {
            symbol: "none",
            lineStyle: { color: warningColor, type: "dashed" },
            label: { formatter: "预警线 3%" },
            data: [{ yAxis: 0.03 }],
          },
        },
      ],
      grid: { left: 48, right: 60, top: 40, bottom: 30 },
    };
  }, [kpi, monthlyActualSeries2025, monthlyActualSeries2026, progressMode]);

  const monthlyShareChartOption = useMemo(() => {
    if (!kpi) return null;

    const targetColor = colors.chart.claimRate;
    const actualColor = colors.chart.expenseRate;
    const growthColor = colors.status.good;
    const warningColor = colors.status.warning;

    const monthlyEstimateTargets =
      progressMode === "linear" ? kpi.monthlyTargetsLinear : kpi.monthlyTargets;
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
    const barLabel = {
      show: true,
      position: "top" as const,
      fontWeight: "bold" as const,
      overflow: "truncate" as const,
      width: barWidth,
      formatter: (params: any) => {
        const value = params?.value as number | null;
        return value === null ? "" : `${(value * 100).toFixed(1)}%`;
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
          itemStyle: { color: actualColor },
          barMaxWidth: barWidth,
          label: barLabel,
          barGap: "30%",
        },
        {
          type: "line",
          data: growthSeries,
          name: "增长率",
          yAxisIndex: 1,
          lineStyle: { color: growthColor },
          itemStyle: { color: growthColor },
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          label: {
            show: true,
            position: "top",
            fontWeight: "bold",
            formatter: (params: any) => {
              const value = params?.value as number | null;
              return value === null ? "" : `${(value * 100).toFixed(1)}%`;
            },
          },
          markLine: {
            symbol: "none",
            lineStyle: { color: warningColor, type: "dashed" },
            label: { formatter: "预警线 3%" },
            data: [{ yAxis: 0.03 }],
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

    const monthlyEstimateTargets =
      progressMode === "linear" ? kpi.monthlyTargetsLinear : kpi.monthlyTargets;
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
    const barLabel = {
      show: true,
      position: "top" as const,
      fontWeight: "bold" as const,
      overflow: "truncate" as const,
      width: barWidth,
      formatter: (params: any) => {
        const value = params?.value as number | null;
        return value === null ? "" : `${(value * 100).toFixed(1)}%`;
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
          itemStyle: { color: actualColor },
          barMaxWidth: barWidth,
          label: barLabel,
          barGap: "30%",
        },
        {
          type: "line",
          data: growthSeries,
          name: "增长率",
          yAxisIndex: 1,
          lineStyle: { color: growthColor },
          itemStyle: { color: growthColor },
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          label: {
            show: true,
            position: "top",
            fontWeight: "bold",
            formatter: (params: any) => {
              const value = params?.value as number | null;
              return value === null ? "" : `${(value * 100).toFixed(1)}%`;
            },
          },
          markLine: {
            symbol: "none",
            lineStyle: { color: warningColor, type: "dashed" },
            label: { formatter: "预警线 3%" },
            data: [{ yAxis: 0.03 }],
          },
        },
      ],
      grid: { left: 48, right: 60, top: 40, bottom: 30 },
    };
  }, [kpi, monthlyActualSeries2025, monthlyActualSeries2026, progressMode]);

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
              <option value="health">健康险</option>
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

      <section className="rounded-xl border p-4">
        <div className="mb-2 text-sm font-medium">月度规划图</div>
        <ReactECharts option={chartOption} style={{ height: 360 }} />
      </section>

      <section className="rounded-xl border p-4">
        <div className="mb-2 text-sm font-medium">月度规划占比图</div>
        <ReactECharts option={monthlyShareChartOption} style={{ height: 360 }} />
      </section>

      <section className="rounded-xl border p-4">
        <div className="mb-2 text-sm font-medium">季度规划图</div>
        <ReactECharts option={quarterlyChartOption} style={{ height: 360 }} />
      </section>

      <section className="rounded-xl border p-4">
        <div className="mb-2 text-sm font-medium">季度规划占比图</div>
        <ReactECharts option={quarterlyShareChartOption} style={{ height: 360 }} />
      </section>

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
              : `${((progressMode === "linear" ? kpi.timeAchYearLinear : kpi.timeAchYearWeighted)! * 100).toFixed(2)}%` 
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
