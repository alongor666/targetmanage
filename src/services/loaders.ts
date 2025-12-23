import Papa from "papaparse";
import { z } from "zod";
import {
  OrgSchema,
  AnnualTargetRecordSchema,
  AnnualActualRecordSchema,
  MonthlyActualRecordSchema,
  AllocationRuleSchema,
  validateWeights,
} from "@/schemas/schema";
import { LS_KEYS, lsGetJson } from "@/services/storage";

export async function fetchJson<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  // 在静态导出时，确保URL包含basePath
  const basePath = process.env.NODE_ENV === 'production' ? '/targetmanage' : '';
  const fullUrl = url.startsWith('http') ? url : `${basePath}${url}`;
  
  const res = await fetch(fullUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetch_failed: ${url}`);
  const data = await res.json();
  return schema.parse(data);
}

export const OrgsFileSchema = z.object({ version: z.string(), orgs: z.array(OrgSchema) });
export const TargetsAnnualFileSchema = z.object({
  year: z.number().int(),
  unit: z.literal("万元"),
  type: z.literal("targets_annual"),
  records: z.array(AnnualTargetRecordSchema),
});
export const ActualsAnnualFileSchema = z.object({
  year: z.number().int(),
  unit: z.literal("万元"),
  type: z.literal("actuals_annual"),
  records: z.array(AnnualActualRecordSchema),
});
export const MonthlyActualsFileSchema = z
  .object({
    year: z.number().int(),
    unit: z.literal("万元"),
    type: z.literal("actuals_monthly"),
    records: z.array(MonthlyActualRecordSchema),
    notes_cn: z.string().optional(),
  })
  .passthrough();
export const AllocationRulesFileSchema = z.object({
  version: z.string(),
  type: z.literal("allocation_rules"),
  rules: z.array(AllocationRuleSchema),
  validation: z.object({ sum_to_one: z.boolean(), min_weight: z.number(), max_weight: z.number() }).optional(),
});

export async function loadOrgs() {
  return fetchJson("/data/orgs.json", OrgsFileSchema);
}
export async function loadTargetsAnnual2026() {
  return fetchJson("/data/targets_annual_2026.json", TargetsAnnualFileSchema);
}
/**
 * 加载2025年度实际数据，四级优先级：localStorage > 新文件名 > 旧文件名兼容 > fallback
 */
export async function loadActualsAnnual2025() {
  // 优先级1: localStorage (用户导入数据)
  const local = lsGetJson<unknown>(LS_KEYS.actualsAnnual2025);
  if (local) return ActualsAnnualFileSchema.parse(local);

  // 优先级2: 新命名文件
  try {
    return await fetchJson("/data/actuals_annual_2025.json", ActualsAnnualFileSchema);
  } catch {}

  // 优先级3: 旧命名兼容（过渡期）
  try {
    return await fetchJson("/data/预测_annual_2025.json", ActualsAnnualFileSchema);
  } catch {}

  // 优先级4: fallback空数据
  return { year: 2025, unit: "万元", type: "actuals_annual", records: [] };
}
export async function loadAllocationRules() {
  const data = await fetchJson("/data/allocation_rules.json", AllocationRulesFileSchema);
  const rule = data.rules[0];
  validateWeights(rule.weights);
  return data;
}

/** CSV（逗号分隔值）导入：year,month,org_cn,product_cn,premium */
export function parseMonthlyCsv(text: string) {
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (parsed.errors?.length) throw new Error(`csv_parse_error: ${parsed.errors[0].message}`);
  return parsed.data as Array<Record<string, string>>;
}

/**
 * 加载2026月度实际数据，本地优先
 */
export async function loadActualsMonthly2026() {
  // 本地优先：用户导入的数据 
  const local = lsGetJson<unknown>(LS_KEYS.actualsMonthly2026);
  if (local) return MonthlyActualsFileSchema.parse(local);

  // 兜底：没有导入时返回空（避免模板 0 值误导） 
  return MonthlyActualsFileSchema.parse({ 
    year: 2026, 
    unit: "万元", 
    type: "actuals_monthly", 
    records: [], 
    notes_cn: "未导入：默认空数据", 
  });
}

/**
 * 加载2025月度实际数据，三级优先级：localStorage > public/data > fallback
 */
export async function loadActualsMonthly2025() {
  // 优先级1: localStorage (用户导入数据)
  const local = lsGetJson<unknown>(LS_KEYS.actualsMonthly2025);
  if (local) return MonthlyActualsFileSchema.parse(local);

  // 优先级2: public/data (静态默认数据)
  try {
    return await fetchJson("/data/actuals_monthly_2025.json", MonthlyActualsFileSchema);
  } catch {}

  // 优先级3: fallback (空数据)
  return MonthlyActualsFileSchema.parse({ 
    year: 2025, 
    unit: "万元", 
    type: "actuals_monthly", 
    records: [], 
    notes_cn: "未导入：默认空数据", 
  });
}


