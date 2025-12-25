/**
 * 视图模式切换器组件
 *
 * @component ViewSwitcher
 * @description 切换图表的视图模式（占比/绝对值/增长率）
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { ViewMode } from '../QuarterlyProportionChart.types';

/**
 * 视图模式配置
 */
interface ViewModeConfig {
  value: ViewMode;
  label: string;
  icon: string;
  description: string;
}

const VIEW_MODES: ViewModeConfig[] = [
  {
    value: 'proportion',
    label: '占比视图',
    icon: '📊',
    description: '显示百分比占比',
  },
  {
    value: 'absolute',
    label: '绝对值',
    icon: '📈',
    description: '显示实际数值',
  },
  {
    value: 'table',
    label: '表格',
    icon: '📋',
    description: '以表格形式展示详细数据',
  },
];

/**
 * 视图切换器属性
 */
export interface ViewSwitcherProps {
  /** 当前视图模式 */
  currentMode: ViewMode;
  /** 视图模式变化回调 */
  onChange: (mode: ViewMode) => void;
  /** 额外的CSS类名 */
  className?: string;
  /** 显示样式，默认 'buttons' */
  variant?: 'buttons' | 'tabs' | 'segment';
  /** 尺寸，默认 'md' */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 按钮样式视图切换器
 */
function ButtonViewSwitcher({
  currentMode,
  onChange,
  className,
  size = 'md',
}: ViewSwitcherProps) {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-xs gap-1.5',
    lg: 'px-4 py-2 text-sm gap-2',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {VIEW_MODES.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={cn(
            'font-medium rounded-lg transition-all flex items-center border',
            sizeClasses[size],
            currentMode === mode.value
              ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
          )}
          title={mode.description}
        >
          <span>{mode.icon}</span>
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * 标签页样式视图切换器
 */
function TabViewSwitcher({
  currentMode,
  onChange,
  className,
}: ViewSwitcherProps) {
  return (
    <div className={cn('flex items-center bg-gray-100 rounded-lg p-1 gap-1', className)}>
      {VIEW_MODES.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
            currentMode === mode.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
          title={mode.description}
        >
          <span>{mode.icon}</span>
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * 分段控制器样式视图切换器
 */
function SegmentViewSwitcher({
  currentMode,
  onChange,
  className,
}: ViewSwitcherProps) {
  return (
    <div className={cn('inline-flex bg-white rounded-lg border border-gray-200 p-0.5', className)}>
      {VIEW_MODES.map((mode, index) => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={cn(
            'relative px-3 py-1.5 text-xs font-medium transition-all rounded',
            'flex items-center gap-1.5 min-w-[80px] justify-center',
            currentMode === mode.value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
            index === 0 && 'rounded-l-md',
            index === VIEW_MODES.length - 1 && 'rounded-r-md'
          )}
          title={mode.description}
        >
          <span>{mode.icon}</span>
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * 视图模式切换器组件
 *
 * @param props - 组件属性
 * @returns React 组件
 *
 * @example
 * ```tsx
 * <ViewSwitcher
 *   currentMode="proportion"
 *   onChange={(mode) => console.log(mode)}
 *   variant="buttons"
 * />
 *
 * <ViewSwitcher
 *   currentMode="growth"
 *   onChange={handleModeChange}
 *   variant="tabs"
 * />
 * ```
 */
export function ViewSwitcher({
  currentMode,
  onChange,
  className,
  variant = 'buttons',
  size,
}: ViewSwitcherProps) {
  switch (variant) {
    case 'tabs':
      return (
        <TabViewSwitcher
          currentMode={currentMode}
          onChange={onChange}
          className={className}
        />
      );
    case 'segment':
      return (
        <SegmentViewSwitcher
          currentMode={currentMode}
          onChange={onChange}
          className={className}
        />
      );
    case 'buttons':
    default:
      return (
        <ButtonViewSwitcher
          currentMode={currentMode}
          onChange={onChange}
          className={className}
          size={size}
        />
      );
  }
}

/**
 * 视图模式选择器（用于测试）
 */
export function ViewSwitcherSelector() {
  const [mode, setMode] = React.useState<ViewMode>('proportion');

  return (
    <div className="space-y-4 p-4">
      <div>
        <div className="text-sm text-gray-600 mb-2">Buttons 样式:</div>
        <ViewSwitcher currentMode={mode} onChange={setMode} variant="buttons" />
      </div>

      <div>
        <div className="text-sm text-gray-600 mb-2">Tabs 样式:</div>
        <ViewSwitcher currentMode={mode} onChange={setMode} variant="tabs" />
      </div>

      <div>
        <div className="text-sm text-gray-600 mb-2">Segment 样式:</div>
        <ViewSwitcher currentMode={mode} onChange={setMode} variant="segment" />
      </div>

      <div className="text-sm text-gray-600 mt-4">
        当前模式: <span className="font-medium text-blue-600">{mode}</span>
      </div>
    </div>
  );
}

export default ViewSwitcher;
