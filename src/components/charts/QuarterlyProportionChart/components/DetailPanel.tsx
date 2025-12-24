/**
 * 季度详情面板组件
 *
 * @component DetailPanel
 * @description 显示选中季度的详细数据
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { WarningBadge } from './WarningBadge';
import type { QuarterDetailData } from '../QuarterlyProportionChart.types';

/**
 * 详情面板属性
 */
export interface DetailPanelProps {
  /** 季度详细数据 */
  detail: QuarterDetailData;
  /** 关闭回调 */
  onClose: () => void;
  /** 额外的CSS类名 */
  className?: string;
  /** 是否显示关闭按钮，默认 true */
  showCloseButton?: boolean;
  /** 布局方式，默认 'grid' */
  layout?: 'grid' | 'list';
}

/**
 * 数据项组件
 */
interface DataItemProps {
  label: string;
  value: string | number | null;
  unit?: string;
  highlight?: boolean;
  className?: string;
}

function DataItem({ label, value, unit, highlight, className }: DataItemProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div
        className={cn(
          'text-lg font-semibold',
          highlight ? 'text-blue-700' : 'text-gray-900'
        )}
      >
        {value !== null && value !== undefined ? (
          <span>{typeof value === 'number' ? value.toLocaleString('zh-CN') : value}</span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
        {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
      </div>
    </div>
  );
}

/**
 * 网格布局详情面板
 */
function GridLayoutDetailPanel({
  detail,
  onClose,
  showCloseButton = true,
  className,
}: DetailPanelProps) {
  const achievementRate =
    detail.current !== null && detail.target !== 0
      ? ((detail.current / detail.target) * 100).toFixed(1)
      : null;

  return (
    <div className={cn('bg-gray-50 rounded-lg p-4 border border-gray-200', className)}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-900">
          {detail.quarterLabel}详细数据
        </h4>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-gray-200"
            aria-label="关闭详情面板"
          >
            ✕ 关闭
          </button>
        )}
      </div>

      {/* 数据网格 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        {/* 2026目标 */}
        <DataItem
          label="2026目标"
          value={detail.target}
          highlight
        />
        <div className="text-xs text-gray-500">
          占比 {(detail.targetShare * 100).toFixed(1)}%
        </div>

        {/* 2025实际 */}
        <DataItem
          label="2025实际"
          value={detail.actual2025}
        />
        <div className="text-xs text-gray-500">
          占比{' '}
          {detail.actualShare2025
            ? `${(detail.actualShare2025 * 100).toFixed(1)}%`
            : '—'}
        </div>

        {/* 增长率 */}
        <div className="flex flex-col">
          <div className="text-xs text-gray-500 mb-1">增长率</div>
          <div
            className={cn(
              'text-lg font-semibold',
              detail.growth !== null && detail.growth >= 0.15
                ? 'text-green-600'
                : detail.growth !== null && detail.growth >= 0.05
                ? 'text-gray-700'
                : detail.growth !== null && detail.growth >= 0
                ? 'text-orange-600'
                : 'text-red-600'
            )}
          >
            {detail.growth !== null ? `${(detail.growth * 100).toFixed(2)}%` : '—'}
          </div>
          <WarningBadge level={detail.warningLevel} size="sm" />
        </div>

        {/* 当前实际 */}
        <div className="flex flex-col">
          <DataItem
            label="当前实际"
            value={detail.current}
          />
          <div className="text-xs text-gray-500">
            {achievementRate !== null ? (
              <span>达成率 {achievementRate}%</span>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 列表布局详情面板
 */
function ListLayoutDetailPanel({
  detail,
  onClose,
  showCloseButton = true,
  className,
}: DetailPanelProps) {
  const achievementRate =
    detail.current !== null && detail.target !== 0
      ? ((detail.current / detail.target) * 100).toFixed(1)
      : null;

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm', className)}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900">
          {detail.quarterLabel}详细数据
        </h4>
        <div className="flex items-center gap-2">
          <WarningBadge level={detail.warningLevel} size="sm" />
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-gray-100"
              aria-label="关闭详情面板"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 数据列表 */}
      <div className="p-4 space-y-3">
        {/* 2026目标 */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">2026目标</span>
          <div className="text-right">
            <div className="text-lg font-semibold text-blue-700">
              {detail.target.toLocaleString('zh-CN')}
            </div>
            <div className="text-xs text-gray-500">
              占比 {(detail.targetShare * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* 2025实际 */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">2025实际</span>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {detail.actual2025?.toLocaleString('zh-CN') ?? '—'}
            </div>
            <div className="text-xs text-gray-500">
              占比{' '}
              {detail.actualShare2025
                ? `${(detail.actualShare2025 * 100).toFixed(1)}%`
                : '—'}
            </div>
          </div>
        </div>

        {/* 增长率 */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">增长率</span>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'text-lg font-semibold',
                detail.growth !== null && detail.growth >= 0.15
                  ? 'text-green-600'
                  : detail.growth !== null && detail.growth >= 0.05
                  ? 'text-gray-700'
                  : detail.growth !== null && detail.growth >= 0
                  ? 'text-orange-600'
                  : 'text-red-600'
              )}
            >
              {detail.growth !== null ? `${(detail.growth * 100).toFixed(2)}%` : '—'}
            </div>
          </div>
        </div>

        {/* 当前实际 */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-600">当前实际</span>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {detail.current?.toLocaleString('zh-CN') ?? '—'}
            </div>
            {achievementRate !== null && (
              <div className="text-xs text-gray-500">达成率 {achievementRate}%</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 季度详情面板组件
 *
 * @param props - 组件属性
 * @returns React 组件
 *
 * @example
 * ```tsx
 * <DetailPanel
 *   detail={quarterDetail}
 *   onClose={() => setShowDetail(false)}
 *   layout="grid"
 * />
 *
 * <DetailPanel
 *   detail={quarterDetail}
 *   onClose={handleClose}
 *   layout="list"
 *   showCloseButton={true}
 * />
 * ```
 */
export function DetailPanel({
  layout = 'grid',
  ...props
}: DetailPanelProps) {
  if (layout === 'list') {
    return <ListLayoutDetailPanel {...props} layout="list" />;
  }

  return <GridLayoutDetailPanel {...props} layout="grid" />;
}

/**
 * 详情面板展示器（用于测试）
 */
export function DetailPanelShowcase() {
  const mockDetail: QuarterDetailData = {
    quarter: 0,
    quarterLabel: '一季度',
    target: 1150,
    targetShare: 0.25,
    actual2025: 1050,
    actualShare2025: 0.24,
    current: 1100,
    growth: 0.0476,
    warningLevel: 'normal',
  };

  const [showGrid, setShowGrid] = React.useState(true);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200"
        >
          切换布局: {showGrid ? 'Grid' : 'List'}
        </button>
      </div>

      <DetailPanel
        detail={mockDetail}
        onClose={() => console.log('Close')}
        layout={showGrid ? 'grid' : 'list'}
      />
    </div>
  );
}

export default DetailPanel;
