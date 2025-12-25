/**
 * 排序工具函数
 *
 * @module sorting
 * @description 提供通用的排序功能，支持多种排序场景
 */

import type { SortOrder } from '@/components/ui/SortButtonGroup';

/**
 * 机构排序数据项
 */
export interface SortableOrgItem {
  org_id: string;
  org_name: string;
  premium: number;        // 保费规划
  share: number;          // 占比规划
  growth: number | null;  // 增长率规划
}

/**
 * 排序结果
 */
export interface SortResult<T> {
  sortedItems: T[];
  sortedIds: string[];
  sortedNames: string[];
  sortIndexes: number[]; // 原始索引映射
}

/**
 * 排序键类型
 */
export type OrgSortKey = 'premium' | 'share' | 'growth';

/**
 * 对机构数组进行排序
 *
 * @param items - 可排序的机构数组
 * @param sortKey - 排序键（premium/share/growth）
 * @param sortOrder - 排序方向（asc/desc）
 * @returns 排序结果
 */
export function sortOrgItems(
  items: SortableOrgItem[],
  sortKey: OrgSortKey,
  sortOrder: SortOrder
): SortResult<SortableOrgItem> {
  // 创建带有原始索引的副本
  const indexedItems = items.map((item, index) => ({ ...item, originalIndex: index }));

  // 排序
  const sorted = indexedItems.sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    // 处理 null 值（增长率可能为 null）
    if (aVal === null && bVal === null) return 0;
    if (aVal === null) return 1;  // null 值排在最后
    if (bVal === null) return -1; // null 值排在最后

    // 数值比较
    const comparison = (aVal as number) - (bVal as number);
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // 提取排序结果
  return {
    sortedItems: sorted.map(({ originalIndex, ...item }) => item),
    sortedIds: sorted.map((item) => item.org_id),
    sortedNames: sorted.map((item) => item.org_name),
    sortIndexes: sorted.map((item) => item.originalIndex),
  };
}

/**
 * 根据排序结果重新排列数组
 *
 * @param array - 原始数组
 * @param sortIndexes - 排序索引映射
 * @returns 重新排列后的数组
 */
export function reorderArrayByIndex<T>(array: T[], sortIndexes: number[]): T[] {
  return sortIndexes.map((index) => array[index]);
}

/**
 * 创建排序映射对象
 *
 * @param items - 可排序的机构数组
 * @param sortKey - 排序键
 * @param sortOrder - 排序方向
 * @returns 排序映射（旧索引 -> 新索引）
 */
export function createSortMapping(
  items: SortableOrgItem[],
  sortKey: OrgSortKey,
  sortOrder: SortOrder
): Map<number, number> {
  const result = sortOrgItems(items, sortKey, sortOrder);
  const mapping = new Map<number, number>();

  result.sortIndexes.forEach((oldIndex, newIndex) => {
    mapping.set(oldIndex, newIndex);
  });

  return mapping;
}

/**
 * 安全的数值比较（处理 null 值）
 *
 * @param a - 第一个值
 * @param b - 第二个值
 * @param sortOrder - 排序方向
 * @returns 比较结果
 */
export function safeCompare(
  a: number | null,
  b: number | null,
  sortOrder: SortOrder
): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;

  const comparison = a - b;
  return sortOrder === 'asc' ? comparison : -comparison;
}

/**
 * 通用排序函数（用于任意数据类型）
 *
 * @param array - 原始数组
 * @param getValue - 获取排序值的函数
 * @param sortOrder - 排序方向
 * @returns 排序后的数组
 */
export function genericSort<T>(
  array: T[],
  getValue: (item: T) => number | null,
  sortOrder: SortOrder
): T[] {
  return [...array].sort((a, b) => {
    const aVal = getValue(a);
    const bVal = getValue(b);
    return safeCompare(aVal, bVal, sortOrder);
  });
}
