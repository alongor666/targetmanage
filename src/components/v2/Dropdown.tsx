/**
 * Dropdown组件 V2 - 基于UI重构设计方案
 *
 * 规范来源：UI重构设计方案.md - 4.2 筛选控制区 - 下拉框
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { colorsV2, filterV2, dropdownStatesV2, animationsV2 } from '@/styles/design-tokens-v2';

export interface DropdownOption {
  /** 选项值 */
  value: string;

  /** 选项显示标签 */
  label: string;

  /** 是否禁用 */
  disabled?: boolean;
}

export interface DropdownProps {
  /** 当前选中的值 */
  value: string;

  /** 选项列表 */
  options: DropdownOption[];

  /** 值变化回调 */
  onChange: (value: string) => void;

  /** 占位符文本 */
  placeholder?: string;

  /** 是否禁用 */
  disabled?: boolean;

  /** 自定义类名 */
  className?: string;
}

/**
 * Dropdown组件 - 符合设计系统的下拉选择器
 *
 * 规范：
 * - 背景：#F8FAFC
 * - 边框：1px solid #E9ECEF
 * - 圆角：4px
 * - 高度：36px
 * - 文字：14px, #6C757D
 * - 下拉箭头：12px
 * - 聚焦：边框 #007BFF，阴影增强
 *
 * @example
 * <Dropdown
 *   value={selectedValue}
 *   options={[
 *     { value: 'option1', label: '选项1' },
 *     { value: 'option2', label: '选项2' },
 *   ]}
 *   onChange={(value) => setSelectedValue(value)}
 * />
 */
export function Dropdown({
  value,
  options,
  onChange,
  placeholder = '请选择',
  disabled = false,
  className,
}: DropdownProps) {
  const selectedOption = options.find(opt => opt.value === value);
  const hasSelection = Boolean(value && selectedOption);

  return (
    <div className="relative inline-block w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          height: `${filterV2.dropdown.height}px`,
          fontSize: `${filterV2.dropdown.fontSize}px`,
          borderRadius: `${filterV2.dropdown.borderRadius}px`,
          backgroundColor: filterV2.dropdown.background,
          border: filterV2.dropdown.border,
          color: hasSelection ? colorsV2.primary.blue : filterV2.dropdown.color,
          fontWeight: hasSelection ? 600 : 400,
          transition: `all ${animationsV2.interaction.dropdownExpand.duration}ms ${animationsV2.interaction.dropdownExpand.easing}`,
        }}
        className={cn(
          // 基础样式
          'w-full appearance-none',
          'px-3 pr-8',
          'focus:outline-none',
          'cursor-pointer',

          // 聚焦状态
          !disabled && 'focus:border-[#007BFF]',
          !disabled && 'focus:shadow-[0_0_0_2px_rgba(0,123,255,0.08)]',

          // 悬停状态
          !disabled && 'hover:border-[#007BFF]',

          // 禁用状态
          disabled && 'cursor-not-allowed opacity-50',

          // 自定义类名
          className
        )}
      >
        {placeholder && !value && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* 下拉箭头图标 */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg
          className="text-gray-400"
          style={{
            width: `${filterV2.dropdown.arrowSize}px`,
            height: `${filterV2.dropdown.arrowSize}px`,
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
