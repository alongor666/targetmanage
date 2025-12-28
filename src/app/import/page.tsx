"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { z } from "zod";
import { loadOrgs, MonthlyActualsFileSchema } from "@/services/loaders";
import { LS_KEYS, lsRemove, lsSetJson } from "@/services/storage";
import { getAssetPath } from "@/lib/paths";
import type { Org } from "@/schemas/types";

type DatasetKey = "actuals_monthly_2026" | "actuals_monthly_2025";
type ProductCode = "auto" | "property" | "life";

/**
 * 产品名称映射，支持中文和英文输入
 */
const ProductMap: Record<string, ProductCode> = {
  "auto": "auto",
  "车险": "auto",
  "property": "property",
  "财产险": "property",
  "life": "life",
  "人身险": "life",
};

/**
 * 安全转换为数字，处理空值、千位分隔符等
 */
function toNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s) return null;
  const clean = s.replaceAll(",", "");
  const n = Number(clean);
  return Number.isFinite(n) ? n : null;
}

/**
 * 标准化键名（去空格转小写）
 */
function normKey(s: string) {
  return s.trim().toLowerCase();
}

/**
 * 从行数据中匹配键名（支持多种可能的列名）
 */
function pick(row: Record<string, any>, keys: string[]) {
  const map = new Map<string, any>();
  for (const [k, v] of Object.entries(row)) map.set(normKey(k), v);
  for (const k of keys) {
    const v = map.get(normKey(k));
    if (v !== undefined) return v;
  }
  return undefined;
}

