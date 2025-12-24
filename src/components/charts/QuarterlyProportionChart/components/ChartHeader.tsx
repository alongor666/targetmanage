/**
 * 图表头部组件
 *
 * @component ChartHeader
 * @description 图表标题、图例、操作按钮区域
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { ViewSwitcher } from './ViewSwitcher';
import type { ViewMode } from '../QuarterlyProportionChart.types';

/**
 * 图例项配置
 */
interface LegendItem {
  type: 'bar' | 'line' | 'dash';
  label: string;
  color: string;
  width?: string;
}

/**
 * 头部属性
 */
export interface ChartHeaderProps {
  /** 标题文本 */
  title?: string;
  /** 当前视图模式 */
  viewMode: ViewMode;
  /** 视图模式变化回调 */
  onViewModeChange: (mode: ViewMode) => void;
  /** 是否显示预警线图例，默认 true */
  showWarningLineLegend?: boolean;
  /** 额外的CSS类名 */
  className?: string;
  /** 视图切换器样式 */
  viewSwitcherVariant?: 'buttons' | 'tabs' | 'segment';
}

/**
 * 图例项组件
 */
interface LegendItemComponentProps {
  item: LegendItem;
  className?: string;
}

function LegendItemComponent({ item, className }: LegendItemComponentProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {item.type === 'bar' && (
        <div
          className="h-3 rounded-sm"
          style={{
            width: item.width || '16px',
            backgroundColor: item.color,
          }}
        />
      )}
      {item.type === 'line' && (
        <div
          className="h-0.5 rounded-sm"
          style={{
            width: item.width || '24px',
            backgroundColor: item.color,
          }}
        />
      )}
      {item.type === 'dash' && (
        <div
          className="h-0.5 border-dashed border-b-2"
          style={{
            width: item.width || '32px',
            borderColor: item.color,
            backgroundColor: 'transparent',
          }}
        />
      )}
      <span className="text-xs text-gray-600">{item.label}</span>
    </div>
  );
}

/**
 * 图表头部组件
 *
 * @param props - 组件属性
 * @returns React 组件
 *
 * @example
 * ```tsx
 * <ChartHeader
 *   title="季度占比规划图"
 *   viewMode="proportion"
 *   onViewModeChange={(mode) => setViewMode(mode)}
 * />
 *
 * <ChartHeader
 *   title="全省季度占比"
 *   viewMode={viewMode}
 *   onViewModeChange={handleModeChange}
 *   showWarningLineLegend={true}
 *   viewSwitcherVariant="tabs"
 * />
 * ```
 */
export function ChartHeader({
  title = '季度占比规划图',
  viewMode,
  onViewModeChange,
  showWarningLineLegend = true,
  className,
  viewSwitcherVariant = 'buttons',
}: ChartHeaderProps) {
  // 图例配置
  const legendItems: LegendItem[] = [
    {
      type: 'bar',
      label: '2026规划',
      color: '#dceef9',
      width: '16px',
    },
    {
      type: 'bar',
      label: '2025实际',
      color: '#f2f2f2',
      width: '16px',
    },
  ];

  // 增长率相关图例（仅在非绝对值视图显示）
  if (viewMode !== 'absolute') {
    legendItems.push({
      type: 'line',
      label: '增长率',
      color: '#0070c0',
      width: '24px',
    });
  }

  return (
    <div className={cn('p-4 border-b border-gray-100', className)}>
      {/* 标题和视图切换器 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>

        <ViewSwitcher
          currentMode={viewMode}
          onChange={onViewModeChange}
          variant={viewSwitcherVariant}
        />
      </div>

      {/* 图例说明 */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
        {/* 基础图例 */}
        {legendItems.map((item, index) => (
          <LegendItemComponent key={index} item={item} />
        ))}

        {/* 阈值状态规则（仅在非绝对值视图显示） */}
        {viewMode !== 'absolute' && (
          <>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-green-600 font-medium">↗ 优秀 ≥15%</span>
              <span className="text-gray-600 font-medium">→ 正常 5-15%</span>
              <span className="text-orange-600 font-medium">↘ 预警 &lt;5%</span>
              <span className="text-red-600 font-medium">⚠ 危险 &lt;0%</span>
            </div>

            {/* 预警线图例 */}
            {showWarningLineLegend && (
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-8 h-0.5 bg-orange-500 border-dashed border-b-2 border-orange-500" />
                <span className="text-orange-600 font-medium">预警线 5%</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * 紧凑型头部（仅标题和视图切换）
 */
export interface CompactChartHeaderProps {
  title?: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export function CompactChartHeader({
  title = '季度占比规划图',
  viewMode,
  onViewModeChange,
  className,
}: CompactChartHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between p-4 border-b border-gray-100', className)}>
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      <ViewSwitcher
        currentMode={viewMode}
        onChange={onViewModeChange}
        variant="tabs"
        size="sm"
      />
    </div>
  );
}

/**
 * 头部组件展示器（用于测试）
 */
export function ChartHeaderShowcase() {
  const [viewMode, setViewMode] = React.useState<ViewMode>('proportion');

  return (
    <div className="space-y-6 p-4">
      <div>
        <div className="text-sm text-gray-600 mb-2">标准头部:</div>
        <ChartHeader
          title="季度占比规划图"
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      <div>
        <div className="text-sm text-gray-600 mb-2">紧凑型头部:</div>
        <CompactChartHeader
          title="季度占比规划图"
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      <div className="text-sm text-gray-600 mt-4">
        当前视图模式: <span className="font-medium text-blue-600">{viewMode}</span>
      </div>
    </div>
  );
}

export default ChartHeader;
