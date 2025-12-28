/**
 * 季度占比规划图 - 主组件
 *
 * @component QuarterlyProportionChart
 * @description 可复用的季度占比规划图表组件，支持多种视图模式和交互功能
 *
 * @features
 * - 3种视图模式：占比视图、绝对值视图、增长率聚焦
 * - 智能预警系统：优秀/正常/预警/危险 四级预警
 * - 交互式详情面板：点击柱状图查看详细数据
 * - 现代化视觉设计：渐变配色、阴影效果、平滑动画
 * - 性能优化：使用 useMemo 和 useCallback 优化渲染
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import type {
  QuarterlyProportionChartProps,
  ViewMode,
  QuarterIndex,
  QuarterDetailData,
  ChartInteractionState,
} from './QuarterlyProportionChart.types';
import { useChartData } from './hooks/useChartData';
import { useChartConfig } from './hooks/useChartConfig';

// 动态导入 ECharts 组件（SSR 禁用）
const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-sm text-gray-500">加载图表...</div>
    </div>
  ),
});

/**
 * 季度占比规划图主组件
 *
 * @param props - 组件属性
 * @returns React 组件
 *
 * @example
 * ```tsx
 * <QuarterlyProportionChart
 *   data={{
 *     quarterlyTargets: [1000, 1200, 1100, 1300],
 *     quarterlyActuals2025: [900, 1100, 1000, 1200],
 *     quarterlyCurrent: [950, 1150, 1050, 1250],
 *     totalTarget: 4600,
 *     totalActual2025: 4200,
 *     growthSeries: [0.0556, 0.0455, 0.05, 0.0417],
 *   }}
 *   config={{
 *     height: 400,
 *     showDetailPanel: true,
 *     defaultViewMode: 'proportion',
 *   }}
 *   onQuarterClick={(quarter, detail) => {
 *     console.log('Selected quarter:', quarter, detail);
 *   }}
 * />
 * ```
 */
