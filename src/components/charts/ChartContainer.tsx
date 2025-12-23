import React from 'react';
import { cn } from '@/lib/utils';

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
 * 支持预设高度和自定义高度。
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
      sm: '400px', // --chart-height-sm
      md: '600px', // --chart-height
      lg: '600px', // --chart-height-lg
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

      {/* 图表区域 */}
      <div
        className={cn('w-full', chartClassName)}
        style={{ height: getHeight() }}
      >
        {children}
      </div>
    </div>
  );
}
