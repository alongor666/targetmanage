"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Org } from "@/schemas/types";
import {
  loadAllocationRules,
  loadOrgs,
  loadTargetsAnnual2026,
  loadActualsAnnual2025,
  loadActualsMonthly2025,
  loadActualsMonthly2026,
} from "@/services/loaders";
import { allocateAnnualToMonthly, monthlyToQuarterly, monthlyToYtd } from "@/domain/allocation";
import { calculateGrowthMetrics, formatGrowthRate } from "@/domain/growth";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type ProductView = "total" | "auto" | "property" | "life" | "health";
type PeriodMode = "month" | "quarter";

interface OrgDetailClientProps {
  orgId: string;
}

/**
 * 产品标签映射，用于显示中文产品名称
 */
const productLabel: Record<ProductView, string> = {
  total: "汇总",
  auto: "车险",
  property: "财产险",
  life: "人身险",
  health: "健康险",
};

export default function OrgDetailClient({ orgId }: OrgDetailClientProps) {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [weights, setWeights] = useState<number[]>([]);
  const [targets, setTargets] = useState<any>(null);
  const [actuals2025, setActuals2025] = useState<any>(null);
  const [monthlyActuals2025, setMonthlyActuals2025] = useState<any>(null);
  const [monthlyActuals2026, setMonthlyActuals2026] = useState<any>(null);

  const [product, setProduct] = useState<ProductView>("total");
  const [month, setMonth] = useState<number>(1);
  const [quarter, setQuarter] = useState<number>(1);
  const [periodMode, setPeriodMode] = useState<PeriodMode>("month");

  /**
   * 初始化加载机构、权重规则、2026年度目标和2025年度实际数据
   */
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
      setTargets(t);
      setActuals2025(a25);
      setMonthlyActuals2025(m25);
      setMonthlyActuals2026(m26);
    })().catch(console.error);
  }, []);

  /**
   * 根据URL参数获取当前机构信息
   */
  const org = useMemo(() => orgs.find((x) => x.org_id === orgId), [orgs, orgId]);

  /**
   * 计算当前机构按产品分类的2026年度目标
   */
  const annualTargetByProduct = useMemo(() => {
    if (!targets) return { total: 0, auto: 0, property: 0, life: 0, health: 0 };
    const out = { total: 0, auto: 0, property: 0, life: 0, health: 0 } as Record<ProductView, number>;
    for (const r of targets.records) {
      if (r.org_id !== orgId) continue;
      const productCode = r.product as ProductView;
      out[productCode] += r.annual_target;
      out.total += r.annual_target;
    }
    return out;
  }, [targets, orgId]);

  /**
   * 计算当前机构按产品分类的2025年度实际数据
   */
  const annualActual2025ByProduct = useMemo(() => {
    if (!actuals2025) return { total: 0, auto: 0, property: 0, life: 0, health: 0 };
    const out = { total: 0, auto: 0, property: 0, life: 0, health: 0 } as Record<ProductView, number>;
    for (const r of actuals2025.records) {
      if (r.org_id !== orgId) continue;
      const productCode = r.product as ProductView;
      out[productCode] += r.annual_actual;
      out.total += r.annual_actual;
    }
    return out;
  }, [actuals2025, orgId]);

  const selectedMonth = periodMode === "month" ? month : Math.min(12, Math.max(1, quarter * 3));
  const selectedQuarter = periodMode === "month" ? Math.ceil(selectedMonth / 3) : quarter;

  /**
   * 计算关键绩效指标：年度目标按权重拆解为月度、季度目标
   */
  const kpi = useMemo(() => {
    if (weights.length !== 12) return null;

    const annual = annualTargetByProduct[product] ?? 0;
    const monthlyTargets = allocateAnnualToMonthly(annual, weights, "2dp");
    const quarterlyTargets = monthlyToQuarterly(monthlyTargets);
    const ytdTarget = monthlyToYtd(monthlyTargets, selectedMonth);

    const qtdTarget = quarterlyTargets[selectedQuarter - 1];

    return { annual, monthlyTargets, quarterlyTargets, ytdTarget, qtdTarget };
  }, [weights, annualTargetByProduct, product, selectedMonth, selectedQuarter]);

  function sumActuals(records: any[], predicate: (r: any) => boolean): number | null {
    let sum = 0;
    let count = 0;
    for (const r of records) {
      if (r.org_id !== orgId) continue;
      if (product !== "total" && r.product !== product) continue;
      if (!predicate(r)) continue;
      sum += r.monthly_actual;
      count += 1;
    }
    return count > 0 ? sum : null;
  }

  const actualsPeriod2026 = useMemo(() => {
    const records = monthlyActuals2026?.records;
    if (!records?.length) return { month: null, quarter: null, ytd: null };

    const quarterStart = (selectedQuarter - 1) * 3 + 1;

    const m = sumActuals(records, (r) => r.month === selectedMonth);
    const qtd = sumActuals(records, (r) => r.month >= quarterStart && r.month <= selectedMonth);
    const ytd = sumActuals(records, (r) => r.month <= selectedMonth);

    return { month: m, quarter: qtd, ytd };
  }, [monthlyActuals2026, orgId, product, selectedMonth, selectedQuarter]);

  const actualsPeriod2025 = useMemo(() => {
    const records = monthlyActuals2025?.records;
    if (!records?.length) return { month: null, quarter: null, ytd: null };

    const quarterStart = (selectedQuarter - 1) * 3 + 1;

    const m = sumActuals(records, (r) => r.month === selectedMonth);
    const qtd = sumActuals(records, (r) => r.month >= quarterStart && r.month <= selectedMonth);
    const ytd = sumActuals(records, (r) => r.month <= selectedMonth);

    return { month: m, quarter: qtd, ytd };
  }, [monthlyActuals2025, orgId, product, selectedMonth, selectedQuarter]);

  const growthMetrics = useMemo(() => {
    return calculateGrowthMetrics(actualsPeriod2026, actualsPeriod2025);
  }, [actualsPeriod2026, actualsPeriod2025]);

  /**
   * 生成月度目标柱状图的ECharts配置
   */
  const optionMonthly = useMemo(() => {
    if (!kpi) return null;
    return {
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: Array.from({ length: 12 }, (_, i) => `${i + 1}月`) },
      yAxis: { type: "value" },
      series: [{ type: "bar", data: kpi.monthlyTargets, name: "月度目标" }],
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
    };
  }, [kpi]);

  if (!org || !kpi || !optionMonthly) {
    return <div className="text-sm text-slate-600">正在加载机构详情…</div>;
  }

  const base2025 = annualActual2025ByProduct[product] ?? 0;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <div className="text-xs text-slate-600">机构</div>
            <div className="text-lg font-semibold">
              {org.org_cn} <span className="ml-2 text-sm text-slate-500">（{org.group === "local" ? "同城" : "异地"}）</span>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-end gap-4">
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
              <label className="block text-xs text-slate-600">口径</label>
              <select className="mt-1 rounded border px-2 py-1 text-sm" value={periodMode} onChange={(e) => setPeriodMode(e.target.value as PeriodMode)}>
                <option value="month">月度</option>
                <option value="quarter">季度</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600">{periodMode === "month" ? "月份" : "季度"}</label>
              {periodMode === "month" ? (
                <input
                  className="mt-1 w-24 rounded border px-2 py-1 text-sm"
                  type="number"
                  min={1}
                  max={12}
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                />
              ) : (
                <select className="mt-1 w-24 rounded border px-2 py-1 text-sm" value={quarter} onChange={(e) => setQuarter(Number(e.target.value))}>
                  <option value={1}>一季度</option>
                  <option value={2}>二季度</option>
                  <option value={3}>三季度</option>
                  <option value={4}>四季度</option>
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          2025 年度基线（{productLabel[product]}）：{base2025 ? base2025.toFixed(2) : "—"} 万元（用于对照；增长率需 2025 分月基线后点亮）
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard title="年度目标" value={`${Math.round(kpi.annual)} 万元`} />
        <KpiCard title="截至本月目标（YTD）" value={`${Math.round(kpi.ytdTarget)} 万元`} />
        <KpiCard title="本季目标（QTD）" value={`${Math.round(kpi.qtdTarget)} 万元`} />
        <KpiCard title={periodMode === "month" ? "当月同比增长率" : "当季同比增长率"} value={formatGrowthRate(periodMode === "month" ? growthMetrics.growth_month_rate : growthMetrics.growth_quarter_rate)} />
      </section>

      <section className="rounded-xl border p-4">
        <div className="mb-2 text-sm font-medium">{productLabel[product]} · 月度目标分解</div>
        <ReactECharts option={optionMonthly} style={{ height: 360 }} />
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
        <div className="mt-3 text-xs text-slate-500">注：季度为月度目标聚合结果，年度对账应严格相等。</div>
      </section>
    </div>
  );
}

/**
 * KPI卡片组件，用于显示关键指标
 */
function KpiCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-xs text-slate-600">{title}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
      {hint ? <div className="mt-2 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}
