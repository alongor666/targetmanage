"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Org, MonthlyActualRecord, AnnualTargetRecord } from "@/schemas/types";
import { calculateActual2025Weights } from "@/domain/allocation";
import {
  calculateAutoEarnedPremium,
  calculateLifeEarnedPremium,
  calculateMaturityDays,
  calculateMaturityRate,
  calculatePropertyEarnedPremium,
  getMonthDays,
} from "@/domain/earnedPremium";
import { loadActualsMonthly2025, loadActualsMonthly2026, loadAllocationRules, loadOrgs, loadTargetsAnnual2026 } from "@/services/loaders";
import { colors } from "@/styles/tokens";
import { ChartContainer } from "@/components/charts/ChartContainer";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type ViewKey = "all" | "local" | "remote" | string;
type ProductView = "total" | "auto" | "property" | "life";
type ProgressMode = "weighted" | "linear" | "actual2025";

const productLabel: Record<ProductView, string> = {
  total: "汇总",
  auto: "车险",
  property: "财产险",
  life: "人身险",
};

const supportedProducts: Array<Exclude<ProductView, "total">> = ["auto", "property", "life"];

/**
 * 类型守卫：检查产品是否在支持列表中
 */
function isSupportedProduct(product: string): product is Exclude<ProductView, "total"> {
  return supportedProducts.includes(product as Exclude<ProductView, "total">);
}

type AutoSeries = {
  commercial: Array<number | null>;
  compulsory: Array<number | null>;
  premium: Array<number | null>;
  earned: Array<number | null>;
  hasActual: boolean[];
  missingEarned: boolean[];
};

type BasicSeries = {
  premium: Array<number | null>;
  earned: Array<number | null>;
  hasActual: boolean[];
  missingEarned: boolean[];
};

type MonthlySeries = {
  auto: AutoSeries;
  property: BasicSeries;
  life: BasicSeries;
};

const emptyMonthArray = () => Array.from({ length: 12 }, () => 0);
const emptyMonthNullArray = () => Array.from({ length: 12 }, () => null as number | null);

function matchesView(viewKey: ViewKey, org: Org): boolean {
  if (viewKey === "all") return true;
  if (viewKey === "local" || viewKey === "remote") return org.group === viewKey;
  return org.org_id === viewKey;
}

function normalizeEarned(
  earnedSums: number[],
  hasActual: boolean[],
  missingEarned: boolean[]
): Array<number | null> {
  return earnedSums.map((value, idx) => {
    if (!hasActual[idx]) return null;
    if (missingEarned[idx]) return null;
    return value;
  });
}

function normalizePremium(
  sums: number[],
  hasActual: boolean[]
): Array<number | null> {
  return sums.map((value, idx) => (hasActual[idx] ? value : null));
}

