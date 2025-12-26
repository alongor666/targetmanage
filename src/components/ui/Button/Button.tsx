import React from 'react';
import { cn } from '@/lib/utils';
import { colors, spacing, radius, typography, shadows, animations } from '@/styles/tokens';

/**
 * 按钮变体类型
 */
export type ButtonVariant = 'default' | 'outline' | 'ghost' | 'link';

/**
 * 按钮尺寸类型
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * 按钮组件属性
 */
export interface ButtonProps {
  /** 按钮内容 */
  children: React.ReactNode;
  
  /** 按钮变体 */
  variant?: ButtonVariant;
  
  /** 按钮尺寸 */
  size?: ButtonSize;
  
  /** 是否禁用 */
  disabled?: boolean;
  
  /** 是否加载中 */
  loading?: boolean;
  
  /** 是否全宽 */
  fullWidth?: boolean;
  
  /** 左侧图标 */
  leftIcon?: React.ReactNode;
  
  /** 右侧图标 */
  rightIcon?: React.ReactNode;
  
  /** 自定义类名 */
  className?: string;
  
  /** 点击事件 */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /** 按钮类型 */
  type?: 'button' | 'submit' | 'reset';
  
  /** HTML属性 */
  [key: string]: any;
}

/**
 * 获取按钮颜色配置
 * @param variant 按钮变体
 * @param disabled 是否禁用
 * @returns 颜色配置对象
 */
function getButtonColors(variant: ButtonVariant, disabled: boolean) {
  if (disabled) {
    return {
      bg: 'transparent',
      border: colors.border.light,
      text: colors.text.muted,
      hover: {
        bg: 'transparent',
        border: colors.border.light,
        text: colors.text.muted
      }
    };
  }

  switch (variant) {
    case 'default':
      return {
        bg: colors.brand.primaryRed,
        border: colors.brand.primaryRed,
        text: colors.text.inverse,
        hover: {
          bg: '#b92b27', // 稍微亮一点的红
          border: '#b92b27',
          text: colors.text.inverse
        }
      };
    
    case 'outline':
      return {
        bg: 'transparent',
        border: colors.border.medium,
        text: colors.text.primary,
        hover: {
          bg: colors.interaction.hover,
          border: colors.brand.teslaBlue,
          text: colors.brand.teslaBlue
        }
      };
    
    case 'ghost':
      return {
        bg: 'transparent',
        border: 'transparent',
        text: colors.text.secondary,
        hover: {
          bg: colors.interaction.hover,
          border: 'transparent',
          text: colors.text.primary
        }
      };
    
    case 'link':
      return {
        bg: 'transparent',
        border: 'transparent',
        text: colors.brand.teslaBlue,
        hover: {
          bg: 'transparent',
          border: 'transparent',
          text: colors.brand.teslaBlue,
          textDecoration: 'underline'
        }
      };
    
    default:
      return getButtonColors('default', disabled);
  }
}

/**
 * 获取按钮尺寸配置
 * @param size 按钮尺寸
 * @returns 尺寸配置对象
 */
function getButtonSize(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return {
        height: '32px',
        padding: `0 ${spacing.sm}px`, // 8px 左右
        fontSize: typography.fontSize.sm, // 12px
        borderRadius: radius.sm // 8px
      };
    
    case 'md':
      return {
        height: '40px',
        padding: `0 ${spacing.md}px`, // 16px 左右
        fontSize: typography.fontSize.base, // 14px
        borderRadius: radius.sm // 8px
      };
    
    case 'lg':
      return {
        height: '48px',
        padding: `0 ${spacing.lg}px`, // 24px 左右
        fontSize: typography.fontSize.md, // 16px
        borderRadius: radius.md // 12px
      };
    
    default:
      return getButtonSize('md');
  }
}

