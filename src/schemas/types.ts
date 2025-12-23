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
  unit: "万元";
};

export type AllocationRule = {
  rule_id: string;
  scope: "global";
  scope_key: "all";
  weights: number[]; // length 12, sum=1
  notes_cn?: string;
};

// 总公司目标记录（不按三级机构拆分）
export type HeadquartersTargetRecord = {
  year: number;
  product: Exclude<ProductCode, "total">;
  annual_target: number;
  unit: "万元";
};