function buildActualSeries(
  records: MonthlyActualRecord[],
  orgMap: Map<string, Org>,
  viewKey: ViewKey,
  maturityDays: number[]
): MonthlySeries {
  const autoCommercial = emptyMonthArray();
  const autoCompulsory = emptyMonthArray();
  const autoEarned = emptyMonthArray();
  const autoHasActual = Array.from({ length: 12 }, () => false);
  const autoMissingEarned = Array.from({ length: 12 }, () => false);

  const propertyPremium = emptyMonthArray();
  const propertyEarned = emptyMonthArray();
  const propertyHasActual = Array.from({ length: 12 }, () => false);
  const propertyMissingEarned = Array.from({ length: 12 }, () => false);

  const lifePremium = emptyMonthArray();
  const lifeEarned = emptyMonthArray();
  const lifeHasActual = Array.from({ length: 12 }, () => false);
  const lifeMissingEarned = Array.from({ length: 12 }, () => false);

  for (const record of records) {
    if (!isSupportedProduct(record.product)) continue;
    const org = orgMap.get(record.org_id);
    if (!org || !matchesView(viewKey, org)) continue;
    const idx = record.month - 1;
    if (idx < 0 || idx > 11) continue;

    if (record.product === "auto") {
      const commercial = record.commercial_premium;
      const compulsory = record.compulsory_premium;
      if (commercial !== undefined && commercial !== null) autoCommercial[idx] += commercial;
      if (compulsory !== undefined && compulsory !== null) autoCompulsory[idx] += compulsory;
      if ((commercial ?? 0) > 0 || (compulsory ?? 0) > 0) autoHasActual[idx] = true;

      if (
        commercial === undefined ||
        commercial === null ||
        compulsory === undefined ||
        compulsory === null ||
        record.commercial_expense_rate === undefined ||
        record.commercial_expense_rate === null ||
        record.compulsory_expense_rate === undefined ||
        record.compulsory_expense_rate === null
      ) {
        if ((commercial ?? 0) > 0 || (compulsory ?? 0) > 0) {
          autoMissingEarned[idx] = true;
        }
        continue;
      }

      autoEarned[idx] += calculateAutoEarnedPremium({
        commercialPremium: commercial,
        commercialExpenseRate: record.commercial_expense_rate,
        compulsoryPremium: compulsory,
        compulsoryExpenseRate: record.compulsory_expense_rate,
        maturityDays: maturityDays[idx],
      });
      autoHasActual[idx] = true;
    }

    if (record.product === "property") {
      if (record.monthly_actual !== undefined && record.monthly_actual !== null) {
        propertyPremium[idx] += record.monthly_actual;
        propertyHasActual[idx] = true;
      }

      if (record.property_first_day_expense_rate === undefined || record.property_first_day_expense_rate === null) {
        if (record.monthly_actual) propertyMissingEarned[idx] = true;
        continue;
      }

      propertyEarned[idx] += calculatePropertyEarnedPremium({
        premium: record.monthly_actual,
        firstDayExpenseRate: record.property_first_day_expense_rate,
        maturityDays: maturityDays[idx],
      });
    }

    if (record.product === "life") {
      if (record.monthly_actual !== undefined && record.monthly_actual !== null) {
        lifePremium[idx] += record.monthly_actual;
        lifeHasActual[idx] = true;
      }

      if (record.life_first_day_expense_rate === undefined || record.life_first_day_expense_rate === null) {
        if (record.monthly_actual) lifeMissingEarned[idx] = true;
        continue;
      }

      lifeEarned[idx] += calculateLifeEarnedPremium({
        premium: record.monthly_actual,
        firstDayExpenseRate: record.life_first_day_expense_rate,
        maturityDays: maturityDays[idx],
      });
    }
  }

  const autoPremium = autoCommercial.map((value, idx) => value + autoCompulsory[idx]);

  return {
    auto: {
      commercial: normalizePremium(autoCommercial, autoHasActual),
      compulsory: normalizePremium(autoCompulsory, autoHasActual),
      premium: normalizePremium(autoPremium, autoHasActual),
      earned: normalizeEarned(autoEarned, autoHasActual, autoMissingEarned),
      hasActual: autoHasActual,
      missingEarned: autoMissingEarned,
    },
    property: {
      premium: normalizePremium(propertyPremium, propertyHasActual),
      earned: normalizeEarned(propertyEarned, propertyHasActual, propertyMissingEarned),
      hasActual: propertyHasActual,
      missingEarned: propertyMissingEarned,
    },
    life: {
      premium: normalizePremium(lifePremium, lifeHasActual),
      earned: normalizeEarned(lifeEarned, lifeHasActual, lifeMissingEarned),
      hasActual: lifeHasActual,
      missingEarned: lifeMissingEarned,
    },
  };
}

function buildActual2025Totals(
  records: MonthlyActualRecord[],
  orgMap: Map<string, Org>,
  viewKey: ViewKey,
  product: Exclude<ProductView, "total">
): Array<number | null> {
  const totals = emptyMonthArray();
  const counts = Array.from({ length: 12 }, () => 0);

  for (const record of records) {
    if (record.product !== product) continue;
    const org = orgMap.get(record.org_id);
    if (!org || !matchesView(viewKey, org)) continue;
    const idx = record.month - 1;
    if (idx < 0 || idx > 11) continue;
    totals[idx] += record.monthly_actual;
    counts[idx] += 1;
  }

  return totals.map((value, idx) => (counts[idx] > 0 ? value : null));
}

