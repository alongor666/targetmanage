/**
 * Card组件 V2 - 基于UI重构设计方案
 *
 * 规范来源：UI重构设计方案.md - 4.3 KPI 卡片
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { radiusV2, shadowsV2, cardStatesV2, animationsV2 } from '@/styles/design-tokens-v2';

export interface CardProps {
  /** 卡片内容 */
  children: React.ReactNode;

  /** 是否可悬停（显示悬停效果） */
  hoverable?: boolean;

  /** 是否可点击 */
  clickable?: boolean;

  /** 点击事件 */
  onClick?: () => void;

  /** 自定义类名 */
  className?: string;

  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * Card组件 - 通用卡片容器
 *
 * 规范：
 * - 背景：#FFFFFF
 * - 圆角：8px
 * - 内边距：24px
 * - 阴影：0 2px 4px rgba(0,0,0,0.05)
 * - 悬停阴影：0 4px 12px rgba(0,0,0,0.08)
 *
 * @example
 * <Card hoverable>卡片内容</Card>
 * <Card clickable onClick={() => {}}>可点击卡片</Card>
 */
export function Card({
  children,
  hoverable = false,
  clickable = false,
  onClick,
  className,
  style,
}: CardProps) {
  const isInteractive = hoverable || clickable;

  return (
    <div
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      style={{
        borderRadius: `${radiusV2.card}px`,
        boxShadow: shadowsV2.card,
        transition: `all ${animationsV2.pageLoad.cardSlideUp.duration}ms ${animationsV2.pageLoad.cardSlideUp.easing}`,
        ...style,
      }}
      className={cn(
        // 基础样式
        'bg-white p-6',

        // 交互样式
        isInteractive && 'cursor-pointer transition-all duration-300',
        isInteractive && 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]',

        // 焦点样式
        clickable && 'focus:outline-none focus:ring-2 focus:ring-blue-500/20',

        // 自定义类名
        className
      )}
    >
      {children}
    </div>
  );
}
