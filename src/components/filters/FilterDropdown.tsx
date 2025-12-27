'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { colors } from '@/styles/tokens';
import { Button } from '@/components/ui/Button/Button';
import type { DimensionType } from './FilterTag';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDropdownProps {
  /** 筛选器标签 */
  label: string;

  /** 维度类型（决定颜色） */
  dimension: DimensionType;

  /** 可选项列表 */
  options: FilterOption[];

  /** 当前选中的值（受控） */
  value: string[];

  /** 值变更回调 */
  onChange: (value: string[]) => void;

  /** 是否支持搜索 */
  searchable?: boolean;

  /** 自定义类名 */
  className?: string;

  /** 占位符文本 */
  placeholder?: string;
}

/**
 * FilterDropdown - 电商式筛选器组件
 *
 * 类似淘宝/京东的商品筛选体验：
 * - 下拉面板设计（非弹窗）
 * - 支持搜索 + 批量勾选
 * - 草稿模式（Draft → Applied）
 * - 底部操作按钮
 *
 * @example
 * ```tsx
 * const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
 *
 * <FilterDropdown
 *   label="三级机构"
 *   dimension="org"
 *   options={orgOptions}
 *   value={selectedOrgs}
 *   onChange={setSelectedOrgs}
 *   searchable
 * />
 * ```
 */
export function FilterDropdown({
  label,
  dimension,
  options,
  value,
  onChange,
  searchable = true,
  className,
  placeholder = '请选择',
}: FilterDropdownProps) {
  // 下拉面板打开/关闭状态
  const [isOpen, setIsOpen] = useState(false);

  // 草稿选择（临时状态，未应用）
  const [draftValue, setDraftValue] = useState<string[]>(value);

  // 搜索关键词
  const [searchTerm, setSearchTerm] = useState('');

  // 容器引用（用于点击外部关闭）
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取维度颜色
  const dimensionColor = colors.dimension[dimension];

  // 同步外部value到草稿
  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 过滤选项（根据搜索词）
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // 切换勾选
  const toggleSelection = (optionValue: string) => {
    setDraftValue((prev) =>
      prev.includes(optionValue)
        ? prev.filter((v) => v !== optionValue)
        : [...prev, optionValue]
    );
  };

  // 全选
  const selectAll = () => {
    setDraftValue(filteredOptions.map((opt) => opt.value));
  };

  // 清空草稿
  const clearDraft = () => {
    setDraftValue([]);
  };

  // 应用筛选
  const applyFilter = () => {
    onChange(draftValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  // 取消（关闭并重置草稿）
  const cancel = () => {
    setDraftValue(value);
    setIsOpen(false);
    setSearchTerm('');
  };

  // 显示文本
  const displayText = useMemo(() => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) {
      const option = options.find((opt) => opt.value === value[0]);
      return option?.label || value[0];
    }
    return `已选 ${value.length} 项`;
  }, [value, options, placeholder]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-2',
          'px-3 py-2',
          'border-2 rounded-lg',
          'bg-white',
          'text-sm font-medium',
          'transition-all duration-150',
          'hover:shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-offset-1',

          // 有选中项时显示维度颜色边框
          value.length > 0 ? 'border-current' : 'border-gray-300'
        )}
        style={{
          color: value.length > 0 ? dimensionColor : colors.text.secondary,
        }}
      >
        <span className="truncate">
          {label}: {displayText}
        </span>

        {/* 下拉箭头 */}
        <svg
          className={cn('w-4 h-4 transition-transform duration-150', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉面板 */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 mt-2 z-50',
            'bg-white border border-gray-200 rounded-lg shadow-lg',
            'overflow-hidden',
            'animate-in slide-in-from-top-2 duration-150'
          )}
        >
          {/* 搜索框 */}
          {searchable && (
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索..."
                className={cn(
                  'w-full px-3 py-2',
                  'border border-gray-300 rounded-md',
                  'text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-tesla/20 focus:border-transparent'
                )}
              />
            </div>
          )}

          {/* 选项列表 */}
          <div className="max-h-60 overflow-y-auto p-2">
            {filteredOptions.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">暂无匹配项</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = draftValue.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2',
                      'rounded-md cursor-pointer',
                      'transition-colors duration-150',
                      'hover:bg-gray-50',
                      isSelected && 'bg-blue-50'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(option.value)}
                      className="w-4 h-4 rounded border-gray-300"
                      style={{ accentColor: dimensionColor }}
                    />
                    <span className="text-sm select-none">{option.label}</span>
                  </label>
                );
              })
            )}
          </div>

          {/* 底部操作按钮 */}
          <div className="flex items-center justify-between gap-2 p-3 border-t border-gray-200 bg-gray-50">
            {/* 左侧：全选/清空 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-blue-600 hover:underline"
              >
                全选
              </button>
              <span className="text-xs text-gray-300">|</span>
              <button
                type="button"
                onClick={clearDraft}
                className="text-xs text-gray-600 hover:underline"
              >
                清空
              </button>
            </div>

            {/* 右侧：取消/应用筛选 */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={cancel}>
                取消
              </Button>
              <Button size="sm" onClick={applyFilter}>
                应用筛选 ({draftValue.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
