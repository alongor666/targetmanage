# QuarterlyProportionChart 使用指南

## 简介

`QuarterlyProportionChart`（季度占比规划图）是一个现代化的、可复用的 React 图表组件，用于展示季度占比规划数据和增长率分析。

## 特性

✨ **3种视图模式**: 占比视图 / 绝对值视图 / 增长率聚焦
🎨 **现代视觉设计**: 渐变配色、阴影效果、平滑动画
⚠️ **智能预警系统**: 优秀/正常/预警/危险 四级预警
🖱️ **交互式体验**: 点击柱状图查看详细数据
⚡ **性能优化**: useMemo/useCallback 优化渲染
🔒 **类型安全**: 完整的 TypeScript 类型定义

## 快速开始

### 1. 导入组件

```tsx
import { QuarterlyProportionChart } from '@/components/charts/QuarterlyProportionChart';
```

### 2. 准备数据

```tsx
const data = {
  // 2026季度目标值（长度为4的数组）
  quarterlyTargets: [1000, 1200, 1100, 1300],

  // 2025季度实际值（可能包含null）
  quarterlyActuals2025: [900, 1100, 1000, 1200],

  // 当前季度实际值（可能包含null）
  quarterlyCurrent: [950, 1150, 1050, 1250],

  // 2026年度总目标
  totalTarget: 4600,

  // 2025年度总实际
  totalActual2025: 4200,

  // 增长率数组（小数形式，如 0.15 表示 15%）
  growthSeries: [0.0556, 0.0455, 0.05, 0.0417],
};
```

### 3. 使用组件

```tsx
<QuarterlyProportionChart
  data={data}
  config={{
    height: 400,
    showDetailPanel: true,
    defaultViewMode: 'proportion',
  }}
  onQuarterClick={(quarter, detail) => {
    console.log('Selected quarter:', quarter, detail);
  }}
/>
```

## API 文档

### Props

| 属性 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| `data` | `QuarterlyProportionData` | ✅ | - | 季度占比数据 |
| `config` | `ChartConfig` | ❌ | `{}` | 图表配置选项 |
| `onQuarterClick` | `(quarter: number, detail: QuarterDetailData) => void` | ❌ | - | 季度点击回调 |
| `onViewModeChange` | `(viewMode: ViewMode) => void` | ❌ | - | 视图模式变化回调 |
| `className` | `string` | ❌ | - | 额外的CSS类名 |

### QuarterlyProportionData

```typescript
interface QuarterlyProportionData {
  quarterlyTargets: number[];              // 长度为4的季度目标值数组
  quarterlyActuals2025: (number | null)[]; // 长度为4的2025实际值数组
  quarterlyCurrent: (number | null)[];     // 长度为4的当前实际值数组
  totalTarget: number;                     // 2026年度总目标
  totalActual2025: number;                 // 2025年度总实际
  growthSeries: (number | null)[];         // 长度为4的增长率数组（小数）
}
```

### ChartConfig

```typescript
interface ChartConfig {
  height?: number;              // 图表高度（像素），默认 400
  showDetailPanel?: boolean;    // 是否显示详情面板，默认 true
  defaultViewMode?: ViewMode;   // 默认视图模式，默认 'proportion'
  animation?: boolean;          // 是否启用动画，默认 true
  barMaxWidth?: number;         // 柱状图最大宽度（像素），默认 60
  showDataLabel?: boolean;      // 是否显示数据标签，默认 true
}
```

### ViewMode

```typescript
type ViewMode = 'proportion' | 'absolute' | 'growth';
```

- `'proportion'`: 占比视图（显示百分比）
- `'absolute'`: 绝对值视图（显示实际数值）
- `'growth'`: 增长率聚焦视图（突出显示增长率）

## 视图模式说明

### 1. 占比视图 (proportion)

显示 2026 规划占比和 2025 实际占比的对比，以及增长率折线图。

**适用场景**: 分析各季度在全年中的占比变化

### 2. 绝对值视图 (absolute)

显示 2026 目标和 2025 实际的绝对值对比。

**适用场景**: 比较各季度的实际数值大小

### 3. 增长率视图 (growth)

突出显示增长率折线图，方便分析增长趋势。

**适用场景**: 重点关注增长率变化和预警信息

## 预警系统

组件根据增长率自动显示预警级别：

| 增长率 | 级别 | 颜色 | 说明 |
|--------|------|------|------|
| ≥ 15% | 优秀 | 🟢 绿色 | 表现优异 |
| 5% - 15% | 正常 | ⚫ 灰色 | 符合预期 |
| 0% - 5% | 预警 | 🟠 橙色 | 需要关注 |
| < 0% | 危险 | 🔴 红色 | 负增长，需要警惕 |

## 交互功能

### 1. 视图切换

点击顶部的视图模式按钮可以在三种视图模式之间切换。

### 2. 季度详情

点击图表中的柱状图，可以查看该季度的详细数据：

- 2026 目标值及占比
- 2025 实际值及占比
- 增长率及预警级别
- 当前实际值及达成率

