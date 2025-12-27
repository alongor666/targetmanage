/**
 * KpiCard组件 V2 - 基于UI重构设计方案
 *
 * 规范来源：UI重构设计方案.md - 4.3 KPI 卡片（4列）
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';
import { kpiCardV2, colorsV2 } from '@/styles/design-tokens-v2';

export interface KpiCardProps {
  /** 卡片标题（如 "年度目标"） */
  title: string;

  /** 主要指标值（如 "12345 万元"） */
  value: string | number;

  /** 可选的副标题或提示文本 */
  subtitle?: string;

  /** 状态图标（可选） */
  icon?: React.ReactNode;

  /** 进度条值（0-1，可选） */
  progress?: number;

  /** 进度条颜色（可选） */
  progressColor?: 'success' | 'warning' | 'danger';

  /** 自定义类名 */
  className?: string;
}

/**
 * KpiCard组件 - 符合设计系统的KPI卡片
 *
 * 规范：
 * - 背景：#FFFFFF
 * - 圆角：8px
 * - 内边距：24px
 * - 阴影：box-shadow: 0 2px 4px rgba(0,0,0,0.05)
 * - 标题：14px, font-weight: 500, color: #6C757D
 * - 数值：36px, font-weight: 700, color: #343A40
 * - 进度条：height: 4px, border-radius: 2px
 *
 * @example
 * <KpiCard
 *   title="年度目标"
 *   value="12345 万元"
 *   progress={0.75}
 *   progressColor="success"
 * />
 */
export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  progress,
  progressColor = 'success',
  className,
}: KpiCardProps) {
  // 进度条颜色映射
  const progressColors = {
    success: colorsV2.status.success,
    warning: colorsV2.status.warning,
    danger: colorsV2.status.danger,
  };

  return (
    <Card className={cn('relative overflow-hidden', className)} hoverable>
      {/* 图标（可选） */}
      {icon && (
        <div
          className="mb-3 inline-flex items-center justify-center rounded-lg p-2"
          style={{
            width: kpiCardV2.icon.size + 16,
            height: kpiCardV2.icon.size + 16,
            backgroundColor: colorsV2.primary.blueLight,
          }}
        >
          {icon}
        </div>
      )}

      {/* 标题 */}
      <div
        className="font-medium"
        style={{
          fontSize: `${kpiCardV2.title.fontSize}px`,
          fontWeight: kpiCardV2.title.fontWeight,
          color: kpiCardV2.title.color,
          marginBottom: `${kpiCardV2.title.marginBottom}px`,
        }}
      >
        {title}
      </div>

      {/* 指标值 */}
      <div
        className="font-bold leading-none"
        style={{
          fontSize: `${kpiCardV2.value.fontSize}px`,
          fontWeight: kpiCardV2.value.fontWeight,
          color: kpiCardV2.value.color,
          marginBottom: subtitle || progress !== undefined ? `${kpiCardV2.value.marginBottom}px` : 0,
        }}
      >
        {value}
      </div>

      {/* 副标题（可选） */}
      {subtitle && (
        <div
          className="text-xs"
          style={{
            color: colorsV2.text.secondary,
            marginTop: '4px',
          }}
        >
          {subtitle}
        </div>
      )}

      {/* 进度条（可选） */}
      {progress !== undefined && (
        <div className="mt-4">
          <div
            className="overflow-hidden"
            style={{
              height: `${kpiCardV2.progressBar.height}px`,
              borderRadius: `${kpiCardV2.progressBar.borderRadius}px`,
              backgroundColor: kpiCardV2.progressBar.background,
            }}
          >
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${Math.min(100, Math.max(0, progress * 100))}%`,
                borderRadius: `${kpiCardV2.progressBar.borderRadius}px`,
                backgroundColor: progressColors[progressColor],
              }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
