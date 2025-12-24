/**
 * 通用图表 - 交互状态管理 Hook
 *
 * @hook useChartInteractions
 * @description 管理图表的交互状态（选中周期、视图模式、详情面板等）
 */

import { useState, useCallback } from 'react';
import type {
  ViewMode,
  PeriodIndex,
  ChartInteractionState,
  UniversalChartConfig,
} from '../UniversalChart.types';

/**
 * 交互状态管理 Hook
 *
 * @param config 图表配置
 * @returns 交互状态和控制函数
 *
 * @example
 * const { state, toggleViewMode, selectPeriod, closePeriod } = useChartInteractions(config);
 */
export function useChartInteractions(config?: UniversalChartConfig) {
  // 初始化状态
  const [state, setState] = useState<ChartInteractionState>({
    selectedPeriod: null,
    viewMode: config?.defaultViewMode || 'proportion',
    showDetailPanel: config?.showDetailPanel ?? true,
  });

  /**
   * 切换视图模式
   */
  const setViewMode = useCallback((mode: ViewMode) => {
    setState((prev) => ({
      ...prev,
      viewMode: mode,
    }));
  }, []);

  /**
   * 选中周期（点击柱状图）
   */
  const selectPeriod = useCallback((index: PeriodIndex) => {
    setState((prev) => ({
      ...prev,
      selectedPeriod: index,
    }));
  }, []);

  /**
   * 关闭周期详情
   */
  const closePeriod = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedPeriod: null,
    }));
  }, []);

  /**
   * 切换详情面板显示/隐藏
   */
  const toggleDetailPanel = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showDetailPanel: !prev.showDetailPanel,
    }));
  }, []);

  /**
   * 重置所有状态
   */
  const resetState = useCallback(() => {
    setState({
      selectedPeriod: null,
      viewMode: config?.defaultViewMode || 'proportion',
      showDetailPanel: config?.showDetailPanel ?? true,
    });
  }, [config]);

  return {
    state,
    setViewMode,
    selectPeriod,
    closePeriod,
    toggleDetailPanel,
    resetState,
  };
}
