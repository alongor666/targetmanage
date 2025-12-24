/**
 * 季度占比规划图组件测试页面
 *
 * @page test/quarterly-chart
 * @description 全面测试 QuarterlyProportionChart 组件的所有功能
 */

'use client';

import React, { useState } from 'react';
import { QuarterlyProportionChart } from '@/components/charts/QuarterlyProportionChart';
import type { ViewMode } from '@/components/charts/QuarterlyProportionChart';

// 测试数据场景
const testScenarios = {
  // 场景1: 正常数据（有增长，有预警）
  normal: {
    name: '正常数据（混合增长）',
    data: {
      quarterlyTargets: [1150, 1250, 1100, 1100],
      quarterlyActuals2025: [1050, 1120, 980, 1050],
      quarterlyCurrent: [1100, 1180, 1050, 1080],
      totalTarget: 4600,
      totalActual2025: 4200,
      growthSeries: [0.0476, 0.0536, 0.0714, 0.0286], // 4.76%, 5.36%, 7.14%, 2.86%
    },
  },

  // 场景2: 优秀数据（高增长）
  excellent: {
    name: '优秀数据（高增长）',
    data: {
      quarterlyTargets: [1000, 1100, 1050, 1150],
      quarterlyActuals2025: [800, 900, 850, 900],
      quarterlyCurrent: [950, 1050, 1000, 1100],
      totalTarget: 4300,
      totalActual2025: 3450,
      growthSeries: [0.1875, 0.1667, 0.1765, 0.2222], // 18.75%, 16.67%, 17.65%, 22.22%
    },
  },

  // 场景3: 预警数据（低增长）
  warning: {
    name: '预警数据（低增长）',
    data: {
      quarterlyTargets: [1200, 1300, 1250, 1250],
      quarterlyActuals2025: [1150, 1250, 1200, 1200],
      quarterlyCurrent: [1180, 1280, 1220, 1210],
      totalTarget: 5000,
      totalActual2025: 4800,
      growthSeries: [0.0261, 0.0240, 0.0167, 0.0083], // 2.61%, 2.40%, 1.67%, 0.83%
    },
  },

  // 场景4: 危险数据（负增长）
  danger: {
    name: '危险数据（负增长）',
    data: {
      quarterlyTargets: [1100, 1200, 1150, 1150],
      quarterlyActuals2025: [1000, 1100, 1050, 1050],
      quarterlyCurrent: [980, 1080, 1030, 1020],
      totalTarget: 4600,
      totalActual2025: 4200,
      growthSeries: [-0.0200, -0.0182, -0.0190, -0.0286], // -2.00%, -1.82%, -1.90%, -2.86%
    },
  },

  // 场景5: 包含 null 数据
  withNulls: {
    name: '包含缺失数据',
    data: {
      quarterlyTargets: [1000, 1200, 1100, 1300],
      quarterlyActuals2025: [900, null, 1000, 1200], // Q2 缺失
      quarterlyCurrent: [950, 1150, null, 1250],     // Q3 缺失
      totalTarget: 4600,
      totalActual2025: 4200,
      growthSeries: [0.0556, null, null, 0.0417],     // 对应的 null
    },
  },

  // 场景6: 错误数据（用于测试错误处理）
  error: {
    name: '错误数据（格式错误）',
    data: {
      quarterlyTargets: [1000], // 长度错误
      quarterlyActuals2025: [900, 1100, 1000, 1200],
      quarterlyCurrent: [950, 1150, 1050, 1250],
      totalTarget: 4600,
      totalActual2025: 4200,
      growthSeries: [0.0556, 0.0455, 0.05, 0.0417],
    },
  },
};