function buildTargetForecast(
  records: AnnualTargetRecord[],
  orgMap: Map<string, Org>,
  viewKey: ViewKey,
  weightsByProduct: Record<Exclude<ProductView, "total">, number[]>,
  maturityDays: number[]
): MonthlySeries {
  const autoCommercial = emptyMonthArray();
  const autoCompulsory = emptyMonthArray();
  const autoEarned = emptyMonthArray();
  const autoHasActual = Array.from({ length: 12 }, () => false);
  const autoMissingEarned = Array.from({ length: 12 }, () => false);

  const propertyPremium = emptyMonthArray();
  const propertyEarned = emptyMonthArray();
  const propertyHasActual = Array.from({ length: 12 }, () => false);
  const propertyMissingEarned = Array.from({ length: 12 }, () => false);

  const lifePremium = emptyMonthArray();
  const lifeEarned = emptyMonthArray();
  const lifeHasActual = Array.from({ length: 12 }, () => false);
  const lifeMissingEarned = Array.from({ length: 12 }, () => false);

  for (const record of records) {
    if (!isSupportedProduct(record.product)) continue;
    const org = orgMap.get(record.org_id);
    if (!org || !matchesView(viewKey, org)) continue;

    const productWeights = weightsByProduct[record.product] ?? [];
    if (productWeights.length !== 12) continue;

    if (record.product === "auto") {
      const commercialAnnual = record.commercial_premium ?? 0;
      const compulsoryAnnual = record.compulsory_premium ?? 0;

      for (let idx = 0; idx < 12; idx += 1) {
        const weight = productWeights[idx] ?? 0;
        const commercial = commercialAnnual * weight;
        const compulsory = compulsoryAnnual * weight;
        autoCommercial[idx] += commercial;
        autoCompulsory[idx] += compulsory;
        autoHasActual[idx] = autoHasActual[idx] || commercial > 0 || compulsory > 0;

        if (
          record.commercial_expense_rate === undefined ||
          record.commercial_expense_rate === null ||
          record.compulsory_expense_rate === undefined ||
          record.compulsory_expense_rate === null
        ) {
          if (commercial > 0 || compulsory > 0) autoMissingEarned[idx] = true;
          continue;
        }

        autoEarned[idx] += calculateAutoEarnedPremium({
          commercialPremium: commercial,
          commercialExpenseRate: record.commercial_expense_rate,
          compulsoryPremium: compulsory,
          compulsoryExpenseRate: record.compulsory_expense_rate,
          maturityDays: maturityDays[idx],
        });
      }
    }

    if (record.product === "property") {
      for (let idx = 0; idx < 12; idx += 1) {
        const weight = productWeights[idx] ?? 0;
        const premium = record.annual_target * weight;
        propertyPremium[idx] += premium;
        propertyHasActual[idx] = propertyHasActual[idx] || premium > 0;

        if (record.property_first_day_expense_rate === undefined || record.property_first_day_expense_rate === null) {
          if (premium > 0) propertyMissingEarned[idx] = true;
          continue;
        }

        propertyEarned[idx] += calculatePropertyEarnedPremium({
          premium,
          firstDayExpenseRate: record.property_first_day_expense_rate,
          maturityDays: maturityDays[idx],
        });
      }
    }

    if (record.product === "life") {
      for (let idx = 0; idx < 12; idx += 1) {
        const weight = productWeights[idx] ?? 0;
        const premium = record.annual_target * weight;
        lifePremium[idx] += premium;
        lifeHasActual[idx] = lifeHasActual[idx] || premium > 0;

        if (record.life_first_day_expense_rate === undefined || record.life_first_day_expense_rate === null) {
          if (premium > 0) lifeMissingEarned[idx] = true;
          continue;
        }

        lifeEarned[idx] += calculateLifeEarnedPremium({
          premium,
          firstDayExpenseRate: record.life_first_day_expense_rate,
          maturityDays: maturityDays[idx],
        });
      }
    }
  }

  const autoPremium = autoCommercial.map((value, idx) => value + autoCompulsory[idx]);

  return {
    auto: {
      commercial: normalizePremium(autoCommercial, autoHasActual),
      compulsory: normalizePremium(autoCompulsory, autoHasActual),
      premium: normalizePremium(autoPremium, autoHasActual),
      earned: normalizeEarned(autoEarned, autoHasActual, autoMissingEarned),
      hasActual: autoHasActual,
      missingEarned: autoMissingEarned,
    },
    property: {
      premium: normalizePremium(propertyPremium, propertyHasActual),
      earned: normalizeEarned(propertyEarned, propertyHasActual, propertyMissingEarned),
      hasActual: propertyHasActual,
      missingEarned: propertyMissingEarned,
    },
    life: {
      premium: normalizePremium(lifePremium, lifeHasActual),
      earned: normalizeEarned(lifeEarned, lifeHasActual, lifeMissingEarned),
      hasActual: lifeHasActual,
      missingEarned: lifeMissingEarned,
    },
  };
}