export function QuarterlyProportionChart({
  data,
  config,
  onQuarterClick,
  onViewModeChange,
  className,
}: QuarterlyProportionChartProps) {
  // 处理数据
  const { processedData, isValid, error } = useChartData(data);

  // 交互状态
  const {
    height = 400,
    showDetailPanel: showDetailPanelConfig = true,
    defaultViewMode = 'proportion',
    animation = true,
  } = config || {};

  const [interactionState, setInteractionState] = useState<ChartInteractionState>({
    selectedQuarter: null,
    viewMode: defaultViewMode,
    showDetailPanel: showDetailPanelConfig,
  });

  // 视图模式切换
  const handleViewModeChange = useCallback(
    (newViewMode: ViewMode) => {
      setInteractionState((prev) => ({
        ...prev,
        viewMode: newViewMode,
      }));
      onViewModeChange?.(newViewMode);
    },
    [onViewModeChange]
  );

  // 季度点击处理
  const handleQuarterClick = useCallback(
    (quarter: QuarterIndex) => {
      const newSelectedQuarter =
        interactionState.selectedQuarter === quarter ? null : quarter;

      setInteractionState((prev) => ({
        ...prev,
        selectedQuarter: newSelectedQuarter,
        showDetailPanel: newSelectedQuarter !== null || showDetailPanelConfig,
      }));

      if (newSelectedQuarter !== null) {
        const detail = processedData.quarterDetails[newSelectedQuarter];
        onQuarterClick?.(newSelectedQuarter, detail);
      }
    },
    [interactionState.selectedQuarter, showDetailPanelConfig, processedData, onQuarterClick]
  );

  // 图表配置
  const chartOption = useChartConfig(
    processedData,
    interactionState.viewMode,
    config
  );

  // 图表点击事件处理
  const onChartClick = useCallback(
    (params: any) => {
      if (params.componentType === 'series' && params.seriesType === 'bar') {
        const quarter = params.dataIndex as QuarterIndex;
        handleQuarterClick(quarter);
      }
    },
    [handleQuarterClick]
  );

  // 视图模式按钮配置
  const viewModes: Array<{ value: ViewMode; label: string; icon: string }> = useMemo(
    () => [
      { value: 'proportion', label: '占比视图', icon: '📊' },
      { value: 'absolute', label: '绝对值', icon: '📈' },
      { value: 'table', label: '表格', icon: '📋' },
    ],
    []
  );

  const selectedDetail = useMemo(() => {
    if (!isValid) return null;
    if (interactionState.selectedQuarter === null) return null;
    return processedData.quarterDetails[interactionState.selectedQuarter];
  }, [interactionState.selectedQuarter, isValid, processedData]);

  // 如果数据无效，显示错误信息
  if (!isValid) {
    return (
      <div
        className={cn(
          'rounded-xl border p-6 flex flex-col items-center justify-center',
          'bg-red-50 border-red-200',
          className
        )}
        style={{ minHeight: height }}
      >
        <div className="text-red-600 font-medium mb-2">数据错误</div>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <section
      className={cn('rounded-xl border bg-white', className)}
      style={{ minHeight: height + 100 }}
    >
      {/* 头部：标题、图例、视图切换 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">季度占比规划图</h3>

          {/* 视图模式切换按钮 */}
          <div className="flex items-center gap-2">
            {viewModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => handleViewModeChange(mode.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                  'flex items-center gap-1.5',
                  interactionState.viewMode === mode.value
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                )}
              >
                <span>{mode.icon}</span>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 图例说明 */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded-sm bg-gradient-to-b from-[#dceef9] to-[#b0d8ef]" />
            <span>2026规划</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded-sm bg-[#f2f2f2]" />
            <span>2025实际</span>
          </div>
          {interactionState.viewMode !== 'absolute' && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-0.5 bg-[#0070c0]" />
                <span>增长率</span>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-green-600 font-medium">↗ 优秀 ≥15%</span>
                <span className="text-gray-600 font-medium">→ 正常 5-15%</span>
                <span className="text-orange-600 font-medium">↘ 预警 &lt;5%</span>
                <span className="text-red-600 font-medium">⚠ 危险 &lt;0%</span>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-8 h-0.5 bg-orange-500 border-dashed border-b-2 border-orange-500" />
                <span className="text-orange-600 font-medium">预警线 5%</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 图表区域 */}
      <div className="p-4">
        <ReactECharts
          option={chartOption}
          style={{ height }}
          opts={{ renderer: 'canvas' }}
          onEvents={{ click: onChartClick }}
        />
      </div>

      {/* 季度详情面板 */}
      {interactionState.showDetailPanel && selectedDetail && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">
                {selectedDetail.quarterLabel}详细数据
              </h4>
              <button
                onClick={() => handleQuarterClick(selectedDetail.quarter)}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕ 关闭
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {/* 2026目标 */}
              <div>
                <div className="text-gray-500 mb-1">2026目标</div>
                <div className="text-lg font-semibold text-blue-700">
                  {selectedDetail.target.toLocaleString('zh-CN')}
                </div>
                <div className="text-gray-500">
                  占比 {(selectedDetail.targetShare * 100).toFixed(1)}%
                </div>
              </div>

              {/* 2025实际 */}
              <div>
                <div className="text-gray-500 mb-1">2025实际</div>
                <div className="text-lg font-semibold text-gray-700">
                  {selectedDetail.actual2025?.toLocaleString('zh-CN') ?? '—'}
                </div>
                <div className="text-gray-500">
                  占比{' '}
                  {selectedDetail.actualShare2025
                    ? `${(selectedDetail.actualShare2025 * 100).toFixed(1)}%`
                    : '—'}
                </div>
              </div>

              {/* 增长率 */}
              <div>
                <div className="text-gray-500 mb-1">增长率</div>
                <div
                  className={cn(
                    'text-lg font-semibold',
                    selectedDetail.growth !== null && selectedDetail.growth >= 0.15
                      ? 'text-green-600'
                      : selectedDetail.growth !== null && selectedDetail.growth >= 0.05
                      ? 'text-gray-700'
                      : selectedDetail.growth !== null && selectedDetail.growth >= 0
                      ? 'text-orange-600'
                      : 'text-red-600'
                  )}
                >
                  {selectedDetail.growth !== null
                    ? `${(selectedDetail.growth * 100).toFixed(2)}%`
                    : '—'}
                </div>
                <div
                  className={cn(
                    'text-xs font-medium',
                    selectedDetail.warningLevel === 'excellent'
                      ? 'text-green-600'
                      : selectedDetail.warningLevel === 'normal'
                      ? 'text-gray-600'
                      : selectedDetail.warningLevel === 'warning'
                      ? 'text-orange-600'
                      : 'text-red-600'
                  )}
                >
                  {selectedDetail.warningLevel === 'excellent' && '✓ 优秀'}
                  {selectedDetail.warningLevel === 'normal' && '• 正常'}
                  {selectedDetail.warningLevel === 'warning' && '⚠ 预警'}
                  {selectedDetail.warningLevel === 'danger' && '✕ 危险'}
                </div>
              </div>

              {/* 当前实际 */}
              <div>
                <div className="text-gray-500 mb-1">当前实际</div>
                <div className="text-lg font-semibold text-gray-700">
                  {selectedDetail.current?.toLocaleString('zh-CN') ?? '—'}
                </div>
                <div className="text-gray-500">
                  {selectedDetail.current !== null && selectedDetail.target !== 0
                    ? `达成率 ${((selectedDetail.current / selectedDetail.target) * 100).toFixed(1)}%`
                    : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default QuarterlyProportionChart;
