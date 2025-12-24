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
  compulsory_premium: z.number().nonnegative().optional(),
  commercial_premium: z.number().nonnegative().optional(),
  compulsory_expense_rate: z.number().min(0).max(1).optional(),
  commercial_expense_rate: z.number().min(0).max(1).optional(),
  property_first_day_expense_rate: z.number().min(0).max(1).optional(),
  life_first_day_expense_rate: z.number().min(0).max(1).optional(),
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
  compulsory_premium: z.number().nonnegative().optional(),
  commercial_premium: z.number().nonnegative().optional(),
  compulsory_expense_rate: z.number().min(0).max(1).optional(),
  commercial_expense_rate: z.number().min(0).max(1).optional(),
  property_first_day_expense_rate: z.number().min(0).max(1).optional(),
  life_first_day_expense_rate: z.number().min(0).max(1).optional(),
  unit: z.literal("万元"),
});

export const AllocationRuleSchema = z.object({
  rule_id: z.string().min(1),
  scope: z.literal("global"),
  scope_key: z.literal("all"),
  weights: z.array(z.number().nonnegative()).length(12),
  notes_cn: z.string().optional(),
});

// 阈值规则配置
export const ThresholdRuleSchema = z.object({
  rule_id: z.string().min(1),
  scope: z.literal("global"),

  // 达成率阈值
  achievement: z.object({
    good_min: z.number(),          // 优秀最小值，如 1.05 (105%)
    warning_min: z.number(),       // 预警最小值，如 0.95 (95%)
  }),

  // 增长率阈值
  growth: z.object({
    good_min: z.number(),          // 优秀最小值，如 0.12 (12%)
    warning_min: z.number(),       // 预警最小值，如 0.00 (0%)
  }),

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

// 阈值验证函数
export function validateThresholds(thresholds: {
  achievement: { good_min: number; warning_min: number };
  growth: { good_min: number; warning_min: number };
}) {
  // 达成率阈值验证：good_min > 1 > warning_min
  if (thresholds.achievement.good_min <= 1) {
    throw new Error(`achievement.good_min must be > 1, got ${thresholds.achievement.good_min}`);
  }
  if (thresholds.achievement.warning_min >= 1) {
    throw new Error(`achievement.warning_min must be < 1, got ${thresholds.achievement.warning_min}`);
  }
  if (thresholds.achievement.warning_min < 0) {
    throw new Error(`achievement.warning_min must be >= 0, got ${thresholds.achievement.warning_min}`);
  }

  // 增长率阈值验证：good_min > warning_min
  if (thresholds.growth.good_min <= thresholds.growth.warning_min) {
    throw new Error(`growth.good_min must be > growth.warning_min`);
  }
}
