/**
 * 季度占比规划图 - ECharts 配置生成 Hook
 *
 * @hook useChartConfig
 * @description 生成 ECharts 图表配置选项
 */

import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type {
  ProcessedQuarterData,
  ViewMode,
  ChartConfig,
  ColorScheme,
  WarningLevel,
} from '../QuarterlyProportionChart.types';
import { QUARTER_LABELS } from '../QuarterlyProportionChart.types';
import { formatPercent, getGrowthArrow } from '../utils/formatter';

/**
 * 默认颜色配置
 */
const DEFAULT_COLORS: ColorScheme = {
  target: {
    normal: '#dceef9',
    gradient: ['#dceef9', '#b0d8ef'],
    hover: '#c5e3f7',
  },
  actual: {
    normal: '#f2f2f2',
    hover: '#e5e5e5',
  },
  growth: {
    line: '#0070c0',
    positive: '#4caf50',
    neutral: '#757575',
    negative: '#f44336',
  },
  warning: {
    orange: '#ffc000',
    red: '#d32f2f',
  },
};

/**
 * 预警级别对应的颜色
 */
function getWarningColor(level: WarningLevel): string {
  switch (level) {
    case 'excellent':
      return DEFAULT_COLORS.growth.positive;
    case 'normal':
      return DEFAULT_COLORS.growth.neutral;
    case 'warning':
      return DEFAULT_COLORS.warning.orange;
    case 'danger':
      return DEFAULT_COLORS.growth.negative;
  }
}

/**
 * 格式化 Tooltip（增强版，带颜色编码和趋势箭头）
 */
