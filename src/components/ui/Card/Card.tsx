import React from 'react';
import { cn } from '@/lib/utils';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';

/**
 * 卡片变体类型
 */
export type CardVariant = 'default' | 'outlined' | 'elevated';

/**
 * 卡片尺寸类型
 */
export type CardSize = 'sm' | 'md' | 'lg';

/**
 * 卡片组件属性
 */
export interface CardProps {
  /** 卡片内容 */
  children: React.ReactNode;
  
  /** 卡片变体 */
  variant?: CardVariant;
  
  /** 卡片尺寸 */
  size?: CardSize;
  
  /** 卡片标题 */
  title?: React.ReactNode;
  
  /** 卡片副标题 */
  subtitle?: React.ReactNode;
  
  /** 卡片操作区域 */
  actions?: React.ReactNode;
  
  /** 是否可点击 */
  clickable?: boolean;
  
  /** 是否可悬停 */
  hoverable?: boolean;
  
  /** 是否全宽 */
  fullWidth?: boolean;
  
  /** 内边距 */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  
  /** 自定义类名 */
  className?: string;
  
  /** 内容区域自定义类名 */
  contentClassName?: string;
  
  /** 点击事件 */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  /** 鼠标进入事件 */
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  /** 鼠标离开事件 */
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  /** HTML属性 */
  [key: string]: any;
}

/**
 * 获取卡片尺寸配置
 * @param size 卡片尺寸
 * @returns 尺寸配置
 */
function getCardSize(size: CardSize) {
  switch (size) {
    case 'sm':
      return {
        borderRadius: radius.sm, // 8px
        titleSize: typography.fontSize.sm, // 12px
        subtitleSize: typography.fontSize.xs, // 11px
        contentSize: typography.fontSize.sm, // 12px
        spacing: spacing.sm // 8px
      };
    
    case 'md':
      return {
        borderRadius: radius.md, // 12px
        titleSize: typography.fontSize.md, // 16px
        subtitleSize: typography.fontSize.sm, // 12px
        contentSize: typography.fontSize.base, // 14px
        spacing: spacing.md // 16px
      };
    
    case 'lg':
      return {
        borderRadius: radius.lg, // 16px
        titleSize: typography.fontSize.lg, // 18px
        subtitleSize: typography.fontSize.md, // 16px
        contentSize: typography.fontSize.md, // 16px
        spacing: spacing.lg // 24px
      };
    
    default:
      return getCardSize('md');
  }
}

/**
 * 获取卡片内边距配置
 * @param padding 内边距类型
 * @returns 内边距值
 */
function getCardPadding(padding: 'none' | 'sm' | 'md' | 'lg') {
  switch (padding) {
    case 'none':
      return '0';
    case 'sm':
      return `${spacing.sm}px`; // 8px
    case 'md':
      return `${spacing.md}px`; // 16px
    case 'lg':
      return `${spacing.lg}px`; // 24px
    default:
      return `${spacing.md}px`; // 16px
  }
}

/**
 * 获取卡片变体样式
 * @param variant 卡片变体
 * @param clickable 是否可点击
 * @param hoverable 是否可悬停
 * @returns 样式配置
 */
function getCardVariant(variant: CardVariant, clickable: boolean, hoverable: boolean) {
  const baseStyles = {
    backgroundColor: colors.background.primary,
    border: '1px solid transparent',
    boxShadow: 'none'
  };

  switch (variant) {
    case 'default':
      return {
        ...baseStyles,
        backgroundColor: colors.background.primary,
        border: `1px solid ${colors.border.light}`,
        boxShadow: 'none',
        hover: {
          backgroundColor: clickable || hoverable ? colors.background.secondary : colors.background.primary,
          border: clickable || hoverable ? `1px solid ${colors.border.medium}` : `1px solid ${colors.border.light}`,
          boxShadow: 'none'
        }
      };
    
    case 'outlined':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        border: `1px solid ${colors.border.medium}`,
        boxShadow: 'none',
        hover: {
          backgroundColor: clickable || hoverable ? colors.background.secondary : 'transparent',
          border: clickable || hoverable ? `1px solid ${colors.brand.teslaBlue}` : `1px solid ${colors.border.medium}`,
          boxShadow: 'none'
        }
      };
    
    case 'elevated':
      return {
        ...baseStyles,
        backgroundColor: colors.background.primary,
        border: '1px solid transparent',
        boxShadow: shadows.sm,
        hover: {
          backgroundColor: clickable || hoverable ? colors.background.secondary : colors.background.primary,
          border: '1px solid transparent',
          boxShadow: hoverable ? shadows.md : shadows.sm
        }
      };
    
    default:
      return getCardVariant('default', clickable, hoverable);
  }
}

