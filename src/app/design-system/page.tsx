'use client';

import React, { useState } from 'react';
import { KpiCard } from '@/components/kpi/KpiCard';
import { FilterSelector } from '@/components/filters/FilterSelector';
import { Section } from '@/components/layout/Section';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type ColumnDef } from '@/components/data/DataTable';

/**
 * 设计系统展示页面
 *
 * 展示所有新创建的组件及其使用方式
 */
// 示例数据类型
interface SampleData {
  id: string;
  name: string;
  status: 'good' | 'warning' | 'danger';
  value: number;
}

export default function DesignSystemPage() {
  const [product, setProduct] = useState<'total' | 'auto' | 'property'>('total');
  const [dimension, setDimension] = useState<'kpi' | 'org'>('kpi');

  // 示例数据
  const sampleData: SampleData[] = [
    { id: '1', name: '天府机构', status: 'good', value: 98.5 },
    { id: '2', name: '高新机构', status: 'warning', value: 92.3 },
    { id: '3', name: '新都机构', status: 'danger', value: 85.1 },
  ];

  // 表格列定义
  const columns: ColumnDef<SampleData>[] = [
    { header: '机构名称', accessorKey: 'name' },
    {
      header: '状态',
      cell: (row) => <Badge variant={row.status}>{row.status === 'good' ? '优秀' : row.status === 'warning' ? '预警' : '危险'}</Badge>,
    },
    { header: '达成率', cell: (row) => `${row.value}%` },
  ];

  return (
    <div className="min-h-screen bg-bg-secondary p-8">
      <div className="mx-auto max-w-content">
        {/* 页面标题 */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">设计系统组件库</h1>
          <p className="mt-2 text-text-secondary">
            展示所有可用的设计 token、组件和使用示例
          </p>
        </header>

        {/* 颜色系统展示 */}
        <Section title="设计 Token - 颜色系统" className="mb-6">
          <div className="space-y-6">
            {/* 品牌色 */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">品牌色</h3>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 rounded-lg bg-primary shadow-md"></div>
                  <span className="mt-2 text-xs text-text-secondary">主色红</span>
                  <code className="text-xs text-text-muted">bg-primary</code>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 rounded-lg bg-tesla shadow-md"></div>
                  <span className="mt-2 text-xs text-text-secondary">特斯拉蓝</span>
                  <code className="text-xs text-text-muted">bg-tesla</code>
                </div>
              </div>
            </div>

            {/* 状态色 */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">状态色</h3>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 rounded-lg bg-status-good shadow-md"></div>
                  <span className="mt-2 text-xs text-text-secondary">优秀</span>
                  <code className="text-xs text-text-muted">bg-status-good</code>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 rounded-lg bg-status-warning shadow-md"></div>
                  <span className="mt-2 text-xs text-text-secondary">预警</span>
                  <code className="text-xs text-text-muted">bg-status-warning</code>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 rounded-lg bg-status-danger shadow-md"></div>
                  <span className="mt-2 text-xs text-text-secondary">危险</span>
                  <code className="text-xs text-text-muted">bg-status-danger</code>
                </div>
              </div>
            </div>

            {/* 图表色 */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">图表专用色</h3>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 rounded-lg bg-chart-claim-rate shadow-md"></div>
                  <span className="mt-2 text-xs text-text-secondary">满期赔付率</span>
                  <code className="text-xs text-text-muted">bg-chart-claim-rate</code>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 rounded-lg bg-chart-expense-rate shadow-md"></div>
                  <span className="mt-2 text-xs text-text-secondary">费用率</span>
                  <code className="text-xs text-text-muted">bg-chart-expense-rate</code>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* KpiCard 组件展示 */}
        <Section title="KpiCard 组件" subtitle="显示KPI指标的卡片组件" className="mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="默认样式"
              value="12345.67"
            />
            <KpiCard
              title="优秀状态"
              value="98.5%"
              variant="good"
              hint="表现优秀"
            />
            <KpiCard
              title="预警状态"
              value="92.3%"
              variant="warning"
              hint="需要关注"
            />
            <KpiCard
              title="危险状态"
              value="85.1%"
              variant="danger"
              hint="需要改进"
            />
          </div>

          {/* 代码示例 */}
          <div className="mt-6 rounded-lg bg-bg-secondary p-4">
            <p className="mb-2 text-sm font-semibold text-text-primary">使用示例：</p>
            <pre className="overflow-x-auto text-xs text-text-secondary">
{`<KpiCard
  title="年度目标"
  value="12345.67 万元"
  variant="good"
  hint="提示文本"
/>`}
            </pre>
          </div>
        </Section>

        {/* FilterSelector 组件展示 */}
        <Section title="FilterSelector 组件" subtitle="筛选器下拉选择组件" className="mb-6">
          <div className="flex gap-4">
            <FilterSelector
              label="产品"
              value={product}
              onChange={setProduct}
              options={[
                { value: 'total', label: '汇总' },
                { value: 'auto', label: '车险' },
                { value: 'property', label: '财产险' },
              ]}
            />
            <FilterSelector
              label="维度"
              value={dimension}
              onChange={setDimension}
              options={[
                { value: 'kpi', label: 'KPI' },
                { value: 'org', label: '三级机构' },
              ]}
            />
            <FilterSelector
              label="禁用状态"
              value="disabled"
              onChange={() => {}}
              options={[{ value: 'disabled', label: '已禁用' }]}
              disabled
            />
          </div>

          <div className="mt-4 rounded-lg bg-bg-secondary p-4">
            <p className="text-sm text-text-primary">
              当前选择：<span className="font-semibold text-tesla">产品={product}</span>,{' '}
              <span className="font-semibold text-tesla">维度={dimension}</span>
            </p>
          </div>

          {/* 代码示例 */}
          <div className="mt-6 rounded-lg bg-bg-secondary p-4">
            <p className="mb-2 text-sm font-semibold text-text-primary">使用示例：</p>
            <pre className="overflow-x-auto text-xs text-text-secondary">
{`<FilterSelector
  label="产品"
  value={product}
  onChange={setProduct}
  options={[
    { value: 'total', label: '汇总' },
    { value: 'auto', label: '车险' },
  ]}
/>`}
            </pre>
          </div>
        </Section>

        {/* Section 组件展示 */}
        <Section
          title="Section 组件"
          subtitle="页面区块容器组件，提供统一的样式"
          className="mb-6"
        >
          <p className="text-sm text-text-secondary">
            Section 组件为页面提供统一的区块样式，包括圆角、边框、内边距和背景色。
            它支持可选的标题和副标题，内容区域可以自由定制。
          </p>

          <div className="mt-6 rounded-lg bg-bg-secondary p-4">
            <p className="mb-2 text-sm font-semibold text-text-primary">使用示例：</p>
            <pre className="overflow-x-auto text-xs text-text-secondary">
{`<Section title="区块标题" subtitle="区块副标题">
  <div>区块内容</div>
</Section>`}
            </pre>
          </div>
        </Section>

        {/* ChartContainer 组件展示 */}
        <Section title="ChartContainer 组件" subtitle="图表容器组件" className="mb-6">
          <div className="space-y-6">
            {/* 小尺寸 */}
            <ChartContainer title="小尺寸图表 (400px)" height="sm">
              <div className="flex h-full items-center justify-center rounded-lg bg-bg-secondary">
                <p className="text-text-muted">图表内容区域 - height=&quot;sm&quot;</p>
              </div>
            </ChartContainer>

            {/* 中等尺寸 */}
            <ChartContainer
              title="中等尺寸图表 (600px)"
              subtitle="默认高度"
              height="md"
            >
              <div className="flex h-full items-center justify-center rounded-lg bg-bg-secondary">
                <p className="text-text-muted">图表内容区域 - height=&quot;md&quot; (默认)</p>
              </div>
            </ChartContainer>

            {/* 自定义尺寸 */}
            <ChartContainer title="自定义尺寸图表 (300px)" height={300}>
              <div className="flex h-full items-center justify-center rounded-lg bg-bg-secondary">
                <p className="text-text-muted">图表内容区域 - height={300}</p>
              </div>
            </ChartContainer>
          </div>

          {/* 代码示例 */}
          <div className="mt-6 rounded-lg bg-bg-secondary p-4">
            <p className="mb-2 text-sm font-semibold text-text-primary">使用示例：</p>
            <pre className="overflow-x-auto text-xs text-text-secondary">
{`<ChartContainer
  title="月度目标分解"
  height="lg"
>
  <ReactECharts option={chartOption} />
</ChartContainer>`}
            </pre>
          </div>
        </Section>

        {/* Tailwind 工具类展示 */}
        <Section title="Tailwind 工具类展示" className="mb-6">
          <div className="space-y-4">
            {/* 间距 */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">间距系统</h3>
              <div className="flex gap-2">
                <div className="rounded bg-tesla p-xs text-xs text-white">p-xs (4px)</div>
                <div className="rounded bg-tesla p-sm text-xs text-white">p-sm (8px)</div>
                <div className="rounded bg-tesla p-md text-xs text-white">p-md (16px)</div>
                <div className="rounded bg-tesla p-lg text-xs text-white">p-lg (24px)</div>
              </div>
            </div>

            {/* 圆角 */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">圆角系统</h3>
              <div className="flex gap-2">
                <div className="h-16 w-16 bg-primary rounded-sm"></div>
                <div className="h-16 w-16 bg-primary rounded-md"></div>
                <div className="h-16 w-16 bg-primary rounded-lg"></div>
                <div className="h-16 w-16 bg-primary rounded-xl"></div>
              </div>
              <div className="mt-2 flex gap-2 text-xs text-text-secondary">
                <span className="w-16 text-center">sm</span>
                <span className="w-16 text-center">md</span>
                <span className="w-16 text-center">lg</span>
                <span className="w-16 text-center">xl</span>
              </div>
            </div>

            {/* 阴影 */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">阴影系统</h3>
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-lg bg-white shadow-sm"></div>
                <div className="h-16 w-16 rounded-lg bg-white shadow-md"></div>
                <div className="h-16 w-16 rounded-lg bg-white shadow-lg"></div>
                <div className="h-16 w-16 rounded-lg bg-white shadow-xl"></div>
              </div>
              <div className="mt-2 flex gap-4 text-xs text-text-secondary">
                <span className="w-16 text-center">sm</span>
                <span className="w-16 text-center">md</span>
                <span className="w-16 text-center">lg</span>
                <span className="w-16 text-center">xl</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Badge 组件展示 */}
        <Section title="Badge 组件" subtitle="状态徽章和标签组件" className="mb-6">
          <div className="space-y-6">
            {/* 不同变体 */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">变体样式</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>默认</Badge>
                <Badge variant="good">优秀</Badge>
                <Badge variant="warning">预警</Badge>
                <Badge variant="danger">危险</Badge>
                <Badge variant="info">信息</Badge>
              </div>
            </div>

            {/* 不同尺寸 */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">尺寸</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge size="sm">小</Badge>
                <Badge size="md">中</Badge>
                <Badge size="lg">大</Badge>
              </div>
            </div>

            {/* 轮廓样式 */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">轮廓样式</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="good" outline>优秀</Badge>
                <Badge variant="warning" outline>预警</Badge>
                <Badge variant="danger" outline>危险</Badge>
                <Badge variant="info" outline>信息</Badge>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-bg-secondary p-4">
            <p className="mb-2 text-sm font-semibold text-text-primary">使用示例：</p>
            <pre className="overflow-x-auto text-xs text-text-secondary">
{`<Badge variant="good">优秀</Badge>
<Badge variant="warning" outline>预警</Badge>
<Badge size="lg">大尺寸</Badge>`}
            </pre>
          </div>
        </Section>

        {/* EmptyState 组件展示 */}
        <Section title="EmptyState 组件" subtitle="空状态占位组件" className="mb-6">
          <div className="space-y-6">
            {/* 基础空状态 */}
            <div className="rounded-lg border border-border-light">
              <EmptyState
                title="暂无数据"
                description="当前没有可显示的内容"
              />
            </div>

            {/* 带操作按钮 */}
            <div className="rounded-lg border border-border-light">
              <EmptyState
                title="暂无机构数据"
                description="请先导入机构数据以开始使用"
                action={
                  <button className="rounded-sm bg-tesla px-4 py-2 text-sm text-text-inverse hover:opacity-90">
                    导入数据
                  </button>
                }
              />
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-bg-secondary p-4">
            <p className="mb-2 text-sm font-semibold text-text-primary">使用示例：</p>
            <pre className="overflow-x-auto text-xs text-text-secondary">
{`<EmptyState
  title="暂无数据"
  description="当前没有可显示的内容"
  action={<button>导入数据</button>}
/>`}
            </pre>
          </div>
        </Section>

        {/* LoadingState 组件展示 */}
        <Section title="LoadingState 组件" subtitle="加载状态组件" className="mb-6">
          <div className="space-y-6">
            {/* 不同尺寸 */}
            <div className="rounded-lg border border-border-light">
              <LoadingState size="sm" text="加载中..." />
            </div>
            <div className="rounded-lg border border-border-light">
              <LoadingState size="md" text="正在加载数据..." />
            </div>
            <div className="rounded-lg border border-border-light">
              <LoadingState size="lg" text="正在处理大量数据..." />
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-bg-secondary p-4">
            <p className="mb-2 text-sm font-semibold text-text-primary">使用示例：</p>
            <pre className="overflow-x-auto text-xs text-text-secondary">
{`<LoadingState text="正在加载数据..." />
<LoadingState size="lg" text="处理中..." />
<LoadingState fullscreen text="系统初始化..." />`}
            </pre>
          </div>
        </Section>

        {/* DataTable 组件展示 */}
        <Section title="DataTable 组件" subtitle="通用数据表格组件" className="mb-6">
          <DataTable
            data={sampleData}
            columns={columns}
            getRowKey={(row) => row.id}
            hover
          />

          <div className="mt-6 rounded-lg bg-bg-secondary p-4">
            <p className="mb-2 text-sm font-semibold text-text-primary">使用示例：</p>
            <pre className="overflow-x-auto text-xs text-text-secondary">
{`interface SampleData {
  id: string;
  name: string;
  status: 'good' | 'warning' | 'danger';
}

const columns: ColumnDef<SampleData>[] = [
  { header: '机构名称', accessorKey: 'name' },
  {
    header: '状态',
    cell: (row) => <Badge variant={row.status}>...</Badge>,
  },
];

<DataTable
  data={sampleData}
  columns={columns}
  getRowKey={(row) => row.id}
  hover
/>`}
            </pre>
          </div>
        </Section>

        {/* 文档链接 */}
        <Section title="文档资源">
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">
              📚 完整文档请查看：
            </p>
            <ul className="ml-6 list-disc space-y-1 text-sm text-text-secondary">
              <li>
                <code className="text-xs">docs/设计系统快速参考.md</code> - 快速参考手册
              </li>
              <li>
                <code className="text-xs">docs/全局设计规范.md</code> - 详细设计规范
              </li>
              <li>
                <code className="text-xs">src/styles/tokens.ts</code> - TypeScript 设计 token
              </li>
            </ul>
          </div>
        </Section>
      </div>
    </div>
  );
}
