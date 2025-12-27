import React from 'react';
import { cn } from '@/lib/utils';
import { colors, typography } from '@/styles/tokens';

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
 * 遵循麦肯锡风格设计规范的KPI卡片组件，支持状态变体和交互。
 * 采用毛玻璃效果、大字号数值（48px）、悬停上浮动画。
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

  // 获取状态变体颜色
  const variantColors = {
    default: {
      border: colors.kpiCard.defaultBorder,
      value: colors.kpiCard.defaultValue,
      bg: undefined,
    },
    good: {
      border: colors.kpiCard.goodBorder,
      value: colors.kpiCard.goodValue,
      bg: colors.kpiCard.goodBg,
    },
    warning: {
      border: colors.kpiCard.warningBorder,
      value: colors.kpiCard.warningValue,
      bg: colors.kpiCard.warningBg,
    },
    danger: {
      border: colors.kpiCard.dangerBorder,
      value: colors.kpiCard.dangerValue,
      bg: colors.kpiCard.dangerBg,
    },
  };

  const currentColors = variantColors[variant];

  return (
    <div
      className={cn(
        // 基础样式 - 毛玻璃效果
        'relative overflow-hidden',
        'rounded-xl border p-6',
        'bg-white/90 backdrop-blur-[20px]',

        // 阴影系统
        'shadow-md',
        isClickable && 'hover:shadow-hover',

        // 过渡动画 - 250ms标准时长
        'transition-all duration-normal ease-out',

        // 交互样式 - 悬停上浮2px（精确）
        isClickable && 'cursor-pointer hover:-translate-y-[2px]',

        // 焦点管理
        isClickable && 'focus:outline-none focus:ring-2 focus:ring-tesla/20 focus:ring-offset-2',

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
      style={{
        borderColor: currentColors.border,
        backgroundColor: currentColors.bg,
      }}
    >
      {/* 标题 - 11px辅助信息字号 */}
      <div
        className="text-xs font-normal tracking-wide"
        style={{
          fontSize: `${typography.fontSize.xs}px`,
          color: colors.text.secondary,
        }}
      >
        {title}
      </div>

      {/* 指标值 - 48px超大字号，粗体 */}
      <div
        className="mt-3 font-semibold leading-tight"
        style={{
          fontSize: `${typography.fontSize.xxxl}px`,
          fontWeight: typography.fontWeight.semibold,
          color: currentColors.value,
        }}
      >
        {value}
      </div>

      {/* 提示文本 - 11px辅助信息 */}
      {hint && (
        <div
          className="mt-3 text-xs"
          style={{
            fontSize: `${typography.fontSize.xs}px`,
            color: colors.text.muted,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
