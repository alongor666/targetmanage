# ECharts 配置使用示例

本文档展示如何使用 `src/lib/echarts-utils.ts` 中的工具函数来创建符合设计规范的图表。

## 核心工具函数

### 1. X轴优化配置 `getOptimizedXAxisConfig()`

**功能**: 自动实现X轴标签45度倾斜 + 长文本截断（默认8字符）

**使用前**:
```typescript
// ❌ 旧方式：X轴标签重叠，难以阅读
const option = {
  xAxis: {
    type: 'category',
    data: ['成都本部', '天府新区', '高新技术开发区', '新都分公司'],
  },
  // ...
};
```

**使用后**:
```typescript
// ✅ 新方式：使用工具函数，自动优化
import { getOptimizedXAxisConfig } from '@/lib/echarts-utils';

const option = {
  xAxis: {
    ...getOptimizedXAxisConfig(8), // 8字符截断
    data: ['成都本部', '天府新区', '高新技术开发区', '新都分公司'],
    // 结果显示：成都本部, 天府新区, 高新技术开..., 新都分公司
  },
  // ...
};
```

**自定义截断长度**:
```typescript
// 截断至10个字符
const xAxisConfig = getOptimizedXAxisConfig(10);

// 截断至6个字符
const xAxisConfig = getOptimizedXAxisConfig(6);
```

---

### 2. 柱状图系列配置 `createBarSeries()`

**功能**: 快速创建标准柱状图配置，包含顶部标签、圆角、颜色

**基础用法**:
```typescript
import { createBarSeries } from '@/lib/echarts-utils';

const option = {
  series: [
    createBarSeries(
      '赔付率',              // 系列名称
      [45.2, 52.1, 38.9],   // 数据
      '#87ceeb',            // 颜色
      true                  // 显示顶部标签
    ),
  ],
};
```

**多系列组合**:
```typescript
import { createBarSeries, operatingOverviewColors } from '@/lib/echarts-utils';

const option = {
  series: [
    createBarSeries('赔付率', claimRateData, operatingOverviewColors.claimRateBar),
    createBarSeries('费用率', expenseRateData, operatingOverviewColors.expenseRateBar),
  ],
};
```

**隐藏标签**:
```typescript
// 第4个参数设为 false 可隐藏顶部数值标签
createBarSeries('系列名', data, '#ff0000', false);
```

---

### 3. 折线图系列配置 `createLineSeries()`

**功能**: 创建标准折线图配置，包含平滑曲线、数据点标记

**基础用法**:
```typescript
import { createLineSeries } from '@/lib/echarts-utils';

const option = {
  series: [
    createLineSeries(
      '达成率',              // 系列名称
      [92.5, 88.3, 95.1],   // 数据
      '#808080',            // 颜色
      true                  // 显示数据点标记
    ),
  ],
};
```

**组合图表（柱状图 + 折线图）**:
```typescript
import { createBarSeries, createLineSeries, operatingOverviewColors } from '@/lib/echarts-utils';

const option = {
  series: [
    // 柱状图
    createBarSeries('赔付率', claimRateData, operatingOverviewColors.claimRateBar),
    createBarSeries('费用率', expenseRateData, operatingOverviewColors.expenseRateBar),

    // 折线图（叠加）
    createLineSeries('达成率', achievementData, operatingOverviewColors.achievementLine),
  ],
};
```

---

### 4. 经营概览图表颜色 `operatingOverviewColors`

**功能**: 统一的经营概览图表配色方案（2025-12-21更新）

**标准配色**:
```typescript
import { operatingOverviewColors } from '@/lib/echarts-utils';

const colors = {
  claimRateBar: '#87ceeb',      // 赔付率柱状图 - 浅蓝色
  expenseRateBar: '#d3d3d3',    // 费用率柱状图 - 浅灰色
  achievementLine: '#808080',   // 达成率折线 - 深灰色
};
```

**完整示例**:
```typescript
import {
  getOptimizedXAxisConfig,
  createBarSeries,
  createLineSeries,
  operatingOverviewColors
} from '@/lib/echarts-utils';

const option = {
  xAxis: {
    ...getOptimizedXAxisConfig(8),
    data: orgNames,
  },
  yAxis: [
    { type: 'value', name: '率值（%）' },
    { type: 'value', name: '达成率（%）' },
  ],
  series: [
    createBarSeries('赔付率', claimRateData, operatingOverviewColors.claimRateBar),
    createBarSeries('费用率', expenseRateData, operatingOverviewColors.expenseRateBar),
    createLineSeries('达成率', achievementData, operatingOverviewColors.achievementLine),
  ],
};
```

---

## 完整实战示例

### 场景1: 机构业绩柱状图

```typescript
import {
  getOptimizedXAxisConfig,
  createBarSeries
} from '@/lib/echarts-utils';
import { colors } from '@/styles/tokens';

const orgPerformanceChart = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['目标', '实际'] },
  xAxis: {
    ...getOptimizedXAxisConfig(8),
    data: ['成都本部', '天府新区', '高新技术开发区', '新都分公司', '青羊区'],
  },
  yAxis: { type: 'value', name: '金额（万元）' },
  series: [
    createBarSeries('目标', [1200, 980, 1500, 750, 620], colors.chart.targetNormal),
    createBarSeries('实际', [1150, 1020, 1480, 690, 680], colors.status.good),
  ],
};
```

### 场景2: 经营概览组合图

