/**
 * localStorage 键名常量定义
 * 统一管理所有本地存储的键名，避免散落硬编码
 */
export const LS_KEYS = {
  actualsMonthly2026: "tm:actuals_monthly:2026",
  actualsMonthly2025: "tm:actuals_monthly:2025",
  actualsAnnual2025: "tm:actuals_annual:2025",
} as const;

/**
 * 检查是否在浏览器环境且 localStorage 可用
 */
function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * 从 localStorage 获取 JSON 数据
 * @param key 存储键名
 * @returns 解析后的 JSON 对象，如果不存在或解析失败返回 null
 */
export function lsGetJson<T>(key: string): T | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * 将 JSON 数据保存到 localStorage
 * @param key 存储键名
 * @param value 要保存的数据
 */
export function lsSetJson(key: string, value: unknown) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * 从 localStorage 删除指定键的数据
 * @param key 要删除的存储键名
 */
export function lsRemove(key: string) {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}