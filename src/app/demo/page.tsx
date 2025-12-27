"use client";

/**
 * Demo页面 - UI重构设计方案完整演示
 *
 * 布局原则：每一行只能有一张图，避免并列（除非是要比较左右两边的数据）
 */

import React, { useState } from 'react';
import {
  Navbar,
  Button,
  Card,
  KpiCard,
  Dropdown,
  FilterTag,
} from '@/components/v2';
import { colorsV2, layoutV2, typographyV2 } from '@/styles/design-tokens-v2';

export default function DemoPage() {
  // 筛选器状态
  const [viewFilter, setViewFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('total');
  const [month, setMonth] = useState('6');
  const [progressMode, setProgressMode] = useState('weighted');

  // 筛选器选项
  const viewOptions = [
    { value: 'all', label: '全省' },
    { value: 'local', label: '同城' },
    { value: 'remote', label: '异地' },
  ];

  const productOptions = [
    { value: 'total', label: '汇总' },
    { value: 'auto', label: '车险' },
    { value: 'property', label: '财产险' },
    { value: 'life', label: '人身险' },
  ];

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}月`,
  }));

  const progressModeOptions = [
    { value: 'weighted', label: '目标权重' },
    { value: 'linear', label: '线性月份' },
    { value: 'actual2025', label: '2025年实际' },
  ];

  // 模拟数据
  const mockData = {
    baseline2025: 10500,
    dataCount2025: 120,
    dataCount2026: 60,
    annualTarget: 12345,
    ytdTarget: 6000,
    ytdActual: 9876,
    monthActual: 1234,
    quarterActual: 3200,
    achievementRate: 0.80,
    timeAchievementRate: 1.025,
    growthRate: 0.125,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colorsV2.background.primary }}>
      {/* 1. 顶部导航栏 */}
      <Navbar
        title="川分目标管理系统 2026"
        links={[
          { label: '首页', href: '/demo' },
          { label: '数据管理', href: '/data' },
          { label: '导入数据', href: '/import' },
          { label: '规则配置', href: '/rules' },
          { label: '返回旧版', href: '/' },
        ]}
        rightContent={
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: colorsV2.text.secondary }}>
              管理员
            </span>
            <Button size="sm" variant="outline">
              退出登录
            </Button>
          </div>
        }
      />

      {/* 主内容区 */}
      <main
        className="mx-auto px-6 py-6"
        style={{
          maxWidth: '1400px',
        }}
      >
        {/* 2. 筛选控制区（双行布局） */}
        <Card className="mb-7">
          {/* 第一行：筛选器 */}
          <div className="flex flex-wrap gap-4 items-end mb-4">
            {/* 视角选择器 */}
            <div className="min-w-[140px]">
              <label
                className="block mb-1 font-medium"
                style={{
                  fontSize: `${typographyV2.fontSize.small}px`,
                  color: colorsV2.text.secondary,
                }}
              >
                视角
              </label>
              <Dropdown
                value={viewFilter}
                options={viewOptions}
                onChange={setViewFilter}
              />
            </div>

            {/* 产品选择器 */}
            <div className="min-w-[120px]">
              <label
                className="block mb-1 font-medium"
                style={{
                  fontSize: `${typographyV2.fontSize.small}px`,
                  color: colorsV2.text.secondary,
                }}
              >
                产品
              </label>
              <Dropdown
                value={productFilter}
                options={productOptions}
                onChange={setProductFilter}
              />
            </div>

            {/* 截至月份 */}
            <div className="min-w-[100px]">
              <label
                className="block mb-1 font-medium"
                style={{
                  fontSize: `${typographyV2.fontSize.small}px`,
                  color: colorsV2.text.secondary,
                }}
              >
                截至月份
              </label>
              <Dropdown
                value={month}
                options={monthOptions}
                onChange={setMonth}
              />
            </div>

            {/* 时间进度口径 */}
            <div className="min-w-[140px]">
              <label
                className="block mb-1 font-medium"
                style={{
                  fontSize: `${typographyV2.fontSize.small}px`,
                  color: colorsV2.text.secondary,
                }}
              >
                时间进度口径
              </label>
              <Dropdown
                value={progressMode}
                options={progressModeOptions}
                onChange={setProgressMode}
              />
            </div>
          </div>

          {/* 分隔线 */}
          <div
            className="my-4"
            style={{
              height: '1px',
              backgroundColor: colorsV2.background.separator,
            }}
          />

          {/* 第二行：状态信息和操作 */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* 左侧：当前筛选标签 */}
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-medium"
                style={{
                  color: colorsV2.text.secondary,
                }}
              >
                当前筛选：
              </span>
              <FilterTag
                label={viewOptions.find((o) => o.value === viewFilter)?.label || ''}
              />
              <FilterTag
                label={productOptions.find((o) => o.value === productFilter)?.label || ''}
              />
              <FilterTag label={`${month}月`} />
              <FilterTag
                label={progressModeOptions.find((o) => o.value === progressMode)?.label || ''}
              />
            </div>

            {/* 右侧：数据状态和操作 */}
            <div className="flex items-center gap-4">
              <div className="text-xs" style={{ color: colorsV2.text.secondary }}>
                <div>2025年度基线：{mockData.baseline2025.toLocaleString()} 万元</div>
                <div className="mt-1">
                  数据状态：2025分月 {mockData.dataCount2025} 条，2026分月 {mockData.dataCount2026} 条
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  清空缓存
                </Button>
                <Button variant="outline" size="sm">
                  导出数据
                </Button>
                <Button variant="primary" size="sm">
                  刷新数据
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* 3. 核心KPI卡片区（4个年度指标） */}
        <div
          className="grid gap-5 mb-7"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: `${layoutV2.grid.gap}px`,
          }}
        >
          <KpiCard
            title="年度目标"
            value={`${mockData.annualTarget.toLocaleString()} 万元`}
            subtitle="2026年度总目标"
            progress={1}
            progressColor="success"
          />
          <KpiCard
            title="年度达成"
            value={`${mockData.ytdActual.toLocaleString()} 万元`}
            subtitle={`已完成${(mockData.achievementRate * 100).toFixed(1)}%`}
            progress={mockData.achievementRate}
            progressColor="success"
          />
          <KpiCard
            title="年增长率"
            value={`+${(mockData.growthRate * 100).toFixed(1)}%`}
            subtitle="同比2025年同期"
            progress={mockData.growthRate}
            progressColor="success"
          />
          <KpiCard
            title="年达成率"
            value={`${(mockData.achievementRate * 100).toFixed(1)}%`}
            subtitle="实际/目标比例"
            progress={mockData.achievementRate}
            progressColor="success"
          />
        </div>

        {/* 4. 图表展示区 - 季度保费规划图（全宽单独一行） */}
        <Card className="mb-7">
          <h3
            className="font-semibold mb-4"
            style={{
              fontSize: `${typographyV2.fontSize.h2}px`,
              color: colorsV2.text.primary,
            }}
          >
            季度保费规划
          </h3>
          <div
            className="flex items-center justify-center rounded"
            style={{
              height: '360px',
              backgroundColor: colorsV2.background.primary,
              border: `2px dashed ${colorsV2.background.separator}`,
            }}
          >
            <div className="text-center">
              <p
                className="text-lg font-medium mb-2"
                style={{
                  color: colorsV2.text.secondary,
                }}
              >
                [图表占位 - 季度柱状图 + 增长率折线]
              </p>
              <p
                className="text-sm"
                style={{
                  color: colorsV2.text.tertiary,
                }}
              >
                UniversalChart - quarterlyPremium
              </p>
            </div>
          </div>

          {/* 季度数据汇总 */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            {[
              { quarter: 'Q1', target: 2500, actual: 2500, rate: 1.00, growth: 0.10 },
              { quarter: 'Q2', target: 3200, actual: 3100, rate: 0.97, growth: 0.08 },
              { quarter: 'Q3', target: 3500, actual: null, rate: null, growth: null },
              { quarter: 'Q4', target: 3145, actual: null, rate: null, growth: null },
            ].map((q) => (
              <div key={q.quarter} className="text-center p-4 rounded" style={{ backgroundColor: colorsV2.background.primary }}>
                <div className="text-sm font-medium mb-2" style={{ color: colorsV2.text.secondary }}>
                  {q.quarter}
                </div>
                <div className="text-lg font-semibold mb-1" style={{ color: colorsV2.text.primary }}>
                  {q.target.toLocaleString()} 万元
                </div>
                {q.actual !== null ? (
                  <>
                    <div className="text-sm" style={{ color: colorsV2.text.secondary }}>
                      实际：{q.actual.toLocaleString()} 万元
                    </div>
                    <div
                      className="text-sm font-medium mt-1"
                      style={{
                        color: q.rate && q.rate >= 1 ? colorsV2.status.success : colorsV2.status.warning,
                      }}
                    >
                      达成率：{q.rate ? (q.rate * 100).toFixed(1) : '—'}%
                    </div>
                    {q.growth !== null && (
                      <div
                        className="text-xs mt-1"
                        style={{
                          color: q.growth >= 0.12 ? colorsV2.status.success : q.growth >= 0.05 ? colorsV2.text.secondary : colorsV2.status.warning,
                        }}
                      >
                        增长：+{(q.growth * 100).toFixed(1)}%
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm" style={{ color: colorsV2.text.tertiary }}>
                    预计规划
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* 图表展示区 - 月度保费规划图（全宽单独一行） */}
        <Card className="mb-7">
          <h3
            className="font-semibold mb-4"
            style={{
              fontSize: `${typographyV2.fontSize.h2}px`,
              color: colorsV2.text.primary,
            }}
          >
            月度保费规划
          </h3>
          <div
            className="flex items-center justify-center rounded"
            style={{
              height: '360px',
              backgroundColor: colorsV2.background.primary,
              border: `2px dashed ${colorsV2.background.separator}`,
            }}
          >
            <div className="text-center">
              <p
                className="text-lg font-medium mb-2"
                style={{
                  color: colorsV2.text.secondary,
                }}
              >
                [图表占位 - 月度柱状图 + 增长率标签]
              </p>
              <p
                className="text-sm"
                style={{
                  color: colorsV2.text.tertiary,
                }}
              >
                UniversalChart - monthlyPremium
              </p>
            </div>
          </div>

          {/* 月度数据汇总 */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="text-center p-3 rounded" style={{ backgroundColor: colorsV2.background.primary }}>
              <div className="text-xs" style={{ color: colorsV2.text.secondary }}>当月实际</div>
              <div className="text-xl font-bold mt-1" style={{ color: colorsV2.status.success }}>
                {mockData.monthActual.toLocaleString()} 万元
              </div>
            </div>
            <div className="text-center p-3 rounded" style={{ backgroundColor: colorsV2.background.primary }}>
              <div className="text-xs" style={{ color: colorsV2.text.secondary }}>当月目标</div>
              <div className="text-xl font-bold mt-1" style={{ color: colorsV2.text.primary }}>
                1,150 万元
              </div>
            </div>
            <div className="text-center p-3 rounded" style={{ backgroundColor: colorsV2.background.primary }}>
              <div className="text-xs" style={{ color: colorsV2.text.secondary }}>当月完成率</div>
              <div className="text-xl font-bold mt-1" style={{ color: colorsV2.status.success }}>
                107.3%
              </div>
            </div>
            <div className="text-center p-3 rounded" style={{ backgroundColor: colorsV2.background.primary }}>
              <div className="text-xs" style={{ color: colorsV2.text.secondary }}>当月增长率</div>
              <div className="text-xl font-bold mt-1" style={{ color: colorsV2.status.success }}>
                +15.2%
              </div>
            </div>
          </div>
        </Card>

        {/* 5. 总公司目标达成预测区（全宽） */}
        <Card
          className="mb-7"
          style={{
            backgroundColor: colorsV2.primary.blueLight,
          }}
        >
          <div className="mb-4">
            <h3
              className="font-semibold mb-2"
              style={{
                fontSize: `${typographyV2.fontSize.h2}px`,
                color: colorsV2.text.primary,
              }}
            >
              总公司目标达成预测
            </h3>
            <p
              className="text-sm"
              style={{
                color: colorsV2.text.secondary,
              }}
            >
              基于三级机构实际完成情况，预测四川分公司对总公司目标的达成度（不区分三级机构）
            </p>
          </div>

          {/* 4个产品达成率汇总卡片（紧凑型） */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { product: '车险', target: 8500, ytd: 6800, rate: 0.952 },
              { product: '财产险', target: 2200, ytd: 1850, rate: 0.883 },
              { product: '人身险', target: 1500, ytd: 1320, rate: 0.921 },
              { product: '汇总', target: 12200, ytd: 9970, rate: 0.915 },
            ].map((item) => (
              <div
                key={item.product}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: colorsV2.background.card,
                }}
              >
                <div className="text-sm font-medium mb-2" style={{ color: colorsV2.text.secondary }}>
                  {item.product}
                </div>
                <div className="text-xs mb-1" style={{ color: colorsV2.text.secondary }}>
                  总公司目标：{item.target.toLocaleString()} 万元
                </div>
                <div className="text-xs mb-2" style={{ color: colorsV2.text.secondary }}>
                  YTD实际：{item.ytd.toLocaleString()} 万元
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{
                    color:
                      item.rate >= 0.95
                        ? colorsV2.status.success
                        : item.rate >= 0.85
                        ? colorsV2.status.warning
                        : colorsV2.status.danger,
                  }}
                >
                  {(item.rate * 100).toFixed(1)}%
                </div>
                <div className="text-xs mt-1" style={{ color: colorsV2.text.tertiary }}>
                  达成率
                </div>
              </div>
            ))}
          </div>

          {/* 详细预测图表（全宽） */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: colorsV2.background.card }}>
            <h4
              className="font-medium mb-4"
              style={{
                fontSize: `${typographyV2.fontSize.h3}px`,
                color: colorsV2.text.primary,
              }}
            >
              {productOptions.find((o) => o.value === productFilter)?.label} - 月度累计达成预测
            </h4>
            <div
              className="flex items-center justify-center rounded"
              style={{
                height: '320px',
                backgroundColor: colorsV2.background.primary,
                border: `2px dashed ${colorsV2.background.separator}`,
              }}
            >
              <div className="text-center">
                <p
                  className="text-lg font-medium mb-2"
                  style={{
                    color: colorsV2.text.secondary,
                  }}
                >
                  [图表占位 - 累计目标线 vs 累计实际线]
                </p>
                <p
                  className="text-sm"
                  style={{
                    color: colorsV2.text.tertiary,
                  }}
                >
                  UniversalChart - hqPrediction
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 6. 扩展信息区 - 季度目标派生数据 */}
        <Card className="mb-7">
          <h3
            className="font-semibold mb-4"
            style={{
              fontSize: `${typographyV2.fontSize.h3}px`,
              color: colorsV2.text.primary,
            }}
          >
            季度目标派生数据
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { quarter: 'Q1', value: 2500 },
              { quarter: 'Q2', value: 3200 },
              { quarter: 'Q3', value: 3500 },
              { quarter: 'Q4', value: 3145 },
            ].map((item) => (
              <div
                key={item.quarter}
                className="p-4 rounded-lg text-center"
                style={{
                  backgroundColor: colorsV2.background.primary,
                }}
              >
                <div className="text-sm font-medium mb-2" style={{ color: colorsV2.text.secondary }}>
                  {item.quarter}
                </div>
                <div className="text-xl font-bold" style={{ color: colorsV2.text.primary }}>
                  {item.value.toLocaleString()} 万元
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 扩展信息区 - 下一步数据准备说明 */}
        <Card>
          <h3
            className="font-semibold mb-3"
            style={{
              fontSize: `${typographyV2.fontSize.h3}px`,
              color: colorsV2.text.primary,
            }}
          >
            下一步数据准备（严格口径）
          </h3>
          <ul className="space-y-2" style={{ color: colorsV2.text.secondary }}>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="text-sm">
                导入 2026 月度实际（或先录入年度实际再按权重拆月）后，达成率与时间进度达成率自动生效
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="text-sm">
                导入 2025 分月基线后，当月/当季/年累计增长率与增量自动点亮
              </span>
            </li>
          </ul>
          <div className="mt-4 flex gap-2">
            <Button variant="primary" size="sm">
              立即导入数据
            </Button>
            <Button variant="outline" size="sm">
              查看导入指南
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
