/**
 * 字体大小常量系统
 *
 * @description 为 ECharts 等非 Tailwind 环境提供类型安全的字体大小
 * @doc docs/design/全局设计规范.md:147-166
 */

/**
 * 字体大小常量(像素值)
 * 与 globals.css 中的 CSS 变量一一对应
 *
 * ⚠️ 重要: 这些值必须与 CSS 变量保持同步
 */
export const FONT_SIZE = {
  /** 11px - 辅助信息、图表坐标轴标签 */
  xs: 11,

  /** 12px - 小号文字、图表数据标签 */
  sm: 12,

  /** 14px - 正文、主要文字 */
  base: 14,

  /** 16px - 中等文字、强调文本 */
  md: 16,

  /** 18px - 大号文字、小标题 */
  lg: 18,

  /** 24px - 标题文字 */
  xl: 24,

  /** 32px - 大标题 */
  xxl: 32,

  /** 48px - KPI数值 */
  xxxl: 48,
} as const;

/**
 * 字体大小类型
 */
export type FontSizeType = keyof typeof FONT_SIZE;

/**
 * 获取字体大小数值
 * @param size - 字体大小类型
 * @returns 像素值
 */
export function getFontSize(size: FontSizeType): number {
  return FONT_SIZE[size];
}

/**
 * ECharts 专用字体大小预设
 * 根据使用场景提供推荐字体大小
 */
export const CHART_FONT_SIZE = {
  /** 坐标轴标签 */
  axisLabel: FONT_SIZE.sm,      // 12px

  /** 图例文字 */
  legend: FONT_SIZE.sm,          // 12px

  /** 数据标签(柱状图、折线图) */
  dataLabel: FONT_SIZE.xs,       // 11px

  /** Tooltip 标题 */
  tooltipTitle: FONT_SIZE.base,  // 14px

  /** Tooltip 内容 */
  tooltipContent: FONT_SIZE.sm,  // 12px

  /** 图表标题 */
  title: FONT_SIZE.lg,           // 18px
} as const;

/**
 * 验证字体大小常量与 CSS 变量一致性
 * (开发时辅助工具,生产环境可移除)
 *
 * @throws Error 如果发现不一致
 */
export function validateFontSizes(): void {
  if (typeof window === 'undefined') return; // SSR跳过

  const rootStyles = getComputedStyle(document.documentElement);

  const checks: Array<{ name: string; cssVar: string; value: number }> = [
    { name: 'xs', cssVar: '--font-size-xs', value: FONT_SIZE.xs },
    { name: 'sm', cssVar: '--font-size-sm', value: FONT_SIZE.sm },
    { name: 'base', cssVar: '--font-size-base', value: FONT_SIZE.base },
    { name: 'md', cssVar: '--font-size-md', value: FONT_SIZE.md },
    { name: 'lg', cssVar: '--font-size-lg', value: FONT_SIZE.lg },
    { name: 'xl', cssVar: '--font-size-xl', value: FONT_SIZE.xl },
    { name: 'xxl', cssVar: '--font-size-xxl', value: FONT_SIZE.xxl },
    { name: 'xxxl', cssVar: '--font-size-xxxl', value: FONT_SIZE.xxxl },
  ];

  const errors: string[] = [];

  checks.forEach(({ name, cssVar, value }) => {
    const cssValue = rootStyles.getPropertyValue(cssVar);
    const cssNum = parseFloat(cssValue);

    if (Math.abs(cssNum - value) > 0.1) { // 允许浮点误差
      errors.push(`${cssVar}: CSS=${cssValue}, TS=${value}px`);
    }
  });

  if (errors.length > 0) {
    console.error('字体大小不一致:', errors);
    throw new Error(`字体大小常量与 CSS 变量不一致:\n${errors.join('\n')}`);
  }
}

/**
 * 开发环境自动验证
 */
if (process.env.NODE_ENV === 'development') {
  // 延迟执行,确保 DOM 已加载
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      try {
        validateFontSizes();
        console.log('✅ 字体大小常量验证通过');
      } catch (error) {
        console.error('❌ 字体大小验证失败:', error);
      }
    });
  }
}
