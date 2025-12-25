import type { GroupCode, ProductCode } from "@/schemas/types";

export type FactRow = {
  org_id: string;
  group: Exclude<GroupCode, "all">;
  product: Exclude<ProductCode, "total">;
  value: number;
};

export type AggKey = { group: GroupCode; product: ProductCode };

/**
 * 按分组和产品聚合数据，生成分组和总计
 * @doc docs/business/指标定义规范.md （数据聚合相关章节）
 *
 * @param rows 原始数据行数组
 * @returns 聚合后的数据映射，键为"分组__产品"，值为聚合值
 */
export function aggregateToGroupAndAll(rows: FactRow[]): Map<string, number> {
  const map = new Map<string, number>();

  function add(key: AggKey, v: number) {
    const k = `${key.group}__${key.product}`;
    map.set(k, (map.get(k) ?? 0) + v);
  }

  for (const r of rows) {
    add({ group: r.group, product: r.product }, r.value);
    add({ group: "all", product: r.product }, r.value);
    add({ group: r.group, product: "total" }, r.value);
    add({ group: "all", product: "total" }, r.value);
  }

  return map;
}
