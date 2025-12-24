/**
 * 预警徽章组件
 *
 * @component WarningBadge
 * @description 显示季度增长率的预警级别
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { WarningLevel } from '../QuarterlyProportionChart.types';

/**
 * 预警徽章属性
 */
export interface WarningBadgeProps {
  /** 预警级别 */
  level: WarningLevel;
  /** 额外的CSS类名 */
  className?: string;
  /** 是否显示图标，默认 true */
  showIcon?: boolean;
  /** 是否显示文本，默认 true */
  showText?: boolean;
  /** 尺寸，默认 'md' */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 预警级别配置
 */
const WARNING_CONFIG: Record<
  WarningLevel,
  {
    label: string;
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  excellent: {
    label: '优秀',
    icon: '✓',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  normal: {
    label: '正常',
    icon: '•',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  warning: {
    label: '预警',
    icon: '⚠',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  danger: {
    label: '危险',
    icon: '⚠',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

/**
 * 尺寸配置
 */
const SIZE_CONFIG: Record<
  'sm' | 'md' | 'lg',
  {
    padding: string;
    fontSize: string;
    iconSize: string;
  }
> = {
  sm: {
    padding: 'px-2 py-0.5',
    fontSize: 'text-xs',
    iconSize: 'text-sm',
  },
  md: {
    padding: 'px-2.5 py-1',
    fontSize: 'text-xs',
    iconSize: 'text-base',
  },
  lg: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-sm',
    iconSize: 'text-lg',
  },
};

/**
 * 预警徽章组件
 *
 * @param props - 组件属性
 * @returns React 组件
 *
 * @example
 * ```tsx
 * <WarningBadge level="excellent" />
 * <WarningBadge level="warning" size="lg" showIcon={false} />
 * ```
 */
export function WarningBadge({
  level,
  className,
  showIcon = true,
  showText = true,
  size = 'md',
}: WarningBadgeProps) {
  const config = WARNING_CONFIG[level];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium transition-all',
        config.color,
        config.bgColor,
        config.borderColor,
        sizeConfig.padding,
        sizeConfig.fontSize,
        className
      )}
    >
      {showIcon && (
        <span className={cn('font-bold', sizeConfig.iconSize)}>{config.icon}</span>
      )}
      {showText && <span>{config.label}</span>}
    </span>
  );
}

/**
 * 预警级别选择器（用于测试）
 */
export function WarningBadgeSelector() {
  return (
    <div className="space-y-2">
      {(['excellent', 'normal', 'warning', 'danger'] as WarningLevel[]).map((level) => (
        <div key={level} className="flex items-center gap-4">
          <span className="text-sm text-gray-600 w-20">{level}:</span>
          <WarningBadge level={level} />
          <WarningBadge level={level} size="sm" showIcon={false} />
          <WarningBadge level={level} size="lg" />
        </div>
      ))}
    </div>
  );
}

export default WarningBadge;