export default function QuarterlyChartTestPage() {
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof testScenarios>('normal');
  const [viewMode, setViewMode] = useState<ViewMode>('proportion');
  const [showDetailPanel, setShowDetailPanel] = useState(true);
  const [chartHeight, setChartHeight] = useState(400);
  const [logs, setLogs] = useState<string[]>([]);

  const currentScenario = testScenarios[selectedScenario];

  // 添加日志
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('zh-CN');
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev]);
  };

  // 季度点击处理
  const handleQuarterClick = (quarter: number, detail: any) => {
    addLog(`点击了季度: ${detail.quarterLabel}`);
    addLog(`  - 2026目标: ${detail.target.toLocaleString()} (占比 ${(detail.targetShare * 100).toFixed(1)}%)`);
    addLog(`  - 2025实际: ${detail.actual2025?.toLocaleString() ?? 'N/A'} (占比 ${detail.actualShare2025 ? (detail.actualShare2025 * 100).toFixed(1) : 'N/A'}%)`);
    addLog(`  - 增长率: ${detail.growth !== null ? (detail.growth * 100).toFixed(2) : 'N/A'}%`);
    addLog(`  - 预警级别: ${detail.warningLevel}`);
  };

  // 视图模式变化处理
  const handleViewModeChange = (newViewMode: ViewMode) => {
    addLog(`视图模式切换: ${newViewMode}`);
    setViewMode(newViewMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            季度占比规划图组件测试
          </h1>
          <p className="text-gray-600">
            全面测试 QuarterlyProportionChart 组件的所有功能和交互
          </p>
        </div>

        {/* 测试控制面板 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">测试控制</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 数据场景选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                数据场景
              </label>
              <select
                value={selectedScenario}
                onChange={(e) => {
                  const scenario = e.target.value as keyof typeof testScenarios;
                  setSelectedScenario(scenario);
                  addLog(`切换数据场景: ${testScenarios[scenario].name}`);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(testScenarios).map(([key, { name }]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* 视图模式选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                视图模式
              </label>
              <div className="flex gap-2">
                {(['proportion', 'absolute', 'growth'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleViewModeChange(mode)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === mode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {mode === 'proportion' && '占比'}
                    {mode === 'absolute' && '绝对值'}
                    {mode === 'growth' && '增长率'}
                  </button>
                ))}
              </div>
            </div>

            {/* 图表高度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                图表高度: {chartHeight}px
              </label>
              <input
                type="range"
                min="300"
                max="600"
                step="50"
                value={chartHeight}
                onChange={(e) => setChartHeight(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* 显示详情面板开关 */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDetailPanel}
                  onChange={(e) => {
                    setShowDetailPanel(e.target.checked);
                    addLog(`详情面板: ${e.target.checked ? '显示' : '隐藏'}`);
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">显示详情面板</span>
              </label>
            </div>
          </div>
        </div>

        {/* 组件展示区域 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">组件展示</h2>
            <div className="text-sm text-gray-500">
              当前场景: <span className="font-medium text-blue-600">{currentScenario.name}</span>
            </div>
          </div>

          <QuarterlyProportionChart
            data={currentScenario.data}
            config={{
              height: chartHeight,
              showDetailPanel,
              defaultViewMode: viewMode,
              animation: true,
              barMaxWidth: 60,
              showDataLabel: true,
            }}
            onQuarterClick={handleQuarterClick}
            onViewModeChange={handleViewModeChange}
            className="shadow-sm"
          />
        </div>

        {/* 当前数据详情 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">当前数据详情</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium mb-1">季度目标</div>
              <div className="text-lg font-semibold text-blue-900">
                {JSON.stringify(currentScenario.data.quarterlyTargets)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 font-medium mb-1">2025实际</div>
              <div className="text-lg font-semibold text-gray-900">
                {JSON.stringify(currentScenario.data.quarterlyActuals2025)}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium mb-1">当前实际</div>
              <div className="text-lg font-semibold text-green-900">
                {JSON.stringify(currentScenario.data.quarterlyCurrent)}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium mb-1">增长率</div>
              <div className="text-lg font-semibold text-purple-900">
                {JSON.stringify(currentScenario.data.growthSeries)}
              </div>
            </div>
          </div>
        </div>

        {/* 交互日志 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">交互日志</h2>
            <button
              onClick={() => setLogs([])}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              清空日志
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-400 text-center py-8">暂无日志</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1 text-gray-700">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 测试说明 */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">测试说明</h2>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>数据场景</strong>: 切换不同的数据场景来测试预警系统的显示效果</p>
            <p>• <strong>视图模式</strong>: 测试占比视图、绝对值视图、增长率聚焦三种模式</p>
            <p>• <strong>交互功能</strong>: 点击图表中的柱状图，查看季度详情面板</p>
            <p>• <strong>错误处理</strong>: 选择"错误数据"场景测试组件的错误处理能力</p>
            <p>• <strong>响应式</strong>: 调整图表高度，测试不同尺寸下的显示效果</p>
          </div>
        </div>
      </div>
    </div>
  );
}