function resolveWeights(
  mode: ProgressMode,
  weights: number[],
  actual2025Weights: number[]
): { weights: number[]; mode: ProgressMode } {
  const linearWeights = Array.from({ length: 12 }, () => 1 / 12);
  const hasDefault = weights.length === 12 && weights.reduce((sum, value) => sum + value, 0) > 0;
  const hasActual2025 = actual2025Weights.reduce((sum, value) => sum + value, 0) > 0;

  if (mode === "weighted" && hasDefault) return { weights, mode: "weighted" };
  if (mode === "actual2025" && hasActual2025) return { weights: actual2025Weights, mode: "actual2025" };
  if (mode === "linear") return { weights: linearWeights, mode: "linear" };

  if (hasDefault) return { weights, mode: "weighted" };
  if (hasActual2025) return { weights: actual2025Weights, mode: "actual2025" };
  return { weights: linearWeights, mode: "linear" };
}

function mergeSeries(actual: MonthlySeries, forecast: MonthlySeries) {
  const months = 12;

  function mergeAuto(): AutoSeries {
    const commercial = emptyMonthNullArray();
    const compulsory = emptyMonthNullArray();
    const premium = emptyMonthNullArray();
    const earned = emptyMonthNullArray();
    const hasActual = Array.from({ length: months }, () => false);
    const missingEarned = Array.from({ length: months }, () => false);

    for (let idx = 0; idx < months; idx += 1) {
      if (actual.auto.hasActual[idx]) {
        commercial[idx] = actual.auto.commercial[idx];
        compulsory[idx] = actual.auto.compulsory[idx];
        premium[idx] = actual.auto.premium[idx];
        earned[idx] = actual.auto.earned[idx];
        hasActual[idx] = true;
        missingEarned[idx] = actual.auto.missingEarned[idx];
      } else {
        commercial[idx] = forecast.auto.commercial[idx];
        compulsory[idx] = forecast.auto.compulsory[idx];
        premium[idx] = forecast.auto.premium[idx];
        earned[idx] = forecast.auto.earned[idx];
        hasActual[idx] = forecast.auto.hasActual[idx];
        missingEarned[idx] = forecast.auto.missingEarned[idx];
      }
    }

    return { commercial, compulsory, premium, earned, hasActual, missingEarned };
  }

  function mergeBasic(product: "property" | "life"): BasicSeries {
    const premium = emptyMonthNullArray();
    const earned = emptyMonthNullArray();
    const hasActual = Array.from({ length: months }, () => false);
    const missingEarned = Array.from({ length: months }, () => false);

    for (let idx = 0; idx < months; idx += 1) {
      if (actual[product].hasActual[idx]) {
        premium[idx] = actual[product].premium[idx];
        earned[idx] = actual[product].earned[idx];
        hasActual[idx] = true;
        missingEarned[idx] = actual[product].missingEarned[idx];
      } else {
        premium[idx] = forecast[product].premium[idx];
        earned[idx] = forecast[product].earned[idx];
        hasActual[idx] = forecast[product].hasActual[idx];
        missingEarned[idx] = forecast[product].missingEarned[idx];
      }
    }

    return { premium, earned, hasActual, missingEarned };
  }

  return {
    auto: mergeAuto(),
    property: mergeBasic("property"),
    life: mergeBasic("life"),
  };
}