export default function ImportPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [dataset, setDataset] = useState<DatasetKey>("actuals_monthly_2026");

  const [fileName, setFileName] = useState<string>("");
  const [rawText, setRawText] = useState<string>("");
  const [format, setFormat] = useState<"csv" | "json" | null>(null);

  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");

  /**
   * 加载机构列表用于校验
   */
  useEffect(() => {
    loadOrgs().then((d) => setOrgs(d.orgs)).catch((e) => setStatus(String(e)));
  }, []);

  const year = dataset === "actuals_monthly_2026" ? 2026 : 2025;
  const storageKey = dataset === "actuals_monthly_2026" ? LS_KEYS.actualsMonthly2026 : LS_KEYS.actualsMonthly2025;

  const orgById = useMemo(() => new Map(orgs.map((o) => [o.org_id, o])), [orgs]);
  const orgIdByCn = useMemo(() => new Map(orgs.map((o) => [o.org_cn, o.org_id])), [orgs]);

  /**
   * 处理文件选择
   */
  function handleFile(f: File) {
    setFileName(f.name);
    const ext = f.name.toLowerCase().endsWith(".csv") ? "csv" : f.name.toLowerCase().endsWith(".json") ? "json" : null;
    setFormat(ext);
    setStatus("");
    setErrors([]);
    setPreview([]);

    const reader = new FileReader();
    reader.onload = () => setRawText(String(reader.result ?? ""));
    reader.readAsText(f, "utf-8");
  }

  /**
   * 将CSV数据标准化为月度实际数据格式
   */
  function normalizeCsvToMonthlyActuals(csvText: string) {
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    if (parsed.errors?.length) throw new Error(`CSV 解析失败：${parsed.errors[0].message}`);
    const rows = parsed.data as Array<Record<string, any>>;

    // 允许多种列名：year/年度, month/月, org_id/机构编码, org_cn/机构, product/product_cn/险种, value/月度实际/保费 
    const out: Array<{
      year: number;
      month: number;
      org_id: string;
      product: ProductCode;
      monthly_actual: number;
      compulsory_premium?: number;
      commercial_premium?: number;
      compulsory_expense_rate?: number;
      commercial_expense_rate?: number;
      property_first_day_expense_rate?: number;
      life_first_day_expense_rate?: number;
      unit: "万元";
    }> = [];
    const errs: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];

      const yRaw = pick(r, ["year", "年度"]);
      const mRaw = pick(r, ["month", "月份", "月"]);
      const orgIdRaw = pick(r, ["org_id", "机构编码", "机构id"]);
      const orgCnRaw = pick(r, ["org_cn", "机构", "机构名称"]);
      const prodRaw = pick(r, ["product", "product_cn", "险种", "产品"]);
      const valRaw = pick(r, ["monthly_actual", "value", "premium", "保费", "当月保费", "月度实际"]);
      const compulsoryPremiumRaw = pick(r, ["compulsory_premium", "交强险保费", "交强险保费收入"]);
      const commercialPremiumRaw = pick(r, ["commercial_premium", "商业险保费", "商业险保费收入"]);
      const compulsoryExpenseRateRaw = pick(r, ["compulsory_expense_rate", "交强险首日费用率"]);
      const commercialExpenseRateRaw = pick(r, ["commercial_expense_rate", "商业险首日费用率"]);
      const propertyExpenseRateRaw = pick(r, ["property_first_day_expense_rate", "财产险首日费用率"]);
      const lifeExpenseRateRaw = pick(r, ["life_first_day_expense_rate", "人身险首日费用率"]);

      const y = toNumber(yRaw) ?? year;
      const m = toNumber(mRaw);
      const val = toNumber(valRaw);
      const compulsoryPremium = toNumber(compulsoryPremiumRaw);
      const commercialPremium = toNumber(commercialPremiumRaw);
      const compulsoryExpenseRate = toNumber(compulsoryExpenseRateRaw);
      const commercialExpenseRate = toNumber(commercialExpenseRateRaw);
      const propertyExpenseRate = toNumber(propertyExpenseRateRaw);
      const lifeExpenseRate = toNumber(lifeExpenseRateRaw);

      const org_id = 
        (orgIdRaw ? String(orgIdRaw).trim() : "") || 
        (orgCnRaw ? orgIdByCn.get(String(orgCnRaw).trim()) ?? "" : "");

      const prodKey = prodRaw ? String(prodRaw).trim() : "";
      const product = ProductMap[prodKey];

      if (y !== year) errs.push(`第 ${i + 2} 行：year=${y} 与所选数据集 year=${year} 不一致`);
      if (!m || m < 1 || m > 12) errs.push(`第 ${i + 2} 行：month 非法（${mRaw}）`);
      if (!org_id) errs.push(`第 ${i + 2} 行：无法识别机构（org_id/org_cn 为空或不在 orgs.json）`);
      if (org_id && !orgById.has(org_id)) errs.push(`第 ${i + 2} 行：org_id 不在机构清单（${org_id}）`);
      if (!product) errs.push(`第 ${i + 2} 行：无法识别产品（${prodKey}）`);
      if (val === null || val < 0) errs.push(`第 ${i + 2} 行：月度实际值非法（${valRaw}）`);
      if (compulsoryPremium !== null && compulsoryPremium < 0) errs.push(`第 ${i + 2} 行：交强险保费非法（${compulsoryPremiumRaw}）`);
      if (commercialPremium !== null && commercialPremium < 0) errs.push(`第 ${i + 2} 行：商业险保费非法（${commercialPremiumRaw}）`);
      if (compulsoryExpenseRate !== null && (compulsoryExpenseRate < 0 || compulsoryExpenseRate > 1)) {
        errs.push(`第 ${i + 2} 行：交强险首日费用率非法（${compulsoryExpenseRateRaw}）`);
      }
      if (commercialExpenseRate !== null && (commercialExpenseRate < 0 || commercialExpenseRate > 1)) {
        errs.push(`第 ${i + 2} 行：商业险首日费用率非法（${commercialExpenseRateRaw}）`);
      }
      if (propertyExpenseRate !== null && (propertyExpenseRate < 0 || propertyExpenseRate > 1)) {
        errs.push(`第 ${i + 2} 行：财产险首日费用率非法（${propertyExpenseRateRaw}）`);
      }
      if (lifeExpenseRate !== null && (lifeExpenseRate < 0 || lifeExpenseRate > 1)) {
        errs.push(`第 ${i + 2} 行：人身险首日费用率非法（${lifeExpenseRateRaw}）`);
      }

      if (errs.length) continue;

      out.push({
        year,
        month: m!,
        org_id,
        product,
        monthly_actual: val!,
        compulsory_premium: compulsoryPremium ?? undefined,
        commercial_premium: commercialPremium ?? undefined,
        compulsory_expense_rate: compulsoryExpenseRate ?? undefined,
        commercial_expense_rate: commercialExpenseRate ?? undefined,
        property_first_day_expense_rate: propertyExpenseRate ?? undefined,
        life_first_day_expense_rate: lifeExpenseRate ?? undefined,
        unit: "万元",
      });
    }

    // 去重聚合：同 key 默认"求和" 
    const acc = new Map<string, (typeof out)[number]>();
    for (const r of out) {
      const k = `${r.year}-${r.month}-${r.org_id}-${r.product}`;
      const prev = acc.get(k);
      if (!prev) acc.set(k, r);
      else acc.set(k, { ...prev, monthly_actual: prev.monthly_actual + r.monthly_actual });
    }

    return { records: [...acc.values()], errors: errs };
  }

  /**
   * 将JSON数据标准化为月度实际数据格式
   */
  function normalizeJsonToMonthlyActuals(jsonText: string) {
    const data = JSON.parse(jsonText);

    // 兼容两种 JSON： 
    // 1) 标准文件：{ type:"actuals_monthly", year, unit, records:[...] } 
    // 2) 纯 records 数组：[{year,month,org_id,product,monthly_actual,unit}, ...] 
    const maybeWrapped = 
      Array.isArray(data)
        ? { type: "actuals_monthly", year, unit: "万元", records: data }
        : data;

    const parsed = MonthlyActualsFileSchema.safeParse(maybeWrapped);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("；");
      return { file: null as any, errors: [`JSON 结构不符合约定：${msg}`] };
    }

    const file = parsed.data;

    const errs: string[] = [];
    if (file.year !== year) errs.push(`JSON year=${file.year} 与所选数据集 year=${year} 不一致`);
    if (file.unit !== "万元") errs.push(`unit 必须为 万元`);

    // 禁止汇总行导入：通过 org_id 是否在 orgs.json 约束（汇总行不在 orgs 清单） 
    for (const [idx, r] of file.records.entries()) {
      if (!orgById.has(r.org_id)) errs.push(`records[${idx}].org_id 不在机构清单：${r.org_id}`);
    }

    // 去重求和 
    const acc = new Map<string, any>();
    for (const r of file.records) {
      const k = `${r.year}-${r.month}-${r.org_id}-${r.product}`;
      const prev = acc.get(k);
      if (!prev) acc.set(k, r);
      else acc.set(k, { ...prev, monthly_actual: prev.monthly_actual + r.monthly_actual });
    }

    const normalized = { ...file, year, records: [...acc.values()] };

    return { file: normalized, errors: errs };
  }

  /**
   * 构建并验证数据
   */
  function buildAndValidate() {
    setErrors([]);
    setPreview([]);
    setStatus("");

    if (!format) {
      setErrors(["请上传 .csv 或 .json 文件"]);
      return;
    }
    if (!rawText.trim()) {
      setErrors(["文件内容为空"]);
      return;
    }

    try {
      if (format === "csv") {
        const r = normalizeCsvToMonthlyActuals(rawText);
        if (r.errors.length) {
          setErrors(r.errors.slice(0, 50));
          setStatus(`发现错误：${r.errors.length} 条（仅展示前 50 条）`);
          return;
        }
        const file = MonthlyActualsFileSchema.parse({ type: "actuals_monthly", year, unit: "万元", records: r.records });
        setPreview(file.records.slice(0, 20));
        setStatus(`解析成功：records=${file.records.length}（预览前 20 条）`);
        return file;
      } else {
        const r = normalizeJsonToMonthlyActuals(rawText);
        if (r.errors.length) {
          setErrors(r.errors.slice(0, 50));
          setStatus(`发现错误：${r.errors.length} 条（仅展示前 50 条）`);
          return;
        }
        setPreview(r.file.records.slice(0, 20));
        setStatus(`解析成功：records=${r.file.records.length}（预览前 20 条）`);
        return r.file;
      }
    } catch (e: any) {
      setErrors([String(e?.message ?? e)]);
      return;
    }
  }

  /**
   * 保存到本地存储
   */
  function saveToLocal() {
    const file = buildAndValidate();
    if (!file) return;
    lsSetJson(storageKey, file);
    setStatus(`已保存到 localStorage：${storageKey}（records=${file.records.length}）`);
  }

  /**
   * 清空本地数据
   */
  function clearLocal() {
    lsRemove(storageKey);
    setStatus(`已清空 localStorage：${storageKey}`);
    setPreview([]);
    setErrors([]);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-slate-600">导入数据集</label>
            <select className="mt-1 rounded border px-2 py-1 text-sm" value={dataset} onChange={(e) => setDataset(e.target.value as any)}>
              <option value="actuals_monthly_2026">2026 月度实际（用于达成率/时间进度达成率）</option>
              <option value="actuals_monthly_2025">2025 月度基线（用于增长率/增量）</option>
            </select>
          </div>

          <div className="text-xs text-slate-500">
            规则：只接受 orgs.json 中存在的 org_id；禁止导入“同城/异地/四川分公司”等汇总行（系统派生）。
          </div>

          <div className="ml-auto flex gap-2">
            <a className="rounded border px-3 py-1 text-sm hover:bg-slate-50" href={getAssetPath("/data/actuals_monthly_2026_template.json")} target="_blank">
              下载 JSON 模板
            </a>
          </div>
        </div>

        <div className="mt-4">
          <input 
            type="file" 
            accept=".csv,.json" 
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <div className="mt-2 text-xs text-slate-500">当前文件：{fileName || "未选择"}</div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded bg-slate-900 px-3 py-1 text-sm text-white" onClick={saveToLocal}>
            解析并保存到本地
          </button>
          <button className="rounded border px-3 py-1 text-sm hover:bg-slate-50" onClick={buildAndValidate}>
            仅解析预览
          </button>
          <button className="rounded border px-3 py-1 text-sm hover:bg-slate-50" onClick={clearLocal}>
            清空本地数据
          </button>
        </div>

        {status ? <div className="mt-3 text-sm text-slate-700">{status}</div> : null}

        {errors.length ? (
          <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <div className="font-medium">校验错误</div>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              {errors.map((e, idx) => (
                <li key={idx}>{e}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border p-4">
        <div className="mb-2 text-sm font-medium">预览（前 20 条，已归一化为 org_id + product + month）</div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="border-b py-2">year</th>
                <th className="border-b py-2">month</th>
                <th className="border-b py-2">org_id</th>
                <th className="border-b py-2">product</th>
                <th className="border-b py-2">monthly_actual</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="border-b py-2">{r.year}</td>
                  <td className="border-b py-2">{r.month}</td>
                  <td className="border-b py-2">{r.org_id}</td>
                  <td className="border-b py-2">{r.product}</td>
                  <td className="border-b py-2">{Number(r.monthly_actual).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          CSV 建议列：year, month, org_id 或 org_cn, product 或 product_cn, monthly_actual（可带逗号分隔千位）。
        </div>
      </section>
    </div>
  );
}
