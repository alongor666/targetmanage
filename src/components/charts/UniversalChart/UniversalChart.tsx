/**
 * 通用图表组件
 *
 * @component UniversalChart
 * @description 高度参数化的通用图表组件，支持月度/季度、绝对值/占比/达成率等多种场景
 * @doc docs/fangan.md
 */

'use client';

import React, { useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import type { UniversalChartProps, PeriodIndex, ViewMode } from './UniversalChart.types';
import { useUniversalData } from './hooks/useUniversalData';
import { useChartInteractions } from './hooks/useChartInteractions';
import { useUniversalConfig } from './hooks/useUniversalConfig';
import { getPresetConfig, mergeConfig } from './configs';

// 复用QuarterlyProportionChart的子组件
import { ChartHeader } from '../QuarterlyProportionChart/components/ChartHeader';
import { DetailPanel } from '../QuarterlyProportionChart/components/DetailPanel';
import type { ViewMode as QViewMode, QuarterDetailData } from '../QuarterlyProportionChart/QuarterlyProportionChart.types';

/**
 * 将UniversalChart的ViewMode映射到QuarterlyProportionChart的ViewMode
 */
function mapToQuarterlyViewMode(mode: ViewMode): QViewMode {
  // achievement模式映射到absolute模式
  if (mode === 'achievement') return 'absolute';
  return mode as QViewMode;
}

/**
 * UniversalChart 组件
 *
 * @example
 * ```tsx
 * <UniversalChart
 *   chartType="monthlyPremium"
 *   data={{
 *     timeGranularity: 'monthly',
 *     valueType: 'absolute',
 *     targets: [...],
 *     baseline2025: [...],
 *     current: [...],
 *     totalTarget: 100000,
 *     totalBaseline2025: 95000,
 *   }}
 *   config={{ height: 400 }}
 * />
 * ```
 */
export function UniversalChart({
  chartType,
  data,
  config: customConfig,
  onPeriodClick,
  onViewModeChange,
  className = '',
}: UniversalChartProps) {
  // 合并预设配置和自定义配置
  const presetConfig = chartType ? getPresetConfig(chartType) : {};
  const config = mergeConfig(presetConfig, customConfig);

  // 数据处理
  const { processedData, isValid } = useUniversalData(data);

  // 交互状态管理
  const { state, setViewMode, selectPeriod, closePeriod } = useChartInteractions(config);

  // 生成ECharts配置
  const chartOption = useUniversalConfig(
    processedData,
    state.viewMode,
    data.timeGranularity,
    data.valueType,
    config
  );

  // 处理视图模式切换
  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      onViewModeChange?.(mode);
    },
    [setViewMode, onViewModeChange]
  );

  // 处理柱状图点击
  const handleChartClick = useCallback(
    (params: any) => {
      if (params.componentType === 'series' && params.seriesType === 'bar') {
        const index = params.dataIndex as PeriodIndex;
        selectPeriod(index);

        const detail = processedData.periodDetails[index];
        if (detail && onPeriodClick) {
          onPeriodClick(index, detail);
        }
      }
    },
    [selectPeriod, processedData.periodDetails, onPeriodClick]
  );

  // 处理详情面板关闭
  const handleCloseDetail = useCallback(() => {
    closePeriod();
  }, [closePeriod]);

  // 获取当前选中的周期详情
  const selectedDetail =
    state.selectedPeriod !== null
      ? processedData.periodDetails[state.selectedPeriod]
      : null;

  // 映射到Quarterly ViewMode
  const quarterlyViewMode = mapToQuarterlyViewMode(state.viewMode);

  // 将PeriodDetailData转换为QuarterDetailData
  const quarterDetailData: QuarterDetailData | null = selectedDetail
    ? {
        quarter: (selectedDetail.index % 4) as 0 | 1 | 2 | 3,
        quarterLabel: selectedDetail.label,
        target: selectedDetail.target,
        targetShare: selectedDetail.targetShare,
        actual2025: selectedDetail.baseline2025,
        actualShare2025: selectedDetail.baselineShare2025,
        current: selectedDetail.current,
        growth: selectedDetail.growth,
        warningLevel: selectedDetail.warningLevel,
      }
    : null;

  // 如果数据无效，显示空状态
  if (!isValid) {
    return (
      <div className={`rounded-xl border p-4 ${className}`}>
        <div className="flex items-center justify-center h-64 text-gray-400">
          数据格式无效，请检查输入数据
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 ${className}`}>
      {/* 图表头部（包含标题、视图切换器、图例） */}
      <ChartHeader
        title={config.title || '图表'}
        viewMode={quarterlyViewMode}
        onViewModeChange={(mode) => handleViewModeChange(mode as ViewMode)}
      />

      {/* 图表主体 */}
      <div className="mt-4">
        <ReactECharts
          option={chartOption}
          style={{ height: config.height || 400 }}
          notMerge={true}
          lazyUpdate={true}
          onEvents={{
            click: handleChartClick,
          }}
        />
      </div>

      {/* 详情面板 */}
      {config.showDetailPanel && quarterDetailData && (
        <DetailPanel detail={quarterDetailData} onClose={handleCloseDetail} />
      )}
    </div>
  );
}

// 默认导出
export default UniversalChart;
