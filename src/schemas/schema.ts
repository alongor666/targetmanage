import { z } from "zod";

export const GroupCodeSchema = z.enum(["local", "remote", "all"]);
export const ProductCodeSchema = z.enum(["auto", "property", "life", "health", "total"]);

export const OrgSchema = z.object({
  org_id: z.string().min(1),
  org_cn: z.string().min(1),
  org_en: z.string().optional(),
  group: z.enum(["local", "remote"]),
});

export const AnnualTargetRecordSchema = z.object({
  year: z.number().int(),
  org_id: z.string().min(1),
  product: z.enum(["auto", "property", "life", "health"]),
  annual_target: z.number().nonnegative(),
  unit: z.literal("万元"),
});

export const AnnualActualRecordSchema = z.object({
  year: z.number().int(),
  org_id: z.string().min(1),
  product: z.enum(["auto", "property", "life", "health"]),
  annual_actual: z.number().nonnegative(),
  unit: z.literal("万元"),
});

export const MonthlyActualRecordSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  org_id: z.string().min(1),
  product: z.enum(["auto", "property", "life", "health"]),
  monthly_actual: z.number(),
  unit: z.literal("万元"),
});

export const AllocationRuleSchema = z.object({
  rule_id: z.string().min(1),
  scope: z.literal("global"),
  scope_key: z.literal("all"),
  weights: z.array(z.number().nonnegative()).length(12),
  notes_cn: z.string().optional(),
});

// 总公司目标记录（不按三级机构拆分，仅分险种）
export const HeadquartersTargetRecordSchema = z.object({
  year: z.number().int(),
  product: z.enum(["auto", "property", "life", "health"]),
  annual_target: z.number().nonnegative(),
  unit: z.literal("万元"),
});

export function validateWeights(weights: number[]) {
  const sum = weights.reduce((a, b) => a + b, 0);
  const eps = 1e-9;
  if (Math.abs(sum - 1) > eps) {
    throw new Error(`weights_sum_not_one: sum=${sum}`);
  }
}
