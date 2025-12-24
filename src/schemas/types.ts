export type GroupCode = "local" | "remote" | "all";
export type ProductCode = "auto" | "property" | "life" | "health" | "total";

export type Org = {
  org_id: string;
  org_cn: string;
  org_en?: string;
  group: Exclude<GroupCode, "all">;
};

export type AnnualTargetRecord = {
  year: number;
  org_id: string;
  product: Exclude<ProductCode, "total">;
  annual_target: number;
  compulsory_premium?: number;
  commercial_premium?: number;
  compulsory_expense_rate?: number;
  commercial_expense_rate?: number;
  property_first_day_expense_rate?: number;
  life_first_day_expense_rate?: number;
  unit: "万元";
};

export type AnnualActualRecord = {
  year: number;
  org_id: string;
  product: Exclude<ProductCode, "total">;
  annual_actual: number;
  unit: "万元";
};

export type MonthlyActualRecord = {
  year: number;
  month: number; // 1..12
  org_id: string;
  product: Exclude<ProductCode, "total">;
  monthly_actual: number;
  compulsory_premium?: number;
  commercial_premium?: number;
  compulsory_expense_rate?: number;
  commercial_expense_rate?: number;
  property_first_day_expense_rate?: number;
  life_first_day_expense_rate?: number;
  unit: "万元";
};

export type AllocationRule = {
  rule_id: string;
  scope: "global";
  scope_key: "all";
  weights: number[]; // length 12, sum=1
  notes_cn?: string;
};

// 阈值规则类型
export type ThresholdRule = {
  rule_id: string;
  scope: "global";

  // 达成率阈值
  achievement: {
    good_min: number;      // 优秀最小值，如 1.05 (105%)
    warning_min: number;   // 预警最小值，如 0.95 (95%)
  };

  // 增长率阈值
  growth: {
    good_min: number;      // 优秀最小值，如 0.12 (12%)
    warning_min: number;   // 预警最小值，如 0.00 (0%)
  };

  notes_cn?: string;
};

// 总公司目标记录（不按三级机构拆分）
export type HeadquartersTargetRecord = {
  year: number;
  product: Exclude<ProductCode, "total">;
  annual_target: number;
  unit: "万元";
};
