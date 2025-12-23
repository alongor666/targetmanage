"use client";

import { useEffect, useState } from "react";
import { loadOrgs, loadTargetsAnnual2026, loadActualsAnnual2025 } from "@/services/loaders";

export default function DataPage() {
  const [status, setStatus] = useState<string>("加载中…");
  const [counts, setCounts] = useState<{ orgs: number; targets: number; actuals2025: number } | null>(null);

  useEffect(() => {
    (async () => {
      const [o, t, a] = await Promise.all([loadOrgs(), loadTargetsAnnual2026(), loadActualsAnnual2025()]);
      setCounts({ orgs: o.orgs.length, targets: t.records.length, actuals2025: a.records.length });
      setStatus("已加载示例数据（public/data）");
    })().catch((e) => setStatus(String(e)));
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border p-4">
        <h2 className="text-sm font-medium">数据状态</h2>
        <div className="mt-2 text-sm text-slate-700">{status}</div>
        {counts ? (
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>机构（orgs）：{counts.orgs}</li>
            <li>2026 年度目标（targets_annual）：{counts.targets}</li>
            <li>2025 年度实际（actuals_annual）：{counts.actuals2025}</li>
          </ul>
        ) : null}
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-sm font-medium">导入说明</h2>
        <p className="mt-2 text-sm text-slate-700">
          V0：先使用 public/data 进行开发与对账。后续你可以扩展为：上传 CSV/JSON → 解析 → Zod 校验 → 写入浏览器本地存储（localStorage）或后端存储。
        </p>
        <p className="mt-2 text-sm text-slate-700">
          详细字段与示例见：docs/import_guide.md。
        </p>
      </section>
    </div>
  );
}
