import React from 'react';
import { cn } from '@/lib/utils';

export interface QuarterlyChartLegendProps {
  className?: string;
}

/**
 * 季度保费规划图自定义图例
 *
 * 简化版图例，只显示基本元素
 *
 * 图例项：
 * - 2026目标: 浅天蓝色柱
 * - 2026实际: 浅灰色柱
 * - 增长率: 蓝色折线
 *
 * @param className - 额外的CSS类名
 *
 * @example
 * <QuarterlyChartLegend />
 */
export function QuarterlyChartLegend({ className }: QuarterlyChartLegendProps) {
  const legendItems = [
    {
      type: 'bar' as const,
      label: '2026目标',
      color: '#dceef9',
    },
    {
      type: 'bar' as const,
      label: '2026实际',
      color: '#f2f2f2',
    },
    {
      type: 'line' as const,
      label: '增长率',
      color: '#0070c0',
    },
  ];

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-6 mb-4',
        className
      )}
    >
      {legendItems.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {item.type === 'bar' && (
            <div
              className="w-[30px] h-4 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
          )}
          {item.type === 'line' && (
            <div
              className="w-[30px] h-0.5 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
          )}
          <span className="text-xs text-gray-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
