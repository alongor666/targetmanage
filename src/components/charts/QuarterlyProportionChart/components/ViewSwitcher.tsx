/**
 * 视图模式切换器组件
 *
 * @component ViewSwitcher
 * @description 切换图表的视图模式（占比/绝对值/增长率）
 *
 * 统一设计规范：
 * - 选中：蓝色字 + 蓝色边框，无背景
 * - 未选中：灰色字 + 灰色边框，无背景
 */

import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@/components/v2';
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
 * 按钮样式视图切换器（使用统一的 ToggleButtonGroup）
 */
function ButtonViewSwitcher({
  currentMode,
  onChange,
  className,
  size = 'md',
}: ViewSwitcherProps) {
  return (
    <ToggleButtonGroup
      value={currentMode}
      options={VIEW_MODES.map(mode => ({
        value: mode.value,
        label: mode.label,
        icon: mode.icon,
      }))}
      onChange={onChange}
      size={size}
      className={className}
    />
  );
}

/**
 * 标签页样式视图切换器（统一样式，移除背景色）
 */
function TabViewSwitcher({
  currentMode,
  onChange,
  className,
}: ViewSwitcherProps) {
  return (
    <ToggleButtonGroup
      value={currentMode}
      options={VIEW_MODES.map(mode => ({
        value: mode.value,
        label: mode.label,
        icon: mode.icon,
      }))}
      onChange={onChange}
      className={className}
    />
  );
}

/**
 * 分段控制器样式视图切换器（统一样式，移除背景色）
 */
function SegmentViewSwitcher({
  currentMode,
  onChange,
  className,
}: ViewSwitcherProps) {
  return (
    <ToggleButtonGroup
      value={currentMode}
      options={VIEW_MODES.map(mode => ({
        value: mode.value,
        label: mode.label,
        icon: mode.icon,
      }))}
      onChange={onChange}
      className={className}
    />
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
