"use client";

import { useEffect, useMemo, useState } from "react";
import { loadAllocationRules } from "@/services/loaders";

export default function RulesPage() {
  const [weights, setWeights] = useState<number[]>([]);
  const [sum, setSum] = useState<number>(0);

  useEffect(() => {
    loadAllocationRules().then((d) => setWeights(d.rules[0].weights)).catch(console.error);
  }, []);

  useEffect(() => {
    setSum(weights.reduce((a, b) => a + b, 0));
  }, [weights]);

  const ok = useMemo(() => Math.abs(sum - 1) < 1e-9, [sum]);

  function update(i: number, v: number) {
    const next = [...weights];
    next[i] = v;
    setWeights(next);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border p-4">
        <h2 className="text-sm font-medium">统一权重（可配置）</h2>
        <p className="mt-1 text-xs text-slate-600">V0：仅展示默认权重；V1：支持保存版本与导出 JSON。</p>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {weights.map((w, idx) => (
            <div key={idx} className="rounded-lg border p-3">
              <div className="text-xs text-slate-600">{idx + 1}月</div>
              <input
                className="mt-2 w-full rounded border px-2 py-1 text-sm"
                type="number"
                step="0.01"
                value={w}
                onChange={(e) => update(idx, Number(e.target.value))}
              />
              <div className="mt-2 text-xs text-slate-500">{(w * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-sm">
          权重之和：<span className={ok ? "text-green-700" : "text-red-700"}>{sum.toFixed(4)}</span>
          <span className="ml-2 text-xs text-slate-500">（必须等于 1）</span>
        </div>
      </section>
    </div>
  );
}
