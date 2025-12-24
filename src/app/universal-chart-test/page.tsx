'use client';

/**
 * UniversalChart 测试页面
 *
 * 展示UniversalChart组件的所有功能和图表类型
 */

import React, { useState, useMemo } from 'react';
import { UniversalChart } from '@/components/charts/UniversalChart';
import type {
  UniversalChartInputData,
  ChartType,
  QuarterlyDataInput,
  MonthlyDataInput,
  HqPredictionDataInput,
} from '@/components/charts/UniversalChart';
import {
  createQuarterlyPremiumAdapter,
  createQuarterlyShareAdapter,
  createMonthlyPremiumAdapter,
  createMonthlyShareAdapter,
  createHqPredictionAdapter,
} from '@/components/charts/UniversalChart';

/**
 * 模拟测试数据
 */
function generateTestData() {
  // 季度测试数据
  const quarterlyData: QuarterlyDataInput = {
    quarterlyTargets: [25000, 28000, 30000, 27000], // 2026季度目标
    quarterlyActuals2025: [22000, 24000, 26000, 23000], // 2025季度实际
    quarterlyCurrent: [23000, 25000, 28000, 26000], // 当前季度值（所有季度都有数据）
    totalTarget: 110000,
    totalActual2025: 95000,
    // 不提供growthSeries，让适配器自动计算
  };

  // 月度测试数据
  const monthlyData: MonthlyDataInput = {
    monthlyTargets: [8000, 8500, 8500, 9000, 9500, 10000, 10000, 10000, 10000, 9000, 9000, 8500],
    monthlyActuals2025: [7500, 7800, 8000, 8200, 8500, 9000, 9200, 9000, 8800, 8500, 8300, 8000],
    monthlyCurrent: [7800, 8200, 8600, 9200, 9800, 10200, 10300, 10100, 9900, 9200, 9000, 8700], // 所有月份都有数据
    totalTarget: 110000,
    totalActual2025: 100800,
    // 不提供growthSeries，让适配器自动计算
  };

  // 总公司预测数据（累计值）
  const hqPredictionData: HqPredictionDataInput = {
    cumulativeTargets: [8000, 16500, 25000, 34000, 43500, 53500, 63500, 73500, 83500, 92500, 101500, 110000],
    cumulativeActuals2025: [7500, 15300, 23300, 31500, 40000, 49000, 58200, 67200, 76000, 84500, 92800, 100800],
    cumulativeCurrent: [7800, 16000, 24600, 33800, 43600, 53800, 64100, 74200, 84100, 93300, 102300, 111000], // 所有月份都有累计数据
    totalTarget: 110000,
    totalActual2025: 100800,
    // 不提供growthSeries和achievementSeries，让适配器自动计算
  };

  return {
    quarterlyData,
    monthlyData,
    hqPredictionData,
  };
}

/**
 * 图表类型配置
 */
interface ChartConfig {
  id: ChartType;
  name: string;
  description: string;
  getData: () => UniversalChartInputData;
}

