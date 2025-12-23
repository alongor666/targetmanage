import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  /** 徽章内容 */
  children: React.ReactNode;

  /** 徽章变体 */
  variant?: 'default' | 'good' | 'warning' | 'danger' | 'info';

  /** 徽章尺寸 */
  size?: 'sm' | 'md' | 'lg';

  /** 是否为轮廓样式 */
  outline?: boolean;

  /** 自定义类名 */
  className?: string;
}

/**
 * Badge - 徽章组件
 *
 * 用于显示状态、标签或计数等小型信息。
 * 支持多种颜色变体和尺寸。
 *
 * @example
 * 基础用法：
 * ```tsx
 * <Badge>新</Badge>
 * <Badge variant="good">优秀</Badge>
 * <Badge variant="warning">预警</Badge>
 * <Badge variant="danger">危险</Badge>
 * ```
 *
 * @example
 * 不同尺寸：
 * ```tsx
 * <Badge size="sm">小</Badge>
 * <Badge size="md">中</Badge>
 * <Badge size="lg">大</Badge>
 * ```
 *
 * @example
 * 轮廓样式：
 * ```tsx
 * <Badge variant="good" outline>优秀</Badge>
 * <Badge variant="warning" outline>预警</Badge>
 * ```
 *
 * @example
 * 状态标签：
 * ```tsx
 * <Badge variant="info">进行中</Badge>
 * <Badge variant="good">已完成</Badge>
 * <Badge variant="danger">已失败</Badge>
 * ```
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  outline = false,
  className,
}: BadgeProps) {
  // 尺寸样式
  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  // 变体样式
  const variantStyles = outline
    ? {
        default: 'border border-border-light text-text-secondary bg-transparent',
        good: 'border border-status-good text-status-good bg-transparent',
        warning: 'border border-status-warning text-status-warning bg-transparent',
        danger: 'border border-status-danger text-status-danger bg-transparent',
        info: 'border border-tesla text-tesla bg-transparent',
      }
    : {
        default: 'bg-border-light text-text-primary',
        good: 'bg-status-good text-text-inverse',
        warning: 'bg-status-warning text-text-primary',
        danger: 'bg-status-danger text-text-inverse',
        info: 'bg-tesla text-text-inverse',
      };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'rounded-sm font-semibold',
        'transition-normal',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
