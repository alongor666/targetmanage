/**
 * 图表标题生成工具
 *
 * @module ChartTitle
 * @description 根据视角、产品、粒度、口径等维度生成智能精简的图表标题
 */

type ProductView = 'total' | 'auto' | 'property' | 'life';
type ProgressMode = 'linear' | 'weighted' | 'actual2025';

/**
 * 产品名称映射
 */
const PRODUCT_LABELS: Record<ProductView, string> = {
  total: '汇总',
  auto: '车险',
  property: '财产险',
  life: '人身险',
};

/**
 * 时间进度口径映射
 */
const PROGRESS_MODE_LABELS: Record<ProgressMode, string> = {
  linear: '线性',
  weighted: '目标权重',
  actual2025: '2025实际',
};

/**
 * 图表标题生成选项
 */
export interface ChartTitleOptions {
  /** 产品类型（默认：total） */
  product?: ProductView;
  /** 时间粒度 */
  granularity: 'monthly' | 'quarterly';
  /** 数据类型（默认：premium） */
  dataType?: 'premium' | 'share';
  /** 时间进度口径（默认：weighted） */
  progressMode?: ProgressMode;
}

/**
 * 生成图表标题
 *
 * 智能精简规则：
 * - 视角：始终显示（全省、同城、成都分公司）
 * - 产品：仅非"汇总"时显示（车险、财产险、人身险）
 * - 口径：始终显示在括号中（目标权重、线性、2025实际）
 *
 * @param viewLabel 视角标签（如"全省"、"成都分公司"）
 * @param options 标题生成选项
 * @returns 格式化的标题字符串
 *
 * @example
 * generateChartTitle('全省', { product: 'total', granularity: 'quarterly', progressMode: 'weighted' })
 * // 返回: "全省季度保费规划图（目标权重）"
 *
 * @example
 * generateChartTitle('全省', { product: 'auto', granularity: 'monthly', progressMode: 'linear' })
 * // 返回: "全省 · 车险 · 月度保费规划图（线性）"
 *
 * @example
 * generateChartTitle('成都分公司', { product: 'property', granularity: 'quarterly', dataType: 'share', progressMode: 'actual2025' })
 * // 返回: "成都分公司 · 财产险 · 季度占比规划图（2025实际）"
 */
export function generateChartTitle(
  viewLabel: string,
  options: ChartTitleOptions
): string {
  const {
    product = 'total',
    granularity,
    dataType = 'premium',
    progressMode = 'weighted',
  } = options;

  let title = viewLabel;

  // 产品维度：仅非汇总时显示
  if (product !== 'total') {
    title += ` · ${PRODUCT_LABELS[product]}`;
  }

  // 粒度 + 数据类型
  const granularityLabel = granularity === 'monthly' ? '月度' : '季度';
  const dataTypeLabel = dataType === 'premium' ? '保费' : '占比';
  title += ` · ${granularityLabel}${dataTypeLabel}规划图`;

  // 时间进度口径：始终显示
  const progressLabel = PROGRESS_MODE_LABELS[progressMode];
  title += `（${progressLabel}）`;

  return title;
}