function createTooltipFormatter(viewMode: ViewMode) {
  return (params: any) => {
    if (!Array.isArray(params) || params.length === 0) return '';

    const dataIndex = params[0].dataIndex;
    const quarter = QUARTER_LABELS[dataIndex];

    let tooltip = `<div style="padding: 6px 8px; min-width: 200px;">
      <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px; color: #333;">${quarter}</div>`;

    params.forEach((param: any) => {
      const { seriesName, value, marker, color } = param;

      if (value === null || value === undefined) {
        tooltip += `<div style="margin: 4px 0; font-size: 12px; color: #999;">${marker}${seriesName}: —</div>`;
        return;
      }

      // 根据系列类型格式化显示
      let formattedValue: string;
      let valueStyle = '';

      if (seriesName.includes('增长率')) {
        const growth = value as number;
        const arrow = getGrowthArrow(growth);
        formattedValue = `${arrow} ${formatPercent(growth, 2)}`;

        // 根据增长率设置颜色
        if (growth >= 0.15) {
          valueStyle = 'color: #4caf50;'; // 绿色
        } else if (growth >= 0.05) {
          valueStyle = 'color: #757575;'; // 灰色
        } else if (growth >= 0) {
          valueStyle = 'color: #ffc000;'; // 橙色
        } else {
          valueStyle = 'color: #f44336;'; // 红色
        }
      } else if (seriesName.includes('占比')) {
        formattedValue = formatPercent(value);
        valueStyle = 'color: #333;';
      } else {
        formattedValue = value.toLocaleString('zh-CN', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
        valueStyle = 'color: #333;';
      }

      tooltip += `<div style="margin: 4px 0; font-size: 13px; display: flex; align-items: center; justify-content: space-between;">
        <span style="color: #666;">${marker}${seriesName}:</span>
        <span style="font-weight: 600; ${valueStyle}">${formattedValue}</span>
      </div>`;
    });

    tooltip += '</div>';
    return tooltip;
  };
}

/**
 * ECharts 配置生成 Hook
 *
 * @param processedData - 处理后的季度数据
 * @param viewMode - 视图模式
 * @param config - 图表配置选项
 * @returns ECharts 配置对象
 *
 * @example
 * const chartOption = useChartConfig(processedData, viewMode, config);
 */
export function useChartConfig(
  processedData: ProcessedQuarterData,
  viewMode: ViewMode,
  config?: ChartConfig
): any {
  const {
    height = 400,
    animation = true,
    barMaxWidth = 60,
    showDataLabel = true,
  } = config || {};

  return useMemo<EChartsOption>(() => {
    const {
      targetShare,
      actualShare,
      growthSeries,
      quarterDetails,
    } = processedData;

    // 根据视图模式确定显示的数据
    const shouldShowProportion = viewMode === 'proportion';
    const shouldShowAbsolute = viewMode === 'absolute';

    // Y轴配置
    const yAxisConfig: any = [
      {
        type: 'value',
        name: shouldShowProportion ? '占比' : '数值',
        position: 'left',
        axisLabel: {
          formatter: (value: number) => {
            if (shouldShowProportion) {
              return `${(value * 100).toFixed(0)}%`;
            }
            return value.toLocaleString('zh-CN');
          },
        },
        splitLine: {
          show: false, // 去掉网格线
        },
      },
      {
        type: 'value',
        name: '增长率',
        position: 'right',
        axisLabel: {
          formatter: (value: number) => `${(value * 100).toFixed(0)}%`,
        },
        splitLine: {
          show: false, // 去掉网格线
        },
      },
    ];

    // 数据标签配置
    const dataLabelConfig = showDataLabel
      ? {
          show: true,
          position: 'top' as const,
          formatter: (params: any) => {
            const value = params.value as number | null;
            if (value === null) return '—';
            return formatPercent(value);
          },
          fontSize: 11,
          color: '#666',
        }
      : { show: false };

    // 系列（柱状图）配置
    const seriesConfig: any[] = [];

    // 2026 规划占比/绝对值
    if (shouldShowProportion || shouldShowAbsolute) {
      seriesConfig.push({
        name: shouldShowProportion ? '2026规划占比' : '2026目标',
        type: 'bar',
        data: targetShare,
        barMaxWidth,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: DEFAULT_COLORS.target.gradient[0] },
              { offset: 1, color: DEFAULT_COLORS.target.gradient[1] },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: DEFAULT_COLORS.target.hover,
          },
        },
        label: dataLabelConfig,
        animation,
        animationDuration: 800,
        animationEasing: 'cubicOut',
      });
    }

    // 2025 实际占比/绝对值
    if (shouldShowProportion || shouldShowAbsolute) {
      seriesConfig.push({
        name: shouldShowProportion ? '2025实际占比' : '2025实际',
        type: 'bar',
        data: actualShare,
        barMaxWidth,
        itemStyle: {
          color: DEFAULT_COLORS.actual.normal,
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: DEFAULT_COLORS.actual.hover,
          },
        },
        label: dataLabelConfig,
        animation,
        animationDuration: 800,
        animationEasing: 'cubicOut',
        animationDelay: 100,
      });
    }

    // 增长率折线
    if (viewMode !== 'absolute') {
      seriesConfig.push({
        name: '增长率',
        type: 'line',
        data: growthSeries,
        yAxisIndex: 1,
        itemStyle: {
          color: DEFAULT_COLORS.growth.line,
        },
        lineStyle: {
          width: 3,
          shadowColor: 'rgba(0, 112, 192, 0.3)',
          shadowBlur: 10,
          shadowOffsetY: 5,
        },
        symbol: 'circle',
        symbolSize: 8,
        emphasis: {
          scale: 1.5,
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
          },
        },
        // 5%预警线
        markLine: {
          silent: false, // 允许交互
          symbol: ['none', 'none'], // 不显示箭头
          label: {
            show: true,
            position: 'end',
            formatter: '预警线 5%',
            fontSize: 11,
            color: '#ffc000',
            fontWeight: 'bold',
            distance: 5,
          },
          data: [
            {
              yAxis: 0.05, // 5% = 0.05
              lineStyle: {
                type: 'dashed',
                color: '#ffc000',
                width: 2,
                cap: 'round',
              },
            },
          ],
        },
        label: {
          show: showDataLabel,
          position: 'top',
          formatter: (params: any) => {
            const value = params.value as number | null;
            if (value === null) return '—';
            const arrow = value > 0 ? '↗' : value < 0 ? '↘' : '→';
            return `${arrow} ${formatPercent(value)}`;
          },
          fontSize: 11,
          color: '#0070c0',
          fontWeight: 'bold',
        },
        animation,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        animationDelay: 200,
      });
    }

    // 图例配置
    const legendData = seriesConfig.map((s: any) => s.name);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: createTooltipFormatter(viewMode),
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        textStyle: {
          color: '#333',
          fontSize: 12,
        },
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
      },
      legend: {
        data: legendData,
        top: 10,
        left: 'center',
        itemWidth: 30,
        itemHeight: 14,
        textStyle: {
          fontSize: 12,
          color: '#666',
        },
      },
      grid: {
        left: 60,
        right: 60,
        top: 50,
        bottom: 40,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: Array.from(QUARTER_LABELS),
        axisLine: {
          lineStyle: {
            color: '#e0e0e0',
          },
        },
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: {
          fontSize: 12,
          color: '#666',
          margin: 12,
        },
      },
      yAxis: yAxisConfig,
      series: seriesConfig,
    };
  }, [processedData, viewMode, height, animation, barMaxWidth, showDataLabel]);
}

/**
 * 获取预警颜色（供外部使用）
 */
export function getWarningLevelColor(level: WarningLevel): string {
  return getWarningColor(level);
}

/**
 * 获取默认颜色配置（供外部使用）
 */
export function getDefaultColors(): ColorScheme {
  return DEFAULT_COLORS;
}