/**
 * Card - 卡片组件
 *
 * 全局可复用的卡片容器组件，支持多种变体、尺寸和交互状态。
 * 严格遵循设计系统规范，使用设计令牌确保一致性。
 *
 * @example
 * 基础用法：
 * ```tsx
 * <Card>
 *   <p>这是一个基础的卡片内容</p>
 * </Card>
 *
 * <Card variant="outlined">
 *   <p>这是一个轮廓卡片</p>
 * </Card>
 *
 * <Card variant="elevated">
 *   <p>这是一个阴影卡片</p>
 * </Card>
 * ```
 *
 * @example
 * 带标题的卡片：
 * ```tsx
 * <Card 
 *   title="标题文本"
 *   subtitle="副标题文本"
 *   actions={<Button>操作</Button>}
 * >
 *   <p>卡片内容</p>
 * </Card>
 * ```
 *
 * @example
 * 不同尺寸：
 * ```tsx
 * <Card size="sm">小卡片</Card>
 * <Card size="md">中卡片</Card>
 * <Card size="lg">大卡片</Card>
 * ```
 *
 * @example
 * 交互式卡片：
 * ```tsx
 * <Card 
 *   clickable 
 *   hoverable
 *   onClick={() => console.log('卡片被点击')}
 * >
 *   <p>点击我</p>
 * </Card>
 * ```
 *
 * @example
 * 自定义内边距：
 * ```tsx
 * <Card padding="none">无内边距</Card>
 * <Card padding="sm">小内边距</Card>
 * <Card padding="lg">大内边距</Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'default',
  size = 'md',
  title,
  subtitle,
  actions,
  clickable = false,
  hoverable = false,
  fullWidth = false,
  padding = 'md',
  className,
  contentClassName,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...props
}, ref) => {
  // 获取样式配置
  const sizeConfig = getCardSize(size);
  const variantConfig = getCardVariant(variant, clickable, hoverable);
  const cardPadding = getCardPadding(padding);

  // 基础样式类
  const cardClasses = cn(
    // 基础样式
    'relative',
    'transition-all',
    'duration-250',
    'ease-out',
    'box-border',
    
    // 尺寸样式
    'rounded-lg',
    
    // 交互样式
    clickable && 'cursor-pointer',
    hoverable && 'hover:shadow-md',
    
    // 全宽样式
    fullWidth && 'w-full',
    
    // 自定义类名
    className
  );

  const contentClasses = cn(
    // 内容样式
    'w-full',
    contentClassName
  );

  const headerClasses = cn(
    // 标题区域样式
    'mb-4',
    'flex',
    'flex-col',
    'gap-1'
  );

  const titleClasses = cn(
    // 标题样式
    'font-semibold',
    'text-gray-900',
    'leading-tight'
  );

  const subtitleClasses = cn(
    // 副标题样式
    'text-gray-600',
    'leading-normal'
  );

  const actionsClasses = cn(
    // 操作区域样式
    'mt-4',
    'flex',
    'gap-2',
    'justify-end'
  );

  return (
    <div
      ref={ref}
      className={cardClasses}
      onClick={clickable ? onClick : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        backgroundColor: variantConfig.backgroundColor,
        border: variantConfig.border,
        borderRadius: `${sizeConfig.borderRadius}px`,
        boxShadow: variantConfig.boxShadow,
        padding: cardPadding,
        ...(clickable && hoverable ? {
          cursor: 'pointer',
        } : {}),
        ...props.style
      }}
      {...(clickable ? { role: 'button', tabIndex: 0 } : {})}
      {...props}
    >
      {/* 卡片头部 */}
      {(title || subtitle) && (
        <div 
          className={headerClasses}
          style={{ marginBottom: `${sizeConfig.spacing}px` }}
        >
          {/* 标题 */}
          {title && (
            <div 
              className={titleClasses}
              style={{ fontSize: `${sizeConfig.titleSize}px` }}
            >
              {title}
            </div>
          )}
          
          {/* 副标题 */}
          {subtitle && (
            <div 
              className={subtitleClasses}
              style={{ fontSize: `${sizeConfig.subtitleSize}px` }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
      
      {/* 卡片内容 */}
      <div 
        className={contentClasses}
        style={{ fontSize: `${sizeConfig.contentSize}px` }}
      >
        {children}
      </div>
      
      {/* 卡片操作区域 */}
      {actions && (
        <div 
          className={actionsClasses}
          style={{ marginTop: `${sizeConfig.spacing}px` }}
        >
          {actions}
        </div>
      )}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;