import React, { useState, useId, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';

/**
 * 输入框类型
 */
export type InputType = 'text' | 'password' | 'email' | 'number';

/**
 * 输入框尺寸
 */
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * 输入框变体
 */
export type InputVariant = 'default' | 'filled';

/**
 * 输入框组件属性
 */
export interface InputProps {
  /** 输入框值 */
  value?: string | number;
  
  /** 默认值 */
  defaultValue?: string | number;
  
  /** 输入框类型 */
  type?: InputType;
  
  /** 输入框尺寸 */
  size?: InputSize;
  
  /** 输入框变体 */
  variant?: InputVariant;
  
  /** 占位符文本 */
  placeholder?: string;
  
  /** 是否禁用 */
  disabled?: boolean;
  
  /** 是否只读 */
  readonly?: boolean;
  
  /** 是否必填 */
  required?: boolean;
  
  /** 错误状态信息 */
  error?: string;
  
  /** 帮助文本 */
  helpText?: string;
  
  /** 最大长度 */
  maxLength?: number;
  
  /** 最小长度 */
  minLength?: number;
  
  /** 数字输入时的最小值 */
  min?: number;
  
  /** 数字输入时的最大值 */
  max?: number;
  
  /** 数字输入时的步长 */
  step?: number;
  
  /** 自动完成 */
  autoComplete?: string;
  
  /** 输入模式 */
  inputMode?: 'text' | 'numeric' | 'email' | 'tel' | 'url' | 'search';
  
  /** 左侧图标 */
  leftIcon?: React.ReactNode;
  
  /** 右侧图标 */
  rightIcon?: React.ReactNode;
  
  /** 标签文本 */
  label?: string;
  
  /** 是否显示清除按钮 */
  clearable?: boolean;
  
  /** 自定义类名 */
  className?: string;
  
  /** 容器自定义类名 */
  containerClassName?: string;
  
  /** 值变化回调 */
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  
  /** 获得焦点回调 */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  
  /** 失去焦点回调 */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  
  /** 按键按下回调 */
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  
  /** 清除按钮点击回调 */
  onClear?: () => void;
  
  /** HTML属性 */
  [key: string]: any;
}

/**
 * 获取输入框尺寸配置
 * @param size 输入框尺寸
 * @returns 尺寸配置
 */
function getInputSize(size: InputSize) {
  switch (size) {
    case 'sm':
      return {
        height: '32px',
        padding: '6px 12px', // 考虑图标空间
        fontSize: typography.fontSize.sm, // 12px
        borderRadius: radius.sm, // 8px
        iconSize: 16
      };
    
    case 'md':
      return {
        height: '40px',
        padding: '9px 16px',
        fontSize: typography.fontSize.base, // 14px
        borderRadius: radius.sm, // 8px
        iconSize: 18
      };
    
    case 'lg':
      return {
        height: '48px',
        padding: '12px 20px',
        fontSize: typography.fontSize.md, // 16px
        borderRadius: radius.md, // 12px
        iconSize: 20
      };
    
    default:
      return getInputSize('md');
  }
}

/**
 * 获取输入框颜色配置
 * @param disabled 是否禁用
 * @param error 是否错误状态
 * @returns 颜色配置
 */
function getInputColors(disabled: boolean, error: boolean) {
  if (disabled) {
    return {
      bg: colors.background.tertiary,
      border: colors.border.light,
      text: colors.text.muted,
      placeholder: colors.text.muted,
      label: colors.text.muted,
      focus: {
        border: colors.border.light,
        ring: 'transparent'
      }
    };
  }

  if (error) {
    return {
      bg: colors.background.primary,
      border: colors.status.danger,
      text: colors.text.primary,
      placeholder: colors.text.muted,
      label: colors.status.danger,
      focus: {
        border: colors.status.danger,
        ring: colors.status.danger
      }
    };
  }

  return {
    bg: colors.background.primary,
    border: colors.border.medium,
    text: colors.text.primary,
    placeholder: colors.text.muted,
    label: colors.text.primary,
    focus: {
      border: colors.brand.teslaBlue,
      ring: colors.interaction.focus
    }
  };
}

/**
 * 格式化输入值
 * @param value 输入值
 * @param type 输入类型
 * @returns 格式化后的值
 */
function formatInputValue(value: string, type: InputType): string {
  if (type === 'number') {
    // 移除非数字字符（除了小数点和负号）
    return value.replace(/[^0-9.-]/g, '');
  }
  
  if (type === 'email') {
    // 邮箱格式转换为小写
    return value.toLowerCase();
  }
  
  return value;
}

/**
 * Input - 输入框组件
 *
 * 全局可复用的输入框组件，支持多种类型、尺寸和状态。
 * 严格遵循设计系统规范，使用设计令牌确保一致性。
 *
 * @example
 * 基础用法：
 * ```tsx
 * <Input placeholder="请输入用户名" />
 * <Input type="password" placeholder="请输入密码" />
 * <Input type="email" placeholder="请输入邮箱" />
 * <Input type="number" placeholder="请输入数字" />
 * ```
 *
 * @example
 * 不同尺寸：
 * ```tsx
 * <Input size="sm" placeholder="小号输入框" />
 * <Input size="md" placeholder="中号输入框" />
 * <Input size="lg" placeholder="大号输入框" />
 * ```
 *
 * @example
 * 带标签和验证：
 * ```tsx
 * <Input
 *   label="用户名"
 *   placeholder="请输入用户名"
 *   error="用户名不能为空"
 *   required
 * />
 * ```
 *
 * @example
 * 带图标：
 * ```tsx
 * <Input
 *   leftIcon={<SearchIcon />}
 *   placeholder="搜索..."
 *   rightIcon={<ClearIcon />}
 *   clearable
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  value: controlledValue,
  defaultValue,
  type = 'text',
  size = 'md',
  variant = 'default',
  placeholder,
  disabled = false,
  readonly = false,
  required = false,
  error,
  helpText,
  maxLength,
  minLength,
  min,
  max,
  step,
  autoComplete,
  inputMode,
  leftIcon,
  rightIcon,
  label,
  clearable = false,
  className,
  containerClassName,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onClear,
  ...props
}, ref) => {
  // 生成唯一ID用于label关联
  const inputId = useId();
  const [internalValue, setInternalValue] = useState<string>(
    typeof defaultValue === 'number' ? String(defaultValue) : (defaultValue || '')
  );

  // 判断是否为受控组件
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? String(controlledValue || '') : internalValue;

  // 获取样式配置
  const sizeConfig = getInputSize(size);
  const colors = getInputColors(disabled, !!error);

  // 处理值变化
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    // 格式化输入值
    const formattedValue = formatInputValue(newValue, type);
    
    // 更新内部状态
    if (!isControlled) {
      setInternalValue(formattedValue);
    }
    
    // 触发回调
    onChange?.(formattedValue, event);
  };

  // 处理清除
  const handleClear = () => {
    const clearEvent = {
      target: { value: '' }
    } as React.ChangeEvent<HTMLInputElement>;
    
    if (!isControlled) {
      setInternalValue('');
    }
    
    onChange?.('', clearEvent);
    onClear?.();
  };

  // 是否显示清除按钮
  const showClearButton = clearable && currentValue && !disabled && !readonly;

  // 基础样式类
  const containerClasses = cn(
    'relative',
    'w-full',
    containerClassName
  );

  const inputClasses = cn(
    // 基础样式
    'w-full',
    'border',
    'transition-all',
    'duration-250',
    'ease-out',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-0',
    
    // 尺寸样式
    'box-border',
    
    // 状态样式
    disabled && 'cursor-not-allowed opacity-60',
    readonly && 'cursor-default',
    
    // 自定义类名
    className
  );

  const labelClasses = cn(
    'block',
    'text-sm',
    'font-medium',
    'mb-2',
    'transition-colors',
    'duration-200'
  );

  const helpTextClasses = cn(
    'text-xs',
    'mt-2',
    'transition-colors',
    'duration-200'
  );

  const clearButtonClasses = cn(
    'absolute',
    'right-2',
    'top-1/2',
    'transform',
    '-translate-y-1/2',
    'p-1',
    'rounded-full',
    'hover:bg-gray-100',
    'transition-colors',
    'duration-150'
  );

  return (
    <div className={containerClasses}>
      {/* 标签 */}
      {label && (
        <label 
          htmlFor={inputId}
          className={labelClasses}
          style={{ color: colors.label }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* 输入框容器 */}
      <div className="relative">
        {/* 左侧图标 */}
        {leftIcon && (
          <div 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center"
            style={{ 
              color: colors.placeholder,
              width: `${sizeConfig.iconSize}px`,
              height: `${sizeConfig.iconSize}px`
            }}
          >
            {leftIcon}
          </div>
        )}
        
        {/* 输入框 */}
        <input
          ref={ref}
          id={inputId}
          type={type}
          value={currentValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readonly}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={inputClasses}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          style={{
            height: sizeConfig.height,
            padding: leftIcon ? 
              `6px ${sizeConfig.iconSize + 12}px 6px 16px` : 
              sizeConfig.padding,
            fontSize: `${sizeConfig.fontSize}px`,
            borderRadius: `${sizeConfig.borderRadius}px`,
            backgroundColor: colors.bg,
            borderColor: colors.border,
            color: colors.text,
            paddingLeft: leftIcon ? `${sizeConfig.iconSize + 16}px` : undefined,
            paddingRight: (rightIcon || showClearButton) ? `${sizeConfig.iconSize + 16}px` : undefined
          }}
          {...props}
        />
        
        {/* 右侧图标 */}
        {rightIcon && !showClearButton && (
          <div 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center"
            style={{ 
              color: colors.placeholder,
              width: `${sizeConfig.iconSize}px`,
              height: `${sizeConfig.iconSize}px`
            }}
          >
            {rightIcon}
          </div>
        )}
        
        {/* 清除按钮 */}
        {showClearButton && (
          <button
            type="button"
            className={clearButtonClasses}
            onClick={handleClear}
            tabIndex={-1}
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="currentColor"
              className="text-gray-400 hover:text-gray-600"
            >
              <path d="M6 4.5L1.5 9m0 0L6 13.5M1.5 9h9" />
            </svg>
          </button>
        )}
      </div>
      
      {/* 错误信息 */}
      {error && (
        <div 
          className={helpTextClasses}
          style={{ color: colors.status.danger }}
        >
          {error}
        </div>
      )}
      
      {/* 帮助文本 */}
      {helpText && !error && (
        <div 
          className={helpTextClasses}
          style={{ color: colors.text.muted }}
        >
          {helpText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;