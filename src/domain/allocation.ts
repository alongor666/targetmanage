export type RoundingMode = "none" | "2dp" | "integer";

/** 年度 -> 12 个月度目标（按权重） */
export function allocateAnnualToMonthly(
  annual: number,
  weights: number[],
  rounding: RoundingMode = "none"
): number[] {
  const raw = weights.map((w) => annual * w);
  return applyRoundingAndBalance(raw, annual, rounding);
}

/** 基于2025年实际数据计算贡献度分布权重 */
export function calculateActual2025Weights(monthlyActuals2025: Array<number | null>): number[] {
  if (monthlyActuals2025.length !== 12) return Array(12).fill(0);
  
  // 计算全年总计（过滤null值）
  const yearTotal = monthlyActuals2025.reduce((sum: number, v) => sum + (v ?? 0), 0);
  if (yearTotal === 0) return Array(12).fill(0);
  
  // 计算各月贡献度权重
  return monthlyActuals2025.map((v) => (v === null ? 0 : v / yearTotal));
}

/** 把月度数组聚合为季度（4 个值） */
export function monthlyToQuarterly(monthly: number[]): number[] {
  return [0, 1, 2, 3].map((q) => monthly.slice(q * 3, q * 3 + 3).reduce((a, b) => a + b, 0));
}

/** 截至某月的年累计 */
export function monthlyToYtd(monthly: number[], month: number): number {
  const idx = Math.max(1, Math.min(12, month));
  return monthly.slice(0, idx).reduce((a, b) => a + b, 0);
}

function round(value: number, mode: RoundingMode): number {
  if (mode === "none") return value;
  if (mode === "integer") return Math.round(value);
  // 2dp
  return Math.round(value * 100) / 100;
}

/**
 * 先逐月四舍五入，再把误差回补到最后一个月，确保总和=annual
 * 适用于展示与对账；若你更偏好“分摊回补”，可替换策略
 */
function applyRoundingAndBalance(monthlyRaw: number[], annual: number, mode: RoundingMode): number[] {
  if (mode === "none") return monthlyRaw;

  const rounded = monthlyRaw.map((v) => round(v, mode));
  const sum = rounded.reduce((a, b) => a + b, 0);
  const diff = round(annual - sum, mode);

  // 回补到 12 月，保证对账
  const out = [...rounded];
  out[out.length - 1] = round(out[out.length - 1] + diff, mode);
  return out;
}

/**
 * 计算未来月份的动态目标
 *
 * 根据年度目标和已达成的YTD实际，动态计算剩余月份的目标分配。
 * 核心逻辑：未来月份目标 = (年度目标 - YTD实际) × 该月权重比例
 *
 * @doc docs/business/目标分配规则.md:45
 * @formula 未来月份目标[i] = (年度目标 - YTD实际) × 该月归一化权重[i]
 *
 * @param annualTarget 年度总目标
 * @param ytdActual 已达成的年累计实际（YTD）
 * @param currentMonth 当前月份（1-12）
 * @param progressMode 时间进度口径（linear/weighted/actual2025）
 * @param weights 12个月权重数组（weighted模式使用）
 * @param actual2025Series 2025年月度实际数组（actual2025模式使用）
 * @returns 12个月目标数组（已过月份保持原值，未来月份重新计算）
 *
 * @example
 * // 场景：年度目标10000，当前3月，YTD实际2500，使用线性口径
 * calculateFutureTargets(10000, 2500, 3, 'linear', weights, actual2025)
 * // 返回：[833, 833, 834, 833, 833, 833, 833, 833, 833, 833, 833, 835]
 * // 前3月：2500/3=833（占位值），4-12月：(10000-2500)/9≈833
 */
export function calculateFutureTargets(
  annualTarget: number,
  ytdActual: number,
  currentMonth: number,
  progressMode: 'linear' | 'weighted' | 'actual2025',
  weights: number[],
  actual2025Series: Array<number | null>
): number[] {
  // 1. 计算剩余目标
  const remainingTarget = Math.max(0, annualTarget - ytdActual);

  // 边界情况：超额完成或12月
  if (remainingTarget <= 0 || currentMonth >= 12) {
    return Array(12).fill(0).map((_, idx) =>
      idx < currentMonth ? ytdActual / currentMonth : 0
    );
  }

  // 2. 计算未来月份权重
  const futureMonths = 12 - currentMonth;
  let futureWeights: number[];

  switch (progressMode) {
    case 'linear':
      // 线性分配：每月平均
      futureWeights = Array(futureMonths).fill(1 / futureMonths);
      break;

    case 'weighted':
      // 权重分配：按预设权重归一化
      const rawWeights = weights.slice(currentMonth);
      const totalWeight = rawWeights.reduce((sum, w) => sum + w, 0);
      futureWeights = rawWeights.map(w => w / totalWeight);
      break;

    case 'actual2025':
      // 2025实际分配：按2025年同期比例归一化
      const rawActuals = actual2025Series.slice(currentMonth);
      const totalActual = rawActuals.reduce((sum: number, v) => sum + (v ?? 0), 0);

      if (totalActual === 0) {
        // 降级到线性分配
        futureWeights = Array(futureMonths).fill(1 / futureMonths);
        console.warn('[目标计算] 2025年数据缺失，已降级为线性分配');
      } else {
        futureWeights = rawActuals.map(v => (v ?? 0) / totalActual);
      }
      break;
  }

  // 3. 生成结果数组
  const result = Array(12).fill(0);

  // 已过月份：使用YTD平均值（占位，实际数据会覆盖）
  for (let i = 0; i < currentMonth; i++) {
    result[i] = ytdActual / currentMonth;
  }

  // 未来月份：按权重分配剩余目标
  for (let i = 0; i < futureMonths; i++) {
    result[currentMonth + i] = remainingTarget * futureWeights[i];
  }

  return result;
}
