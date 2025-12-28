'use client';

/**
 * 切换按钮演示页面
 *
 * 展示统一的切换按钮设计规范：
 * - 选中：蓝色字 + 蓝色边框，无背景
 * - 未选中：灰色字 + 灰色边框，无背景
 */

import React, { useState } from 'react';
import { Navbar, Card, Button, ToggleButton, ToggleButtonGroup } from '@/components/v2';
import { ViewSwitcher } from '@/components/charts/QuarterlyProportionChart/components/ViewSwitcher';
import type { ViewMode } from '@/components/charts/QuarterlyProportionChart/QuarterlyProportionChart.types';
import { colorsV2, typographyV2 } from '@/styles/design-tokens-v2';

export default function ToggleDemoPage() {
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [selectedProduct, setSelectedProduct] = useState<string>('auto');
  const [selectedViewMode, setSelectedViewMode] = useState<ViewMode>('proportion');
  const [selectedTab, setSelectedTab] = useState<string>('overview');

  return (
    <div style={{ backgroundColor: colorsV2.background.primary, minHeight: '100vh' }}>
      <Navbar
        title="切换按钮演示"
        links={[
          { label: '首页', href: '/' },
          { label: '设计系统', href: '/design-system' },
          { label: '切换按钮', href: '/toggle-demo' },
        ]}
      />

      <div className="container mx-auto px-6 py-8" style={{ maxWidth: '1200px' }}>
        {/* 标题 */}
        <div className="mb-8">
          <h1
            style={{
              fontSize: `${typographyV2.fontSize.h1}px`,
              fontWeight: typographyV2.fontWeight.bold,
              color: colorsV2.text.primary,
              marginBottom: '8px',
            }}
          >
            切换按钮设计规范
          </h1>
          <p style={{ color: colorsV2.text.secondary, fontSize: `${typographyV2.fontSize.body}px` }}>
            统一的切换按钮样式：选中 = 蓝色字 + 蓝色边框，未选中 = 灰色字 + 灰色边框，无背景色
          </p>
        </div>

        {/* 1. 单个切换按钮 */}
        <Card className="mb-6">
          <h2
            className="mb-4"
            style={{
              fontSize: `${typographyV2.fontSize.h2}px`,
              fontWeight: typographyV2.fontWeight.semibold,
              color: colorsV2.text.primary,
            }}
          >
            1. 单个切换按钮（ToggleButton）
          </h2>

          <div className="space-y-6">
            {/* 基础用法 */}
            <div>
              <div className="text-sm mb-2" style={{ color: colorsV2.text.secondary }}>
                基础用法：
              </div>
              <div className="flex gap-4">
                <ToggleButton selected={false}>未选中</ToggleButton>
                <ToggleButton selected={true}>选中</ToggleButton>
                <ToggleButton selected={false} disabled>
                  禁用
                </ToggleButton>
              </div>
            </div>

            {/* 带图标 */}
            <div>
              <div className="text-sm mb-2" style={{ color: colorsV2.text.secondary }}>
                带图标：
              </div>
              <div className="flex gap-4">
                <ToggleButton selected={false} icon="📊">
                  未选中
                </ToggleButton>
                <ToggleButton selected={true} icon="✅">
                  选中
                </ToggleButton>
              </div>
            </div>

            {/* 不同尺寸 */}
            <div>
              <div className="text-sm mb-2" style={{ color: colorsV2.text.secondary }}>
                不同尺寸（sm / md / lg）：
              </div>
              <div className="flex gap-4 items-end">
                <ToggleButton selected={true} size="sm">
                  Small
                </ToggleButton>
                <ToggleButton selected={true} size="md">
                  Medium
                </ToggleButton>
                <ToggleButton selected={true} size="lg">
                  Large
                </ToggleButton>
              </div>
            </div>
          </div>
        </Card>

        {/* 2. 切换按钮组 */}
        <Card className="mb-6">
          <h2
            className="mb-4"
            style={{
              fontSize: `${typographyV2.fontSize.h2}px`,
              fontWeight: typographyV2.fontWeight.semibold,
              color: colorsV2.text.primary,
            }}
          >
            2. 切换按钮组（ToggleButtonGroup）
          </h2>

          <div className="space-y-6">
            {/* 产品选择 */}
            <div>
              <div className="text-sm mb-2" style={{ color: colorsV2.text.secondary }}>
                产品选择：
              </div>
              <ToggleButtonGroup
                value={selectedProduct}
                options={[
                  { value: 'auto', label: '车险' },
                  { value: 'property', label: '财产险' },
                  { value: 'life', label: '寿险' },
                  { value: 'health', label: '健康险' },
                  { value: 'total', label: '合计' },
                ]}
                onChange={setSelectedProduct}
              />
            </div>

            {/* 尺寸选择 */}
            <div>
              <div className="text-sm mb-2" style={{ color: colorsV2.text.secondary }}>
                尺寸选择（带图标）：
              </div>
              <ToggleButtonGroup
                value={selectedSize}
                options={[
                  { value: 'sm', label: 'Small', icon: '📏' },
                  { value: 'md', label: 'Medium', icon: '📐' },
                  { value: 'lg', label: 'Large', icon: '📊' },
                ]}
                onChange={setSelectedSize}
              />
            </div>

            {/* 标签页式 */}
            <div>
              <div className="text-sm mb-2" style={{ color: colorsV2.text.secondary }}>
                标签页式：
              </div>
              <ToggleButtonGroup
                value={selectedTab}
                options={[
                  { value: 'overview', label: '总览', icon: '📊' },
                  { value: 'detail', label: '详情', icon: '📋' },
                  { value: 'chart', label: '图表', icon: '📈' },
                  { value: 'table', label: '表格', icon: '📄' },
                ]}
                onChange={setSelectedTab}
              />
            </div>
          </div>
        </Card>

        {/* 3. ViewSwitcher 组件 */}
        <Card className="mb-6">
          <h2
            className="mb-4"
            style={{
              fontSize: `${typographyV2.fontSize.h2}px`,
              fontWeight: typographyV2.fontWeight.semibold,
              color: colorsV2.text.primary,
            }}
          >
            3. 视图切换器（ViewSwitcher）
          </h2>

          <div className="space-y-6">
            {/* Buttons 样式 */}
            <div>
              <div className="text-sm mb-2" style={{ color: colorsV2.text.secondary }}>
                Buttons 样式：
              </div>
              <ViewSwitcher
                currentMode={selectedViewMode}
                onChange={setSelectedViewMode}
                variant="buttons"
              />
            </div>

            {/* Tabs 样式 */}
            <div>
              <div className="text-sm mb-2" style={{ color: colorsV2.text.secondary }}>
                Tabs 样式：
              </div>
              <ViewSwitcher
                currentMode={selectedViewMode}
                onChange={setSelectedViewMode}
                variant="tabs"
              />
            </div>

            {/* Segment 样式 */}
            <div>
              <div className="text-sm mb-2" style={{ color: colorsV2.text.secondary }}>
                Segment 样式：
              </div>
              <ViewSwitcher
                currentMode={selectedViewMode}
                onChange={setSelectedViewMode}
                variant="segment"
              />
            </div>

            {/* 不同尺寸 */}
            <div>
              <div className="text-sm mb-2" style={{ color: colorsV2.text.secondary }}>
                不同尺寸（Small）：
              </div>
              <ViewSwitcher
                currentMode={selectedViewMode}
                onChange={setSelectedViewMode}
                variant="buttons"
                size="sm"
              />
            </div>

            <div>
              <div className="text-sm mb-2" style={{ color: colorsV2.text.secondary }}>
                不同尺寸（Large）：
              </div>
              <ViewSwitcher
                currentMode={selectedViewMode}
                onChange={setSelectedViewMode}
                variant="buttons"
                size="lg"
              />
            </div>
          </div>
        </Card>

        {/* 4. 操作按钮（Action Buttons） */}
        <Card className="mb-6">
          <h2
            className="mb-4"
            style={{
              fontSize: `${typographyV2.fontSize.h2}px`,
              fontWeight: typographyV2.fontWeight.semibold,
              color: colorsV2.text.primary,
            }}
          >
            4. 操作按钮（Button）
          </h2>

          <div className="space-y-6">
            {/* 不同变体 */}
            <div>
              <div className="text-sm mb-2" style={{ color: colorsV2.text.secondary }}>
                不同变体（primary / secondary / outline / ghost）：
              </div>
              <div className="flex gap-4 flex-wrap">
                <Button variant="primary" size="md">
                  主按钮
                </Button>
                <Button variant="secondary" size="md">
                  次要按钮
                </Button>
                <Button variant="outline" size="md">
                  轮廓按钮
                </Button>
                <Button variant="ghost" size="md">
                  幽灵按钮
                </Button>
              </div>
            </div>

            {/* 不同尺寸 */}
            <div>
              <div className="text-sm mb-2" style={{ color: colorsV2.text.secondary }}>
                不同尺寸（sm / md / lg）：
              </div>
              <div className="flex gap-4 items-end">
                <Button variant="primary" size="sm">
                  Small
                </Button>
                <Button variant="primary" size="md">
                  Medium
                </Button>
                <Button variant="primary" size="lg">
                  Large
                </Button>
              </div>
            </div>

            {/* 实际应用示例 */}
            <div>
              <div className="text-sm mb-2" style={{ color: colorsV2.text.secondary }}>
                实际应用（操作按钮组）：
              </div>
              <div className="flex gap-2">
                <Button variant="primary" size="sm">
                  刷新数据
                </Button>
                <Button variant="outline" size="sm">
                  导出数据
                </Button>
                <Button variant="outline" size="sm">
                  清空缓存
                </Button>
              </div>
            </div>

            {/* 加载和禁用状态 */}
            <div>
              <div className="text-sm mb-2" style={{ color: colorsV2.text.secondary }}>
                特殊状态：
              </div>
              <div className="flex gap-4">
                <Button variant="primary" disabled>
                  禁用按钮
                </Button>
                <Button variant="primary" loading>
                  加载中
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* 5. 设计规范说明 */}
        <Card>
          <h2
            className="mb-4"
            style={{
              fontSize: `${typographyV2.fontSize.h2}px`,
              fontWeight: typographyV2.fontWeight.semibold,
              color: colorsV2.text.primary,
            }}
          >
            4. 设计规范
          </h2>

          <div className="space-y-4">
            {/* 切换按钮规范 */}
            <div>
              <h3
                className="mb-3"
                style={{
                  fontSize: `${typographyV2.fontSize.h3}px`,
                  fontWeight: typographyV2.fontWeight.semibold,
                  color: colorsV2.text.primary,
                }}
              >
                切换按钮（Toggle Buttons）
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 选中状态 */}
                <div
                  className="p-4 rounded"
                  style={{
                    border: '1px solid',
                    borderColor: colorsV2.primary.blue,
                    backgroundColor: 'rgba(0, 123, 255, 0.02)',
                  }}
                >
                  <h4
                    className="mb-2"
                    style={{
                      fontSize: `${typographyV2.fontSize.body}px`,
                      fontWeight: typographyV2.fontWeight.medium,
                      color: colorsV2.primary.blue,
                    }}
                  >
                    ✅ 选中状态
                  </h4>
                  <ul className="space-y-1 text-sm" style={{ color: colorsV2.text.secondary }}>
                    <li>• 文字颜色：#007BFF（蓝色）</li>
                    <li>• 边框颜色：#007BFF（蓝色）</li>
                    <li>• 背景颜色：透明</li>
                    <li>• 边框宽度：1px</li>
                    <li>• 圆角：4px</li>
                  </ul>
                </div>

                {/* 未选中状态 */}
                <div
                  className="p-4 rounded"
                  style={{
                    border: '1px solid',
                    borderColor: colorsV2.background.separator,
                    backgroundColor: 'rgba(233, 236, 239, 0.1)',
                  }}
                >
                  <h4
                    className="mb-2"
                    style={{
                      fontSize: `${typographyV2.fontSize.body}px`,
                      fontWeight: typographyV2.fontWeight.medium,
                      color: colorsV2.text.secondary,
                    }}
                  >
                    ⚪ 未选中状态
                  </h4>
                  <ul className="space-y-1 text-sm" style={{ color: colorsV2.text.secondary }}>
                    <li>• 文字颜色：#6C757D（灰色）</li>
                    <li>• 边框颜色：#E9ECEF（浅灰）</li>
                    <li>• 背景颜色：透明</li>
                    <li>• 边框宽度：1px</li>
                    <li>• 圆角：4px</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 操作按钮规范 */}
            <div>
              <h3
                className="mb-3"
                style={{
                  fontSize: `${typographyV2.fontSize.h3}px`,
                  fontWeight: typographyV2.fontWeight.semibold,
                  color: colorsV2.text.primary,
                }}
              >
                操作按钮（Action Buttons）
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary 按钮 */}
                <div
                  className="p-4 rounded"
                  style={{
                    border: '1px solid',
                    borderColor: 'rgb(37, 99, 235)',
                    backgroundColor: 'rgba(37, 99, 235, 0.02)',
                  }}
                >
                  <h4
                    className="mb-2"
                    style={{
                      fontSize: `${typographyV2.fontSize.body}px`,
                      fontWeight: typographyV2.fontWeight.medium,
                      color: 'rgb(37, 99, 235)',
                    }}
                  >
                    🔵 Primary 按钮
                  </h4>
                  <ul className="space-y-1 text-sm" style={{ color: colorsV2.text.secondary }}>
                    <li>• 文字颜色：rgb(37, 99, 235)</li>
                    <li>• 边框颜色：rgb(37, 99, 235)</li>
                    <li>• 背景颜色：透明</li>
                    <li>• 用途：主要操作（刷新数据）</li>
                  </ul>
                </div>

                {/* Outline 按钮 */}
                <div
                  className="p-4 rounded"
                  style={{
                    border: '1px solid',
                    borderColor: 'rgb(209, 213, 219)',
                    backgroundColor: 'rgba(209, 213, 219, 0.1)',
                  }}
                >
                  <h4
                    className="mb-2"
                    style={{
                      fontSize: `${typographyV2.fontSize.body}px`,
                      fontWeight: typographyV2.fontWeight.medium,
                      color: 'rgb(75, 85, 99)',
                    }}
                  >
                    ⚫ Outline 按钮
                  </h4>
                  <ul className="space-y-1 text-sm" style={{ color: colorsV2.text.secondary }}>
                    <li>• 文字颜色：rgb(75, 85, 99)</li>
                    <li>• 边框颜色：rgb(209, 213, 219)</li>
                    <li>• 背景颜色：透明</li>
                    <li>• 用途：次要操作（导出、清空）</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 其他状态 */}
            <div>
              <h3
                className="mb-2"
                style={{
                  fontSize: `${typographyV2.fontSize.h3}px`,
                  fontWeight: typographyV2.fontWeight.medium,
                  color: colorsV2.text.primary,
                }}
              >
                其他交互状态
              </h3>
              <ul className="space-y-1 text-sm" style={{ color: colorsV2.text.secondary }}>
                <li>
                  <strong>悬停（Hover）：</strong>边框和文字颜色加深（选中时更深的蓝色，未选中时更深的灰色）
                </li>
                <li>
                  <strong>激活（Active）：</strong>按钮轻微缩放（scale: 0.98）
                </li>
                <li>
                  <strong>禁用（Disabled）：</strong>透明度降低至 40%，不可交互
                </li>
                <li>
                  <strong>过渡动画：</strong>所有状态变化使用 150ms 的平滑过渡
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
