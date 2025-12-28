/**
 * 通用图表 - ECharts 配置生成 Hook
 *
 * @hook useUniversalConfig
 * @description 生成通用图表的 ECharts 配置选项，支持多种视图模式和值类型
 */

import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type {
  ProcessedChartData,
  ViewMode,
  UniversalChartConfig,
  TimeGranularity,
  ValueType,
  ColorScheme,
  WarningLevel,
} from '../UniversalChart.types';
import { FONT_SIZE } from '@/lib/typography';
import {
  getOptimizedXAxisConfig,
  getStandardYAxisConfig,
  getStandardGridConfig,
  getStandardTooltipConfig
} from '@/lib/echarts-utils';
import { getYearlyComparisonColor, adjustBrightness } from '../../QuarterlyProportionChart/utils/colorUtils';

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
 * 格式化百分比
 */
function formatPercent(value: number | null, decimals = 1): string {
  if (value === null) return '—';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 获取增长率箭头
 */
function getGrowthArrow(growth: number | null): string {
  if (growth === null) return '→';
  if (growth > 0) return '↗';
  if (growth < 0) return '↘';
  return '→';
}

/**
 * 创建Tooltip格式化函数
 */
function createTooltipFormatter(
  viewMode: ViewMode,
  valueType: ValueType,
  xAxisLabels: string[]
) {
  return (params: any) => {
    if (!Array.isArray(params) || params.length === 0) return '';

    const dataIndex = params[0].dataIndex;
    const periodLabel = xAxisLabels[dataIndex];

    let tooltip = `<div style="padding: 6px 8px; min-width: 200px;">
      <div style="font-weight: bold; margin-bottom: 8px; font-size: ${FONT_SIZE.base}px; color: #333;">${periodLabel}</div>`;

    params.forEach((param: any) => {
      const { seriesName, value, marker } = param;

      if (value === null || value === undefined) {
        tooltip += `<div style="margin: 4px 0; font-size: ${FONT_SIZE.sm}px; color: #999;">${marker}${seriesName}: —</div>`;
        return;
      }

      // 根据系列类型格式化显示
      let formattedValue: string;
      let valueStyle = '';

      if (seriesName.includes('增长率') || seriesName.includes('达成率')) {
        const rate = value as number;
        const arrow = getGrowthArrow(rate);
        formattedValue = `${arrow} ${formatPercent(rate, 2)}`;

        // 根据增长率设置颜色
        if (rate >= 0.15) {
          valueStyle = 'color: #4caf50;'; // 绿色
        } else if (rate >= 0.05) {
          valueStyle = 'color: #757575;'; // 灰色
        } else if (rate >= 0) {
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

      tooltip += `<div style="margin: 4px 0; font-size: ${FONT_SIZE.base}px; display: flex; align-items: center; justify-content: space-between;">
        <span style="color: #666;">${marker}${seriesName}:</span>
        <span style="font-weight: 600; ${valueStyle}">${formattedValue}</span>
      </div>`;
    });

    tooltip += '</div>';
    return tooltip;
  };
}

/**
 * 根据视图模式获取Y轴数据
 */
function getYAxisData(
  processedData: ProcessedChartData,
  viewMode: ViewMode
): {
  targetData: (number | null)[];
  baselineData: (number | null)[];
} {
  const { targetShare, baselineShare, periodDetails } = processedData;

  switch (viewMode) {
    case 'proportion':
      return {
        targetData: targetShare,
        baselineData: baselineShare,
      };

    case 'absolute':
      return {
        targetData: periodDetails.map((d) => d.target),
        baselineData: periodDetails.map((d) => d.baseline2025),
      };

    case 'achievement':
      // 达成率视图，显示绝对值柱状图
      return {
        targetData: periodDetails.map((d) => d.target),
        baselineData: periodDetails.map((d) => d.current),
      };

    default:
      return {
        targetData: targetShare,
        baselineData: baselineShare,
      };
  }
}

/**
 * 根据视图模式获取系列名称
 */
function getSeriesNames(viewMode: ViewMode): {
  targetName: string;
  baselineName: string;
  growthName: string;
} {
  switch (viewMode) {
    case 'proportion':
      return {
        targetName: '2026规划占比',
        baselineName: '2025实际占比',
        growthName: '同比增长率',
      };

    case 'absolute':
      return {
        targetName: '2026目标',
        baselineName: '2025实际',
        growthName: '同比增长率',
      };

    case 'achievement':
      return {
        targetName: '2026目标',
        baselineName: '2026实际',
        growthName: '达成率',
      };

    default:
      return {
        targetName: '2026目标',
        baselineName: '2025实际',
        growthName: '增长率',
      };
  }
}

/**
 * ECharts 配置生成 Hook
 *
 * @param processedData 处理后的图表数据
 * @param viewMode 视图模式
 * @param timeGranularity 时间粒度
 * @param valueType 值类型
 * @param config 图表配置选项
 * @returns ECharts 配置对象
 */
export function useUniversalConfig(
  processedData: ProcessedChartData,
  viewMode: ViewMode,
  timeGranularity: TimeGranularity,
  valueType: ValueType,
  config?: UniversalChartConfig,
  currentMonth?: number
): EChartsOption {
  const {
    height = 400,
    animation = true,
    barMaxWidth,
    showDataLabel = true,
    yAxisName,
    rightYAxisName,
  } = config || {};

  // 根据时间粒度自动调整柱宽
  const calculatedBarMaxWidth = barMaxWidth || (timeGranularity === 'quarterly' ? 60 : timeGranularity === 'organization' ? 36 : 40);

  return useMemo<EChartsOption>(() => {
    const { xAxisLabels, growthSeries, achievementSeries, periodDetails } = processedData;

    // 获取Y轴数据
    const { targetData, baselineData } = getYAxisData(processedData, viewMode);

    // 获取系列名称
    const seriesNames = getSeriesNames(viewMode);

    // 选择显示增长率还是达成率
    const rightSeriesData =
      viewMode === 'achievement' && achievementSeries
        ? achievementSeries
        : growthSeries;

    // 创建系列配置
    const series: any[] = [
      // 目标柱状图
      {
        name: seriesNames.targetName,
        type: 'bar',
        data: targetData.map((value, index) => {
          const isFutureMonth = (timeGranularity === 'monthly' && currentMonth !== undefined)
            ? (index + 1 > currentMonth)
            : false;

          return {
            value,
            itemStyle: {
              color: isFutureMonth
                ? '#e8f4fd'    // 未来月份 → 规划色（极浅蓝）
                : '#dceef9',   // 已过月份 → 实际色（浅蓝）

              borderColor: isFutureMonth
                ? '#b0d8ef'    // 未来月份加边框（浅蓝）
                : 'transparent',

              borderWidth: isFutureMonth ? 1 : 0,
              borderRadius: [4, 4, 0, 0],
            },
          };
        }),
        yAxisIndex: 0,
        barMaxWidth: calculatedBarMaxWidth,
        emphasis: {
          itemStyle: {
            color: DEFAULT_COLORS.target.hover,
          },
        },
        label: showDataLabel
          ? {
              show: true,
              position: 'top',
              formatter: (params: any) => {
                if (params.value === null) return '';
                return viewMode === 'proportion'
                  ? formatPercent(params.value)
                  : params.value.toFixed(0);
              },
              fontSize: FONT_SIZE.xs,
              color: '#666',
            }
          : undefined,
      },
      // 基准柱状图
      {
        name: seriesNames.baselineName,
        type: 'bar',
        data: baselineData.map((value) => {
          // 使用年度对比颜色系统 - 2025实际数据
          const colorConfig = getYearlyComparisonColor('actual2025');

          return {
            value,
            itemStyle: {
              color: colorConfig.fill,
              borderColor: colorConfig.border,
              borderWidth: colorConfig.borderWidth,
              borderRadius: [4, 4, 0, 0],
            },
          };
        }),
        yAxisIndex: 0,
        barMaxWidth: calculatedBarMaxWidth,
        emphasis: {
          itemStyle: {
            // hover 时使用稍深的颜色
            color: adjustBrightness(getYearlyComparisonColor('actual2025').fill, -0.1),
          },
        },
        label: showDataLabel
          ? {
              show: true,
              position: 'top',
              formatter: (params: any) => {
                if (params.value === null) return '';
                return viewMode === 'proportion'
                  ? formatPercent(params.value)
                  : params.value.toFixed(0);
              },
              fontSize: FONT_SIZE.xs,
              color: '#666',
            }
          : undefined,
      },
      // 增长率/达成率折线图
      {
        name: seriesNames.growthName,
        type: 'line',
        data: rightSeriesData,
        yAxisIndex: 1,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 2,
          color: DEFAULT_COLORS.growth.line,
        },
        itemStyle: {
          color: (params: any) => {
            const value = params.value as number | null;
            if (value === null) return DEFAULT_COLORS.growth.neutral;
            const detail = periodDetails[params.dataIndex];
            if (!detail) return DEFAULT_COLORS.growth.neutral;
            return getWarningColor(detail.warningLevel);
          },
          borderWidth: 2,
          borderColor: '#fff',
        },
        emphasis: {
          scale: true,
          scaleSize: 12,
        },
        label: showDataLabel
          ? {
              show: true,
              position: 'top',
              fontWeight: 'bold',
              fontSize: FONT_SIZE.sm,
              formatter: (params: any) => {
                const value = params?.value as number | null;
                if (value === null) return '';
                const detail = periodDetails[params.dataIndex];
                const warningLevel = detail?.warningLevel || 'normal';

                // 格式化显示百分比，保留1位小数
                const formattedValue = `${(value * 100).toFixed(1)}%`;

                // 根据预警级别使用不同的样式标签
                let styleKey = 'normal';
                if (warningLevel === 'excellent') styleKey = 'excellent';
                else if (warningLevel === 'warning') styleKey = 'warning';
                else if (warningLevel === 'danger') styleKey = 'danger';

                return `{${styleKey}|${formattedValue}}`;
              },
              rich: {
                excellent: {
                  fontSize: FONT_SIZE.sm,
                  fontWeight: 'bold',
                  color: DEFAULT_COLORS.growth.positive, // 绿色
                },
                normal: {
                  fontSize: FONT_SIZE.sm,
                  fontWeight: 'bold',
                  color: '#0070c0', // 蓝色
                },
                warning: {
                  fontSize: FONT_SIZE.sm,
                  fontWeight: 'bold',
                  color: DEFAULT_COLORS.warning.orange, // 橙色
                },
                danger: {
                  fontSize: FONT_SIZE.sm,
                  fontWeight: 'bold',
                  color: DEFAULT_COLORS.growth.negative, // 红色
                },
              },
            }
          : undefined,
        // 5%增速预警线（仅在增长率视图下显示）
        markLine: viewMode === 'achievement' ? undefined : {
          symbol: ['none', 'none'],
          silent: true,
          label: {
            show: true,
            position: 'end',
            formatter: '预警线 5%',
            color: DEFAULT_COLORS.warning.orange,
            fontSize: FONT_SIZE.xs,
            fontWeight: 500,
          },
          lineStyle: {
            color: DEFAULT_COLORS.warning.orange,
            type: 'dashed',
            width: 1.5,
          },
          data: [{ yAxis: 0.05 }],
        },
      },
    ];

    // 配置对象
    return {
      animation,
      // 使用标准网格配置
      grid: getStandardGridConfig(),
      // 使用优化的X轴配置（自动45度倾斜和文本截断）
      xAxis: {
        ...getOptimizedXAxisConfig(8),
        data: xAxisLabels,
        // 季度和月度视图不需要倾斜
        axisLabel: {
          ...(getOptimizedXAxisConfig(8).axisLabel),
          rotate: timeGranularity === 'organization' ? 45 : 0,
        },
      },
      yAxis: [
        // 左侧Y轴（柱状图）
        {
          type: 'value',
          name: yAxisName || (viewMode === 'proportion' ? '占比（%）' : '保费（万元）'),
          nameTextStyle: {
            color: '#666',
            fontSize: FONT_SIZE.sm,
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#999',
            fontSize: FONT_SIZE.xs,
            formatter: (value: number) => {
              if (viewMode === 'proportion') {
                return `${(value * 100).toFixed(0)}%`;
              }
              return value.toLocaleString('zh-CN');
            },
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0',
              type: 'dashed',
            },
          },
        },
        // 右侧Y轴（折线图）
        {
          type: 'value',
          name: rightYAxisName || '增长率',
          nameTextStyle: {
            color: '#666',
            fontSize: FONT_SIZE.sm,
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#999',
            fontSize: FONT_SIZE.xs,
            formatter: (value: number) => {
              return `${(value * 100).toFixed(0)}%`;
            },
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
        },
        backgroundColor: '#fff',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        padding: 0,
        formatter: createTooltipFormatter(viewMode, valueType, xAxisLabels),
        textStyle: {
          fontSize: FONT_SIZE.base,
        },
      },
      legend: {
        show: false, // 图例由ChartHeader组件单独渲染
      },
    };
  }, [
    processedData,
    viewMode,
    timeGranularity,
    valueType,
    config,
    animation,
    calculatedBarMaxWidth,
    showDataLabel,
    yAxisName,
    rightYAxisName,
    currentMonth,
  ]);
}