/**
 * Button - 按钮组件
 *
 * 全局可复用的按钮组件，支持多种变体、尺寸和状态。
 * 严格遵循设计系统规范，使用设计令牌确保一致性。
 *
 * @example
 * 基础用法：
 * ```tsx
 * <Button>默认按钮</Button>
 * <Button variant="outline">轮廓按钮</Button>
 * <Button variant="ghost">幽灵按钮</Button>
 * <Button variant="link">链接按钮</Button>
 * ```
 *
 * @example
 * 不同尺寸：
 * ```tsx
 * <Button size="sm">小按钮</Button>
 * <Button size="md">中按钮</Button>
 * <Button size="lg">大按钮</Button>
 * ```
 *
 * @example
 * 带图标：
 * ```tsx
 * <Button leftIcon={<IconPlus />}>添加</Button>
 * <Button rightIcon={<IconArrow />}>继续</Button>
 * <Button loading>加载中...</Button>
 * ```
 *
 * @example
 * 状态控制：
 * ```tsx
 * <Button disabled>禁用按钮</Button>
 * <Button loading loading>加载中</Button>
 * <Button fullWidth>全宽按钮</Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  // 获取样式配置
  const buttonColors = getButtonColors(variant, disabled || loading);
  const sizeConfig = getButtonSize(size);

  // 基础样式类
  const baseClasses = [
    // 基础样式
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2', // 图标和文字的间距
    'font-medium',
    'transition-all',
    'duration-250',
    'ease-out',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'cursor-pointer',
    'select-none',
    
    // 尺寸相关
    'border',
    'box-border',
    
    // 禁用状态
    (disabled || loading) && 'cursor-not-allowed',
    
    // 全宽
    fullWidth && 'w-full'
  ];

  // 变体特定样式
  const variantClasses = {
    default: [
      `bg-[${buttonColors.bg}]`,
      `border-[${buttonColors.border}]`,
      `text-[${buttonColors.text}]`,
      `hover:bg-[${buttonColors.hover.bg}]`,
      `hover:border-[${buttonColors.hover.border}]`,
      `hover:text-[${buttonColors.hover.text}]`,
      'focus:ring-[var(--tesla-blue)]'
    ],
    
    outline: [
      `bg-[${buttonColors.bg}]`,
      `border-[${buttonColors.border}]`,
      `text-[${buttonColors.text}]`,
      `hover:bg-[${buttonColors.hover.bg}]`,
      `hover:border-[${buttonColors.hover.border}]`,
      `hover:text-[${buttonColors.hover.text}]`,
      'focus:ring-[var(--tesla-blue)]'
    ],

    ghost: [
      `bg-[${buttonColors.bg}]`,
      `border-[${buttonColors.border}]`,
      `text-[${buttonColors.text}]`,
      `hover:bg-[${buttonColors.hover.bg}]`,
      `hover:text-[${buttonColors.hover.text}]`,
      'focus:ring-[var(--tesla-blue)]'
    ],

    link: [
      `bg-[${buttonColors.bg}]`,
      `border-[${buttonColors.border}]`,
      `text-[${buttonColors.text}]`,
      buttonColors.hover.textDecoration === 'underline' ? 'hover:underline' : '',
      `hover:text-[${buttonColors.hover.text}]`,
      'focus:ring-[var(--tesla-blue)]',
      'p-0', // 链接样式无内边距
    ]
  };

  // 尺寸特定样式
  const sizeClasses = {
    sm: [
      'h-8', // 32px
      'px-2', // 8px
      'text-xs', // 12px
      'rounded-sm' // 8px
    ],
    
    md: [
      'h-10', // 40px
      'px-4', // 16px
      'text-sm', // 14px
      'rounded-sm' // 8px
    ],
    
    lg: [
      'h-12', // 48px
      'px-6', // 24px
      'text-base', // 16px
      'rounded-md' // 12px
    ]
  };

  // 禁用状态样式
  const disabledClasses = (disabled || loading) ? [
    'bg-transparent',
    `border-[${colors.border.light}]`,
    `text-[${colors.text.muted}]`,
    'cursor-not-allowed'
  ] : [];

  // 加载状态样式
  const loadingClasses = loading ? [
    'cursor-wait',
    'opacity-70'
  ] : [];

  // 合并所有类名
  const buttonClasses = cn(
    ...baseClasses,
    ...variantClasses[variant],
    ...sizeClasses[size],
    ...disabledClasses,
    ...loadingClasses,
    className
  );

  // 渲染加载图标
  const renderLoadingIcon = () => (
    <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 w-4 h-4" />
  );

  // 处理点击事件
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* 左侧图标 */}
      {leftIcon && !loading && (
        <span className="flex-shrink-0">
          {leftIcon}
        </span>
      )}
      
      {/* 加载状态图标 */}
      {loading && (
        <span className="flex-shrink-0">
          {renderLoadingIcon()}
        </span>
      )}
      
      {/* 按钮文字 */}
      <span className="truncate">
        {children}
      </span>
      
      {/* 右侧图标 */}
      {rightIcon && !loading && (
        <span className="flex-shrink-0">
          {rightIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;