### 3. Tooltip 悬停

悬停在图表元素上会显示详细的数据提示框。

## 样式定制

### 默认颜色

组件使用以下颜色方案：

```typescript
{
  target: {
    normal: '#dceef9',      // 目标柱正常颜色
    gradient: ['#dceef9', '#b0d8ef'],  // 渐变色
    hover: '#c5e3f7',       // 悬停颜色
  },
  actual: {
    normal: '#f2f2f2',      // 实际柱正常颜色
    hover: '#e5e5e5',       // 悬停颜色
  },
  growth: {
    line: '#0070c0',        // 增长率折线颜色
    positive: '#4caf50',    // 正增长颜色
    neutral: '#757575',     // 中性颜色
    negative: '#f44336',    // 负增长颜色
  },
  warning: {
    orange: '#ffc000',      // 预警颜色
    red: '#d32f2f',         // 危险颜色
  },
}
```

### 自定义样式

通过 `className` 属性可以添加额外的 CSS 类名：

```tsx
<QuarterlyProportionChart
  data={data}
  className="shadow-lg hover:shadow-xl transition-shadow"
/>
```

## 数据处理示例

### 从现有页面数据转换

如果你的数据已经在页面中计算好了，可以这样传递给组件：

```tsx
// src/app/page.tsx
import { QuarterlyProportionChart } from '@/components/charts/QuarterlyProportionChart';

function Page() {
  // 现有的计算逻辑
  const quarterlyTargets = monthlyToQuarterly(monthlyEstimateTargets);
  const quarterlyActuals2025 = monthlyToQuarterly(monthlyActualSeries2025);
  const quarterlyCurrent = monthlyToQuarterly(monthlyActualSeries2026);

  const totalTarget = kpi.annual;
  const totalActual2025 = quarterlyActuals2025.reduce((sum, v) => sum + (v ?? 0), 0);

  const growthSeries = quarterlyCurrent.map((current, idx) => {
    const baseline = quarterlyActuals2025[idx];
    if (baseline === null || current === null) return null;
    return (current - baseline) / baseline;
  });

  return (
    <QuarterlyProportionChart
      data={{
        quarterlyTargets,
        quarterlyActuals2025,
        quarterlyCurrent,
        totalTarget,
        totalActual2025,
        growthSeries,
      }}
    />
  );
}
```

## 性能优化

组件内置了以下性能优化：

1. **useMemo**: 缓存计算结果，避免不必要的重计算
2. **useCallback**: 稳定的事件处理函数引用
3. **条件渲染**: 按需显示详情面板
4. **动态导入**: ECharts 组件按需加载

## 故障排查

### 数据验证失败

如果看到"数据错误"提示，检查以下几点：

- `quarterlyTargets` 必须是长度为 4 的数组
- `quarterlyActuals2025` 和 `quarterlyCurrent` 必须是长度为 4 的数组，可以包含 `null`
- `totalTarget` 和 `totalActual2025` 必须是数字
- `growthSeries` 必须是长度为 4 的数组，可以包含 `null`

### 图表不显示

1. 确保已安装 `echarts` 和 `echarts-for-react` 依赖
2. 检查浏览器控制台是否有错误信息
3. 确认数据格式正确

## 完整示例

```tsx
'use client';

import { QuarterlyProportionChart } from '@/components/charts/QuarterlyProportionChart';

export default function ExamplePage() {
  const data = {
    quarterlyTargets: [1150, 1250, 1100, 1100],
    quarterlyActuals2025: [1050, 1120, 980, 1050],
    quarterlyCurrent: [1100, 1180, 1050, 1080],
    totalTarget: 4600,
    totalActual2025: 4200,
    growthSeries: [0.0476, 0.0536, 0.0714, 0.0286],
  };

  const config = {
    height: 450,
    showDetailPanel: true,
    defaultViewMode: 'proportion' as const,
    animation: true,
    barMaxWidth: 60,
    showDataLabel: true,
  };

  const handleQuarterClick = (quarter: number, detail: any) => {
    console.log(`选择了 ${detail.quarterLabel}`, detail);
    // 可以在这里处理点击事件，比如弹出模态框显示更多信息
  };

  const handleViewModeChange = (viewMode: string) => {
    console.log('视图模式切换为:', viewMode);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">季度占比规划图示例</h1>

      <QuarterlyProportionChart
        data={data}
        config={config}
        onQuarterClick={handleQuarterClick}
        onViewModeChange={handleViewModeChange}
        className="shadow-lg"
      />
    </div>
  );
}
```

## 更多信息

- 组件源码: `src/components/charts/QuarterlyProportionChart/`
- 类型定义: `QuarterlyProportionChart.types.ts`
- 主组件: `QuarterlyProportionChart.tsx`
- 数据处理 Hook: `hooks/useChartData.ts`
- 图表配置 Hook: `hooks/useChartConfig.ts`

---

**版本**: 1.0.0
**最后更新**: 2025-12-24
**维护者**: Development Team
