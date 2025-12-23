import React from 'react';
import { cn } from '@/lib/utils';

export interface KpiCardProps {
  /** 卡片标题（如 "年度目标"） */
  title: string;

  /** 主要指标值（如 "12345.67 万元"） */
  value: string | number;

  /** 可选的提示文本或副标题 */
  hint?: string;

  /** 状态变体，用于颜色编码 */
  variant?: 'default' | 'good' | 'warning' | 'danger';

  /** 自定义容器类名 */
  className?: string;

  /** 点击处理器，使卡片可交互 */
  onClick?: () => void;
}

/**
 * KpiCard - 显示单个KPI指标
 *
 * 遵循设计规范的KPI卡片组件，支持状态变体和交互。
 *
 * @example
 * 基础用法：
 * ```tsx
 * <KpiCard
 *   title="年度目标"
 *   value="12345.67 万元"
 * />
 * ```
 *
 * @example
 * 带状态和提示：
 * ```tsx
 * <KpiCard
 *   title="时间进度达成率"
 *   value="95.2%"
 *   hint="距离目标还差 4.8%"
 *   variant="warning"
 * />
 * ```
 *
 * @example
 * 可点击的卡片：
 * ```tsx
 * <KpiCard
 *   title="点击查看详情"
 *   value="100%"
 *   variant="good"
 *   onClick={() => router.push('/details')}
 * />
 * ```
 */
export function KpiCard({
  title,
  value,
  hint,
  variant = 'default',
  className,
  onClick,
}: KpiCardProps) {
  const isClickable = Boolean(onClick);

  return (
    <div
      className={cn(
        // 基础样式 - 使用设计token
        'rounded-xl border p-4 bg-white shadow-md',
        'transition-normal',

        // 交互样式
        isClickable && 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5',

        // 状态变体 - 边框颜色
        variant === 'good' && 'border-status-good/20',
        variant === 'warning' && 'border-status-warning/20',
        variant === 'danger' && 'border-status-danger/20',
        variant === 'default' && 'border-border-light',

        // 自定义类名
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {/* 标题 */}
      <div className="text-xs text-text-secondary">{title}</div>

      {/* 指标值 */}
      <div
        className={cn(
          'mt-2 text-lg font-semibold',
          // 状态变体 - 文字颜色
          variant === 'good' && 'text-status-good',
          variant === 'warning' && 'text-status-warning',
          variant === 'danger' && 'text-status-danger'
        )}
      >
        {value}
      </div>

      {/* 提示文本 */}
      {hint && <div className="mt-2 text-xs text-text-muted">{hint}</div>}
    </div>
  );
}