export default function UniversalChartTestPage() {
  const [selectedChartId, setSelectedChartId] = useState<ChartType>('quarterlyPremium');

  // 生成测试数据
  const testData = useMemo(() => generateTestData(), []);

  // 图表配置列表
  const chartConfigs: ChartConfig[] = useMemo(() => {
    const quarterlyPremiumAdapter = createQuarterlyPremiumAdapter();
    const quarterlyShareAdapter = createQuarterlyShareAdapter();
    const monthlyPremiumAdapter = createMonthlyPremiumAdapter();
    const monthlyShareAdapter = createMonthlyShareAdapter();
    const hqPredictionAdapter = createHqPredictionAdapter();

    return [
      {
        id: 'quarterlyPremium',
        name: '季度保费规划图',
        description: '展示季度保费的规划目标与实际完成情况',
        getData: () => quarterlyPremiumAdapter.adapt(testData.quarterlyData),
      },
      {
        id: 'quarterlyShare',
        name: '季度占比规划图',
        description: '展示各季度在全年中的占比分布',
        getData: () => quarterlyShareAdapter.adapt(testData.quarterlyData),
      },
      {
        id: 'monthlyPremium',
        name: '月度保费规划图',
        description: '展示月度保费的规划目标与实际完成情况',
        getData: () => monthlyPremiumAdapter.adapt(testData.monthlyData),
      },
      {
        id: 'monthlyShare',
        name: '月度占比规划图',
        description: '展示各月度在全年中的占比分布',
        getData: () => monthlyShareAdapter.adapt(testData.monthlyData),
      },
      {
        id: 'hqPrediction',
        name: '总公司预测图',
        description: '展示月度累计达成情况与预测',
        getData: () => hqPredictionAdapter.adapt(testData.hqPredictionData),
      },
    ];
  }, [testData]);

  // 获取当前选中的图表配置
  const currentChart = chartConfigs.find((c) => c.id === selectedChartId) || chartConfigs[0];
  const chartData = currentChart.getData();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">UniversalChart 组件测试</h1>
          <p className="mt-2 text-gray-600">
            测试通用图表组件的所有功能和图表类型
          </p>
        </div>

        {/* 图表类型选择器 */}
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">选择图表类型</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {chartConfigs.map((config) => (
              <button
                key={config.id}
                onClick={() => setSelectedChartId(config.id)}
                className={`rounded-lg border p-4 text-left transition-all ${
                  selectedChartId === config.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{config.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{config.description}</p>
                  </div>
                  {selectedChartId === config.id && (
                    <div className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {chartData.timeGranularity === 'quarterly' ? '季度' : '月度'}
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {chartData.valueType === 'absolute'
                      ? '绝对值'
                      : chartData.valueType === 'proportion'
                      ? '占比'
                      : '达成率'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 当前图表信息 */}
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">当前图表信息</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-gray-600">图表类型</div>
              <div className="mt-1 font-semibold text-gray-900">{currentChart.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">时间粒度</div>
              <div className="mt-1 font-semibold text-gray-900">
                {chartData.timeGranularity === 'quarterly' ? '季度（4个数据点）' : '月度（12个数据点）'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">值类型</div>
              <div className="mt-1 font-semibold text-gray-900">
                {chartData.valueType === 'absolute'
                  ? '绝对值（万元）'
                  : chartData.valueType === 'proportion'
                  ? '占比（百分比）'
                  : '达成率（百分比）'}
              </div>
            </div>
          </div>
        </div>

        {/* 图表展示区 */}
        <div className="mb-6">
          <UniversalChart
            chartType={selectedChartId}
            data={chartData}
            config={{
              height: 500,
              showDetailPanel: true,
            }}
            onPeriodClick={(index, detail) => {
              console.log('点击周期:', index, detail);
            }}
            onViewModeChange={(mode) => {
              console.log('切换视图模式:', mode);
            }}
          />
        </div>

        {/* 测试数据说明 */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">测试数据说明</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800">季度数据</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
                <li>2026年度目标: 11万 (Q1: 2.5万, Q2: 2.8万, Q3: 3.0万, Q4: 2.7万)</li>
                <li>2025年度实际: 9.5万 (Q1: 2.2万, Q2: 2.4万, Q3: 2.6万, Q4: 2.3万)</li>
                <li>当前进度: 所有季度都有数据 (Q1: 2.3万, Q2: 2.5万, Q3: 2.8万, Q4: 2.6万)</li>
                <li>增长率: 自动计算所有季度 (约4.5%, 4.2%, 7.7%, 13%)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">月度数据</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
                <li>2026年度目标: 11万 (按月分配，夏季高峰)</li>
                <li>2025年度实际: 10.08万 (按月分配)</li>
                <li>当前进度: 所有12个月都有数据</li>
                <li>增长率: 自动计算所有月份（范围约4%-13%）</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">总公司预测数据</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
                <li>使用累计值展示达成情况</li>
                <li>支持月度累计达成率计算</li>
                <li>当前进度: 所有12个月都有累计数据</li>
                <li>最终达成: 11.1万 (超额完成0.9%)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 功能测试清单 */}
        <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">功能测试清单</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-gray-800">基础功能</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  图表正常渲染
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  数据正确显示
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  图表标题和图例
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Tooltip提示信息
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-gray-800">交互功能</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="mr-2">□</span>
                  点击柱状图查看详情
                </li>
                <li className="flex items-center">
                  <span className="mr-2">□</span>
                  视图模式切换
                </li>
                <li className="flex items-center">
                  <span className="mr-2">□</span>
                  详情面板显示
                </li>
                <li className="flex items-center">
                  <span className="mr-2">□</span>
                  预警级别显示
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
