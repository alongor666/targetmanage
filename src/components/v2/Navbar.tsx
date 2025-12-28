"use client";

/**
 * Navbar组件 V2 - 基于UI重构设计方案
 *
 * 规范来源：UI重构设计方案.md - 4.1 顶部导航栏
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navbarV2 } from '@/styles/design-tokens-v2';

export interface NavbarLink {
  /** 链接文本 */
  label: string;

  /** 链接路径 */
  href: string;

  /** 是否在新窗口打开 */
  external?: boolean;
}

export interface NavbarProps {
  /** 导航栏标题/Logo */
  title?: string;

  /** 导航链接列表 */
  links?: NavbarLink[];

  /** 右侧内容（可选） */
  rightContent?: React.ReactNode;

  /** 自定义类名 */
  className?: string;
}

/**
 * Navbar组件 - 顶部导航栏
 *
 * 规范：
 * - 高度：64px
 * - 背景：#FFFFFF
 * - 左边距：24px
 * - 右边距：24px
 * - 链接普通状态：#6C757D
 * - 链接激活状态：#007BFF + font-weight: 600
 * - 链接高度：32px
 *
 * @example
 * <Navbar
 *   title="川分目标管理系统"
 *   links={[
 *     { label: '首页', href: '/' },
 *     { label: '数据管理', href: '/data' },
 *   ]}
 * />
 */
export function Navbar({
  title,
  links = [],
  rightContent,
  className,
}: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav
      style={{
        height: `${navbarV2.height}px`,
        backgroundColor: navbarV2.background,
        paddingLeft: `${navbarV2.paddingX}px`,
        paddingRight: `${navbarV2.paddingX}px`,
      }}
      className={cn(
        'flex items-center justify-between',
        'border-b border-gray-200',
        'sticky top-0 z-50',
        className
      )}
    >
      {/* 左侧：标题/Logo */}
      <div className="flex items-center gap-8">
        {title && (
          <div className="text-lg font-semibold text-gray-900">
            {title}
          </div>
        )}

        {/* 导航链接 */}
        {links.length > 0 && (
          <div className="flex items-center gap-6">
            {links.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  style={{
                    height: `${navbarV2.link.height}px`,
                    color: isActive ? navbarV2.link.active : navbarV2.link.normal,
                    fontWeight: isActive ? navbarV2.link.fontWeight : 400,
                  }}
                  className={cn(
                    'inline-flex items-center',
                    'text-sm',
                    'transition-colors duration-150',
                    'hover:text-[#007BFF]',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-2',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 右侧：自定义内容 */}
      {rightContent && (
        <div className="flex items-center gap-4">
          {rightContent}
        </div>
      )}
    </nav>
  );
}
