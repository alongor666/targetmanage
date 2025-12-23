import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps {
  /** 可选的区块标题 */
  title?: string;

  /** 可选的区块副标题或描述 */
  subtitle?: string;

  /** 区块内容 */
  children: React.ReactNode;

  /** 自定义类名 */
  className?: string;

  /** 内容区域自定义类名 */
  contentClassName?: string;
}

/**
 * Section - 页面区块容器组件
 *
 * 提供统一的区块样式，包括圆角、边框、内边距和背景色。
 * 符合设计规范的标准容器组件。
 *
 * @example
 * 基础用法（无标题）：
 * ```tsx
 * <Section>
 *   <div>区块内容</div>
 * </Section>
 * ```
 *
 * @example
 * 带标题：
 * ```tsx
 * <Section title="经营概览">
 *   <KpiGrid>
 *     <KpiCard title="年度目标" value="12345.67 万元" />
 *   </KpiGrid>
 * </Section>
 * ```
 *
 * @example
 * 带标题和副标题：
 * ```tsx
 * <Section
 *   title="月度目标分解"
 *   subtitle="按月度展示全年目标分配情况"
 * >
 *   <Chart />
 * </Section>
 * ```
 */
export function Section({
  title,
  subtitle,
  children,
  className,
  contentClassName,
}: SectionProps) {
  return (
    <section
      className={cn(
        // 基础样式 - 使用设计token
        'rounded-xl border border-border-light p-4 bg-white',
        className
      )}
    >
      {/* 标题区域 */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-lg font-semibold text-text-primary">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>
      )}

      {/* 内容区域 */}
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
