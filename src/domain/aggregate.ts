import type { GroupCode, ProductCode } from "@/schemas/types";

export type FactRow = {
  org_id: string;
  group: Exclude<GroupCode, "all">;
  product: Exclude<ProductCode, "total">;
  value: number;
};

export type AggKey = { group: GroupCode; product: ProductCode };

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
