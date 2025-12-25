/**
 * 表格视图组件
 *
 * @component TableView
 * @description 以表格形式展示图表数据，支持季度/月度数据
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { PeriodDetailData, TimeGranularity } from '../UniversalChart.types';

/**
 * TableView 组件属性
 */
export interface TableViewProps {
  /** 周期详细数据数组 */
  periodDetails: PeriodDetailData[];
  /** 时间粒度 */
  timeGranularity: TimeGranularity;
  /** 额外的CSS类名 */
  className?: string;
}

/**
 * 格式化数值（千分位）
 */
function formatNumber(value: number | null): string {
  if (value === null) return '—';
  return Math.round(value).toLocaleString('zh-CN');
}

/**
 * 格式化百分比
 */
function formatPercent(value: number | null): string {
  if (value === null) return '—';
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * 格式化增长率（带颜色）
 */
function formatGrowth(value: number | null): React.ReactNode {
  if (value === null) return <span className="text-gray-400">—</span>;

  const percentage = value * 100;
  const colorClass = percentage >= 12
    ? 'text-green-600'
    : percentage >= 5
      ? 'text-blue-600'
      : percentage >= 0
        ? 'text-orange-600'
        : 'text-red-600';

  return (
    <span className={cn('font-medium', colorClass)}>
      {percentage.toFixed(1)}%
    </span>
  );
}

/**
 * 获取预警级别样式
 */
function getWarningLevelClass(level: string): string {
  switch (level) {
    case 'excellent':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'normal':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'warning':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'danger':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

/**
 * 表格视图组件
 */
export function TableView({ periodDetails, timeGranularity, className }: TableViewProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              {timeGranularity === 'quarterly' ? '季度' : '月份'}
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">2026目标</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">目标占比</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">2025实际</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">2025占比</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">当前实际</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">增长率</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">状态</th>
          </tr>
        </thead>
        <tbody>
          {periodDetails.map((detail, index) => (
            <tr
              key={detail.index}
              className={cn(
                'border-b border-gray-100 transition-colors hover:bg-gray-50',
                index % 2 === 0 && 'bg-white'
              )}
            >
              {/* 季度/月份 */}
              <td className="px-4 py-3 font-medium text-gray-900">
                {detail.label}
              </td>

              {/* 2026目标 */}
              <td className="px-4 py-3 text-right text-gray-700">
                {formatNumber(detail.target)}
              </td>

              {/* 目标占比 */}
              <td className="px-4 py-3 text-right text-gray-700">
                {formatPercent(detail.targetShare)}
              </td>

              {/* 2025实际 */}
              <td className="px-4 py-3 text-right text-gray-700">
                {formatNumber(detail.baseline2025)}
              </td>

              {/* 2025占比 */}
              <td className="px-4 py-3 text-right text-gray-700">
                {formatPercent(detail.baselineShare2025)}
              </td>

              {/* 当前实际 */}
              <td className="px-4 py-3 text-right font-medium text-gray-900">
                {formatNumber(detail.current)}
              </td>

              {/* 增长率 */}
              <td className="px-4 py-3 text-right">
                {formatGrowth(detail.growth)}
              </td>

              {/* 状态 */}
              <td className="px-4 py-3 text-center">
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    getWarningLevelClass(detail.warningLevel)
                  )}
                >
                  {detail.warningLevel === 'excellent' && '优秀'}
                  {detail.warningLevel === 'normal' && '正常'}
                  {detail.warningLevel === 'warning' && '预警'}
                  {detail.warningLevel === 'danger' && '危险'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TableView;