```typescript
import {
  getOptimizedXAxisConfig,
  createBarSeries,
  createLineSeries,
  operatingOverviewColors
} from '@/lib/echarts-utils';

const operatingOverviewChart = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['赔付率', '费用率', '达成率'] },
  xAxis: {
    ...getOptimizedXAxisConfig(6),
    data: monthNames,
  },
  yAxis: [
    { type: 'value', name: '率值（%）', position: 'left' },
    { type: 'value', name: '达成率（%）', position: 'right' },
  ],
  series: [
    createBarSeries('赔付率', claimRateData, operatingOverviewColors.claimRateBar),
    createBarSeries('费用率', expenseRateData, operatingOverviewColors.expenseRateBar),
    {
      ...createLineSeries('达成率', achievementData, operatingOverviewColors.achievementLine),
      yAxisIndex: 1, // 使用右侧Y轴
    },
  ],
};
```

### 场景3: 趋势对比折线图

```typescript
import {
  getOptimizedXAxisConfig,
  createLineSeries
} from '@/lib/echarts-utils';
import { colors } from '@/styles/tokens';

const trendComparisonChart = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['2025年', '2026年'] },
  xAxis: {
    ...getOptimizedXAxisConfig(4),
    data: ['1月', '2月', '3月', '4月', '5月', '6月'],
  },
  yAxis: { type: 'value', name: '金额（万元）' },
  series: [
    createLineSeries('2025年', [820, 932, 901, 934, 1290, 1330], colors.text.muted),
    createLineSeries('2026年', [950, 1020, 1100, 1180, 1350, 1420], colors.status.good),
  ],
};
```

---

## 迁移指南

### 旧代码重构步骤

**步骤1**: 找到现有图表配置
```typescript
// 旧代码示例
const option = {
  xAxis: {
    type: 'category',
    data: orgNames,
    axisLabel: {
      rotate: 45,
      fontSize: 10,
    },
  },
  series: [
    {
      name: '赔付率',
      type: 'bar',
      data: claimRateData,
      itemStyle: { color: '#87ceeb' },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',
      },
    },
  ],
};
```

**步骤2**: 导入工具函数
```typescript
import {
  getOptimizedXAxisConfig,
  createBarSeries,
  operatingOverviewColors
} from '@/lib/echarts-utils';
```

**步骤3**: 重构配置
```typescript
const option = {
  xAxis: {
    ...getOptimizedXAxisConfig(8),
    data: orgNames,
  },
  series: [
    createBarSeries('赔付率', claimRateData, operatingOverviewColors.claimRateBar),
  ],
};
```

---

## 设计原则

### 1. X轴标签处理
- **默认倾斜角度**: 45度
- **默认截断长度**: 8个字符
- **长文本处理**: 自动添加省略号 `...`
- **强制显示**: `interval: 0` 确保所有标签可见

### 2. 颜色规范
- **赔付率**: `#87ceeb` (浅蓝色)
- **费用率**: `#d3d3d3` (浅灰色)
- **达成率**: `#808080` (深灰色)
- **其他颜色**: 使用 `src/styles/tokens.ts` 中的设计令牌

### 3. 数据标签
- **默认显示**: 柱状图顶部显示数值
- **格式**: `{c}%` (百分比) 或 `{c}` (数值)
- **字体**: 11px, 600字重
- **位置**: 柱状图顶部, 折线图数据点

### 4. 圆角与阴影
- **柱状图圆角**: `[4, 4, 0, 0]` (顶部圆角)
- **数据点大小**: 折线图标记点 6px
- **平滑曲线**: 折线图默认启用

---

## 常见问题

### Q1: 如何修改X轴截断长度？
```typescript
// 默认8字符
getOptimizedXAxisConfig()

// 自定义10字符
getOptimizedXAxisConfig(10)

// 自定义6字符
getOptimizedXAxisConfig(6)
```

### Q2: 如何隐藏柱状图顶部标签？
```typescript
createBarSeries('系列名', data, color, false); // 第4个参数设为false
```

### Q3: 如何在折线图上隐藏数据点？
```typescript
const series = createLineSeries('系列名', data, color, false); // 第4个参数设为false
```

### Q4: 如何使用自定义颜色？
```typescript
import { colors } from '@/styles/tokens';

createBarSeries('系列名', data, colors.status.good);
createLineSeries('系列名', data, colors.chart.progressLine);
```

### Q5: 如何创建双Y轴图表？
```typescript
const option = {
  yAxis: [
    { type: 'value', name: '率值（%）', position: 'left' },
    { type: 'value', name: '达成率（%）', position: 'right' },
  ],
  series: [
    createBarSeries('赔付率', data1, color1), // 默认使用左轴
    {
      ...createLineSeries('达成率', data2, color2),
      yAxisIndex: 1, // 指定使用右轴
    },
  ],
};
```

---

## 总结

使用 `echarts-utils.ts` 工具函数的好处：

✅ **统一规范**: 所有图表遵循相同的设计规范
✅ **减少代码**: 减少80%的重复配置代码
✅ **易于维护**: 修改设计规范只需更新工具函数
✅ **类型安全**: TypeScript类型检查确保参数正确
✅ **快速开发**: 快速创建符合规范的图表

**推荐实践**:
1. 所有新图表都使用工具函数
2. 逐步重构现有图表
3. 自定义需求在工具函数基础上扩展
4. 保持颜色使用与设计令牌一致
