import React from 'react';
import { cn } from '@/lib/utils';
import { layout } from '@/styles/tokens';

export interface ChartContainerProps {
  /** 可选的图表标题 */
  title?: string;

  /** 可选的图表副标题或说明 */
  subtitle?: string;

  /** 图表高度：预设值或自定义数字（px） */
  height?: number | 'sm' | 'md' | 'lg';

  /** 图表内容（通常是 ReactECharts 组件） */
  children: React.ReactNode;

  /** 自定义容器类名 */
  className?: string;

  /** 图表区域自定义类名 */
  chartClassName?: string;
}

/**
 * ChartContainer - 图表容器组件
 *
 * 为 ECharts 图表提供标准化的容器样式和布局。
 * 采用浅色玻璃质感、12px圆角、标准阴影效果。
 *
 * @example
 * 基础用法（默认高度）：
 * ```tsx
 * <ChartContainer title="月度目标分解">
 *   <ReactECharts option={chartOption} />
 * </ChartContainer>
 * ```
 *
 * @example
 * 预设高度：
 * ```tsx
 * <ChartContainer
 *   title="经营概览趋势"
 *   subtitle="近12个月数据"
 *   height="lg"
 * >
 *   <ReactECharts option={chartOption} />
 * </ChartContainer>
 * ```
 *
 * @example
 * 自定义高度：
 * ```tsx
 * <ChartContainer height={800}>
 *   <ReactECharts option={chartOption} />
 * </ChartContainer>
 * ```
 */
export function ChartContainer({
  title,
  subtitle,
  height = 'md',
  children,
  className,
  chartClassName,
}: ChartContainerProps) {
  // 计算图表高度
  const getHeight = (): string => {
    if (typeof height === 'number') {
      return `${height}px`;
    }

    // 使用设计token定义的高度
    const heightMap = {
      sm: `${layout.chartHeightSm}px`,   // 400px
      md: `${layout.chartHeight}px`,     // 600px
      lg: `${layout.chartHeightLg}px`,   // 600px
    };

    return heightMap[height];
  };

  return (
    <div className={cn('w-full', className)}>
      {/* 标题区域 */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-base font-semibold text-text-primary">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>
      )}

      {/* 图表区域 - 浅色玻璃质感 */}
      <div
        className={cn(
          'w-full',
          // 玻璃质感背景
          'bg-white/95 backdrop-blur-sm',
          // 圆角和阴影
          'rounded-xl shadow-md',
          // 内边距
          'p-4',
          chartClassName
        )}
        style={{ height: getHeight() }}
      >
        {children}
      </div>
    </div>
  );
}