function buildTotalSeries(series: MonthlySeries) {
  const premium = emptyMonthNullArray();
  const earned = emptyMonthNullArray();

  for (let idx = 0; idx < 12; idx += 1) {
    const premiums = [series.auto.premium[idx], series.property.premium[idx], series.life.premium[idx]];
    const earnedValues = [series.auto.earned[idx], series.property.earned[idx], series.life.earned[idx]];
    const hasPremium = premiums.some((value) => value !== null && value !== undefined);
    const hasEarned = earnedValues.every((value) => value !== null && value !== undefined);

    if (hasPremium) {
      premium[idx] = premiums.reduce<number>((sum, value) => sum + (value ?? 0), 0);
    }
    if (hasEarned) {
      earned[idx] = earnedValues.reduce<number>((sum, value) => sum + (value ?? 0), 0);
    }
  }

  return { premium, earned };
}

export default function EarnedPremiumPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [weights, setWeights] = useState<number[]>([]);
  const [targets, setTargets] = useState<any>(null);
  const [monthlyActuals2025, setMonthlyActuals2025] = useState<any>(null);
  const [monthlyActuals2026, setMonthlyActuals2026] = useState<any>(null);

  const [viewKey, setViewKey] = useState<ViewKey>("all");
  const [product, setProduct] = useState<ProductView>("auto");
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(1);
  const [progressMode, setProgressMode] = useState<ProgressMode>("weighted");

  useEffect(() => {
    (async () => {
      const [orgResult, ruleResult, targetResult, actual2025, actual2026] = await Promise.all([
        loadOrgs(),
        loadAllocationRules(),
        loadTargetsAnnual2026(),
        loadActualsMonthly2025(),
        loadActualsMonthly2026(),
      ]);
      setOrgs(orgResult.orgs);
      setWeights(ruleResult.rules[0].weights);
      setTargets(targetResult);
      setMonthlyActuals2025(actual2025);
      setMonthlyActuals2026(actual2026);
    })().catch(console.error);
  }, []);

  const orgMap = useMemo(() => new Map(orgs.map((org) => [org.org_id, org])), [orgs]);

  const viewOptions = useMemo(() => {
    const options = [
      { value: "all", label: "全省" },
      { value: "local", label: "同城" },
      { value: "remote", label: "异地" },
    ];
    const orgOptions = orgs
      .filter((o) => o.org_id !== "SC_local_benbu" && o.org_id !== "SC_local_xicai_junyuan")
      .map((o) => ({ value: o.org_id, label: o.org_cn }));
    return [...options, ...orgOptions];
  }, [orgs]);

  const selectedMonth = Math.min(12, Math.max(1, month));
  const yearOptions = useMemo(() => {
    const set = new Set<number>([2026]);
    if (monthlyActuals2025?.year) set.add(monthlyActuals2025.year);
    if (monthlyActuals2026?.year) set.add(monthlyActuals2026.year);
    return Array.from(set).sort((a, b) => b - a);
  }, [monthlyActuals2025, monthlyActuals2026]);

  const statDate = useMemo(() => new Date(year, selectedMonth, 0), [year, selectedMonth]);

  const maturityDays = useMemo(() => {
    return Array.from({ length: 12 }, (_, idx) => {
      const monthIndex = idx + 1;
      const startDate = new Date(year, idx, 1);
      const monthDays = getMonthDays(year, monthIndex);
      return calculateMaturityDays(startDate, monthDays, statDate);
    });
  }, [statDate, year]);

  const actual2025Weights = useMemo<Record<Exclude<ProductView, "total">, number[]>>(() => {
    if (!monthlyActuals2025?.records?.length) {
      return {
        auto: Array(12).fill(1 / 12),
        property: Array(12).fill(1 / 12),
        life: Array(12).fill(1 / 12),
      };
    }
    return supportedProducts.reduce((acc, productKey) => {
      const monthlyTotals = buildActual2025Totals(monthlyActuals2025.records, orgMap, viewKey, productKey);
      acc[productKey] = calculateActual2025Weights(monthlyTotals);
      return acc;
    }, {} as Record<Exclude<ProductView, "total">, number[]>);
  }, [monthlyActuals2025, orgMap, viewKey]);

  const actualSeries = useMemo(() => {
    const records = (year === 2026 ? monthlyActuals2026?.records : monthlyActuals2025?.records) ?? [];
    return buildActualSeries(records, orgMap, viewKey, maturityDays);
  }, [monthlyActuals2026, monthlyActuals2025, year, orgMap, viewKey, maturityDays]);

  const forecastSeries = useMemo(() => {
    if (year !== 2026 || !targets?.records?.length) return null;

    const weightsByProduct = supportedProducts.reduce((acc, productKey) => {
      const weightsForProduct = actual2025Weights[productKey] ?? [];
      acc[productKey] = resolveWeights(progressMode, weights, weightsForProduct).weights;
      return acc;
    }, {} as Record<Exclude<ProductView, "total">, number[]>);

    return buildTargetForecast(targets.records, orgMap, viewKey, weightsByProduct, maturityDays);
  }, [targets, orgMap, viewKey, progressMode, weights, actual2025Weights, maturityDays, year]);

  const mergedSeries = useMemo(() => {
    if (!forecastSeries) return actualSeries;
    return mergeSeries(actualSeries, forecastSeries);
  }, [actualSeries, forecastSeries]);

  const totalSeries = useMemo(() => buildTotalSeries(mergedSeries), [mergedSeries]);

  const chartSeries = useMemo(() => {
    const months = Array.from({ length: selectedMonth }, (_, idx) => `${idx + 1}月`);
    const range = (values: Array<number | null>) => values.slice(0, selectedMonth);

    if (product === "auto") {
      const commercial = range(mergedSeries.auto.commercial);
      const compulsory = range(mergedSeries.auto.compulsory);
      const earned = range(mergedSeries.auto.earned);
      const premium = range(mergedSeries.auto.premium);
      const maturityRate = premium.map((value, idx) => {
        const earnedValue = earned[idx];
        if (value === null || earnedValue === null || value === 0) return null;
        return calculateMaturityRate(earnedValue, value);
      });

      return {
        months,
        premium,
        earned,
        maturityRate,
        autoStack: { commercial, compulsory },
      };
    }

    const baseSeries = product === "total" ? totalSeries : mergedSeries[product];
    const premium = range(baseSeries.premium);
    const earned = range(baseSeries.earned);
    const maturityRate = premium.map((value, idx) => {
      const earnedValue = earned[idx];
      if (value === null || earnedValue === null || value === 0) return null;
      return calculateMaturityRate(earnedValue, value);
    });

    return { months, premium, earned, maturityRate };
  }, [mergedSeries, totalSeries, product, selectedMonth]);

  const warnings = useMemo(() => {
    const messages: string[] = [];
    const hasMissing = (series: { missingEarned: boolean[]; premium: Array<number | null> }, label: string) => {
      const hasGap = series.missingEarned.slice(0, selectedMonth).some((missing, idx) => missing && (series.premium[idx] ?? 0) > 0);
      if (hasGap) messages.push(`${label}缺少首日费用率或拆分保费，已赚保费显示为 —`);
    };

    hasMissing(mergedSeries.auto, "车险");
    hasMissing(mergedSeries.property, "财产险");
    hasMissing(mergedSeries.life, "人身险");
    return messages;
  }, [mergedSeries, selectedMonth]);

  const chartOption = useMemo(() => {
    const tooltipFormatter = (params: any) => {
      const items = Array.isArray(params) ? params : [params];
      const title = items[0]?.axisValue ?? "";
      const lines = items.map((item: any) => {
        const value = item.value;
        if (value === null || value === undefined) return `${item.marker}${item.seriesName}: —`;
        const formatted = item.seriesName.includes("率") ? `${(value * 100).toFixed(1)}%` : `${Math.round(value)} 万元`;
        return `${item.marker}${item.seriesName}: ${formatted}`;
      });
      return [title, ...lines].join("<br/>");
    };

    const series: any[] = [];

    if (product === "auto" && chartSeries.autoStack) {
      series.push({
        name: "商业险保费",
        type: "bar",
        stack: "premium",
        data: chartSeries.autoStack.commercial,
        itemStyle: { color: colors.chart.targetNormal },
      });
      series.push({
        name: "交强险保费",
        type: "bar",
        stack: "premium",
        data: chartSeries.autoStack.compulsory,
        itemStyle: { color: colors.chart.targetBarNormal },
      });
    } else {
      series.push({
        name: "当月保费收入",
        type: "bar",
        data: chartSeries.premium,
        itemStyle: { color: colors.chart.targetNormal },
      });
    }

    series.push({
      name: "当月已赚保费",
      type: "bar",
      barGap: "30%",
      data: chartSeries.earned,
      itemStyle: { color: colors.chart.actual },
    });

    series.push({
      name: "满期率",
      type: "line",
      yAxisIndex: 1,
      data: chartSeries.maturityRate,
      smooth: true,
      symbol: "circle",
      symbolSize: 6,
      lineStyle: { color: colors.chart.line },
      itemStyle: { color: colors.chart.line },
    });

    return {
      tooltip: { trigger: "axis", formatter: tooltipFormatter },
      legend: {
        data: series.map((item) => item.name),
        bottom: 0,
      },
      grid: { left: 50, right: 60, top: 30, bottom: 50 },
      xAxis: {
        type: "category",
        data: chartSeries.months,
      },
      yAxis: [
        {
          type: "value",
          name: "保费（万元）",
          axisLabel: { formatter: "{value}" },
        },
        {
          type: "value",
          name: "满期率（%）",
          axisLabel: {
            formatter: (value: number) => `${(value * 100).toFixed(0)}%`,
          },
        },
      ],
      series,
    };
  }, [chartSeries, product]);

  if (!orgs.length) {
    return <div className="text-sm text-slate-600">正在加载数据…</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-slate-600">视角</label>
            <select
              className="mt-1 rounded border px-2 py-1 text-sm"
              value={viewKey}
              onChange={(e) => setViewKey(e.target.value)}
            >
              {viewOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600">产品</label>
            <select
              className="mt-1 rounded border px-2 py-1 text-sm"
              value={product}
              onChange={(e) => setProduct(e.target.value as ProductView)}
            >
              <option value="auto">车险</option>
              <option value="property">财产险</option>
              <option value="life">人身险</option>
              <option value="total">汇总</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600">年度</label>
            <select
              className="mt-1 rounded border px-2 py-1 text-sm"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {yearOptions.map((optionYear) => (
                <option key={optionYear} value={optionYear}>
                  {optionYear} 年
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600">截至月份</label>
            <input
              className="mt-1 w-24 rounded border px-2 py-1 text-sm"
              type="number"
              min={1}
              max={12}
              value={selectedMonth}
              onChange={(e) => setMonth(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600">时间进度口径</label>
            <select
              className="mt-1 rounded border px-2 py-1 text-sm"
              value={progressMode}
              onChange={(e) => setProgressMode(e.target.value as ProgressMode)}
            >
              <option value="weighted">目标权重</option>
              <option value="linear">线性月份</option>
              <option value="actual2025">2025 实际</option>
            </select>
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          统计日期：{statDate.toLocaleDateString("zh-CN")}（计入当日） · 满期天数按“当月自然天数/2 + 次月起累计”
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <ChartContainer
          title={`${productLabel[product]} · 已赚保费预测`}
          subtitle="并列柱：保费收入/已赚保费；折线：满期率"
          height="sm"
        >
          <ReactECharts option={chartOption} style={{ height: "100%" }} />
        </ChartContainer>
      </section>

      {warnings.length ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <div className="font-semibold">口径提示</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {warnings.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
