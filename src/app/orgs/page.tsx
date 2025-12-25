"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadOrgs, loadTargetsAnnual2026, loadActualsAnnual2025 } from "@/services/loaders";
import { UniversalChart, createMonthlyPremiumAdapter } from "@/components/charts/UniversalChart";
import type { Org } from "@/schemas/types";

type GroupView = "all" | "local" | "remote";
type ProductCode = "auto" | "property" | "life" | "total";

/**
 * 产品标签映射，用于显示中文产品名称
 */
const productLabel: Record<ProductCode, string> = {
  total: "汇总",
  auto: "车险",
  property: "财产险",
  life: "人身险",
};

const supportedProducts: Array<Exclude<ProductCode, "total">> = ["auto", "property", "life"];

function isSupportedProduct(value: string): value is Exclude<ProductCode, "total"> {
  return supportedProducts.includes(value as Exclude<ProductCode, "total">);
}

export default function OrgsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [group, setGroup] = useState<GroupView>("all");
  const [product, setProduct] = useState<ProductCode>("total");
  const [targets, setTargets] = useState<any>(null);
  const [actuals2025, setActuals2025] = useState<any>(null);

  /**
   * 初始化加载机构、2026年度目标和2025年度实际数据
   */
  useEffect(() => {
    (async () => {
      const [o, t, a25] = await Promise.all([loadOrgs(), loadTargetsAnnual2026(), loadActualsAnnual2025()]);
      setOrgs(o.orgs);
      setTargets(t);
      setActuals2025(a25);
    })().catch(console.error);
  }, []);

  const orgMap = useMemo(() => new Map(orgs.map((o) => [o.org_id, o])), [orgs]);

  // 获取三级机构列表（排除本部和西财俊苑）
  const tertiaryOrgs = useMemo(() => {
    return orgs.filter(
      (o) => o.org_id !== "SC_local_benbu" && o.org_id !== "SC_local_xicai_junyuan"
    );
  }, [orgs]);

  /**
   * 计算每个机构按产品分类的2026年度目标
   */
  const targetByOrg = useMemo(() => {
    if (!targets) return new Map<string, Record<ProductCode, number>>();
    const map = new Map<string, Record<ProductCode, number>>();

    for (const r of targets.records) {
      if (!isSupportedProduct(r.product)) continue;
      const prev = map.get(r.org_id) ?? { total: 0, auto: 0, property: 0, life: 0 };
      const product = r.product as Exclude<ProductCode, "total">;
      prev[product] += r.annual_target;
      prev.total += r.annual_target;
      map.set(r.org_id, prev);
    }
    return map;
  }, [targets]);

  /**
   * 计算每个机构按产品分类的2025年度实际数据
   */
  const actual2025ByOrg = useMemo(() => {
    if (!actuals2025) return new Map<string, Record<ProductCode, number>>();
    const map = new Map<string, Record<ProductCode, number>>();

    for (const r of actuals2025.records) {
      if (!isSupportedProduct(r.product)) continue;
      const prev = map.get(r.org_id) ?? { total: 0, auto: 0, property: 0, life: 0 };
      const product = r.product as Exclude<ProductCode, "total">;
      prev[product] += r.annual_actual;
      prev.total += r.annual_actual;
      map.set(r.org_id, prev);
    }
    return map;
  }, [actuals2025]);

  /**
   * 根据分组筛选机构，并按年度目标汇总降序排序
   */
  const filtered = useMemo(() => {
    const list =
      group === "all" ? orgs : orgs.filter((o) => o.group === group);
    // 默认按年度目标（汇总）降序
    return [...list].sort((a, b) => {
      const ta = targetByOrg.get(a.org_id)?.total ?? 0;
      const tb = targetByOrg.get(b.org_id)?.total ?? 0;
      return tb - ta;
    });
  }, [orgs, group, targetByOrg]);

  /**
   * 三级机构保费规划图数据（复用月度保费规划图的数据格式）
   * 直接使用 targetByOrg 和 actual2025ByOrg 的数据
   */
  const orgComparisonData = useMemo(() => {
    // 筛选三级机构（排除本部和西财俊苑）
    let filteredOrgs = tertiaryOrgs;
    if (group === "local") {
      filteredOrgs = tertiaryOrgs.filter((o) => o.group === "local");
    } else if (group === "remote") {
      filteredOrgs = tertiaryOrgs.filter((o) => o.group === "remote");
    }

    if (filteredOrgs.length === 0) return null;

    // 从 targetByOrg 和 actual2025ByOrg 获取数据
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

    // 计算增长率
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

    // 适配并添加自定义标签（机构名称）
    const adapted = createMonthlyPremiumAdapter().adapt(data);
    return {
      ...adapted,
      customLabels: orgNames,
    };
  }, [targetByOrg, actual2025ByOrg, tertiaryOrgs, group, product]);

  if (!targets) return <div className="text-sm text-slate-600">正在加载数据…</div>;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-slate-600">分组</label>
            <select
              className="mt-1 rounded border px-2 py-1 text-sm"
              value={group}
              onChange={(e) => setGroup(e.target.value as any)}
            >
              <option value="all">全省</option>
              <option value="local">同城</option>
              <option value="remote">异地</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600">产品</label>
            <select
              className="mt-1 rounded border px-2 py-1 text-sm"
              value={product}
              onChange={(e) => setProduct(e.target.value as any)}
            >
              <option value="total">汇总</option>
              <option value="auto">车险</option>
              <option value="property">财产险</option>
              <option value="life">人身险</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-slate-500">
            单位：万元 · 目标来源：2026 年度目标（机构×产品） · 2025 基线：年度层（用于对照）
          </div>
        </div>
      </section>

      {/* 三级机构2026年度保费规划图 */}
      {orgComparisonData && (
        <section className="rounded-xl border p-4">
          <UniversalChart
            data={orgComparisonData}
            config={{
              title: `三级机构2026年度保费规划图（${group === "all" ? "全部" : group === "local" ? "同城" : "异地"} - ${productLabel[product]}）`,
              height: 360,
              showDataLabel: true,
            }}
          />
        </section>
      )}

      {/* 三级机构数据表格 */}
      <section className="rounded-xl border p-4">
        <div className="mb-3 text-sm font-medium">三级机构数据明细</div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="border-b py-2 px-3">三级机构</th>
                <th className="border-b py-2 px-3 text-right">2026年保费目标（万元）</th>
                <th className="border-b py-2 px-3 text-right">2025年达成保费（万元）</th>
                <th className="border-b py-2 px-3 text-right">2026年增长率</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const t = targetByOrg.get(o.org_id) ?? { total: 0, auto: 0, property: 0, life: 0 };
                const a25 = actual2025ByOrg.get(o.org_id) ?? { total: 0, auto: 0, property: 0, life: 0 };
                const target2026 = t[product];
                const actual2025 = a25[product];
                const growthRate = actual2025 > 0
                  ? ((target2026 - actual2025) / actual2025 * 100).toFixed(1)
                  : null;

                return (
                  <tr key={o.org_id} className="hover:bg-slate-50">
                    <td className="border-b py-2 px-3">{o.org_cn}</td>
                    <td className="border-b py-2 px-3 text-right font-medium">
                      {Math.round(target2026).toLocaleString()}
                    </td>
                    <td className="border-b py-2 px-3 text-right">
                      {actual2025 ? Math.round(actual2025).toLocaleString() : '—'}
                    </td>
                    <td className="border-b py-2 px-3 text-right">
                      {growthRate !== null ? `${growthRate}%` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 说明部分 */}
        <div className="mt-4 space-y-2 text-xs text-slate-600">
          <div className="border-t pt-3">
            <div className="font-medium mb-2">【指标定义】</div>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>2026年保费目标</strong>：该机构2026年度的保费目标值，来源于年度目标分解</li>
              <li><strong>2025年达成保费</strong>：该机构2025年度实际完成的保费收入</li>
              <li><strong>2026年增长率</strong>：(2026年目标 - 2025年实际) / 2025年实际 × 100%，反映目标增长幅度</li>
            </ul>
          </div>
          <div className="border-t pt-2">
            <div className="font-medium mb-1">【来源索引】</div>
            <div>• 2026年保费目标：<code className="bg-slate-100 px-1 rounded">public/data/targets_annual_2026.json</code></div>
            <div>• 2025年达成保费：<code className="bg-slate-100 px-1 rounded">public/data/actuals_annual_2025.json</code></div>
            <div>• 三级机构列表：<code className="bg-slate-100 px-1 rounded">public/data/orgs.json</code>（排除本部、西财俊苑）</div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <div className="mb-3 text-sm font-medium">机构列表（点击进入详情下钻）</div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="border-b py-2">机构</th>
                <th className="border-b py-2">分组</th>
                <th className="border-b py-2">年度目标（汇总）</th>
                <th className="border-b py-2">车险</th>
                <th className="border-b py-2">财产险</th>
                <th className="border-b py-2">人身险</th>
                <th className="border-b py-2">2025 年度实际（汇总）</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const t = targetByOrg.get(o.org_id) ?? { total: 0, auto: 0, property: 0, life: 0 };
                const a25 = actual2025ByOrg.get(o.org_id) ?? { total: 0, auto: 0, property: 0, life: 0 };

                return (
                  <tr key={o.org_id} className="hover:bg-slate-50">
                    <td className="border-b py-2">
                      <Link className="text-blue-700 hover:underline" href={`/orgs/${o.org_id}`}>
                        {o.org_cn}
                      </Link>
                      <div className="text-xs text-slate-500">{o.org_id}</div>
                    </td>
                    <td className="border-b py-2">{o.group === "local" ? "同城" : "异地"}</td>
                    <td className="border-b py-2 font-semibold">{Math.round(t.total)}</td>
                    <td className="border-b py-2">{Math.round(t.auto)}</td>
                    <td className="border-b py-2">{Math.round(t.property)}</td>
                    <td className="border-b py-2">{Math.round(t.life)}</td>
                    <td className="border-b py-2">{a25.total ? Math.round(a25.total) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          注：汇总为系统派生，禁止作为输入事实导入。
        </div>
      </section>
    </div>
  );
}
