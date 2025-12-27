# UI组件使用指南

本文档提供重构后的UI组件使用说明，帮助开发者快速集成最新的设计规范。

**最后更新**: 2025-12-27
**设计规范**: `UI重构原则.md`

---

## 📦 核心组件库

### 1. Button组件

**路径**: `src/components/ui/Button/Button.tsx`

**特性**:
- ✅ 主按钮悬停颜色使用设计token（#8a2220）
- ✅ 精确2px悬停上浮动画
- ✅ 语义化动画时长（duration-normal = 250ms）
- ✅ 4种变体：default、outline、ghost、link
- ✅ 3种尺寸：sm、md、lg

#### 使用示例

```tsx
import { Button } from '@/components/ui/Button/Button';

// 主按钮（红色主题）
<Button onClick={handleSubmit}>
  提交
</Button>

// 次按钮（轮廓样式）
<Button variant="outline" onClick={handleCancel}>
  取消
</Button>

// 幽灵按钮
<Button variant="ghost" size="sm">
  更多选项
</Button>

// 带图标
<Button leftIcon={<IconPlus />}>
  添加
</Button>

// 加载状态
<Button loading>
  加载中...
</Button>

// 禁用状态
<Button disabled>
  已禁用
</Button>
```

---

### 2. KpiCard组件

**路径**: `src/components/kpi/KpiCard.tsx`

**特性**:
- ✅ 毛玻璃效果（backdrop-blur-[20px]）
- ✅ 48px超大数值字号
- ✅ 精确2px悬停上浮
- ✅ 250ms标准动画时长
- ✅ 4种状态变体：default、good、warning、danger

#### 使用示例

```tsx
import { KpiCard } from '@/components/kpi/KpiCard';

// 基础用法
<KpiCard
  title="年度目标"
  value="12,345.67 万元"
/>

// 带状态和提示
<KpiCard
  title="时间进度达成率"
  value="95.2%"
  hint="距离目标还差 4.8%"
  variant="warning"
/>

// 优秀状态（绿色）
<KpiCard
  title="增长率"
  value="+15.3%"
  variant="good"
/>

// 危险状态（红色）
<KpiCard
  title="达成率"
  value="89.5%"
  variant="danger"
/>

// 可点击的卡片
<KpiCard
  title="查看详情"
  value="100%"
  onClick={() => router.push('/details')}
/>
```

---

### 3. FilterTag组件

**路径**: `src/components/filters/FilterTag.tsx`

**特性**:
- ✅ 维度颜色边框（6种维度专属颜色）
- ✅ 紧凑简洁设计
- ✅ 支持删除功能
- ✅ 悬停效果

#### 维度颜色映射

| 维度 | 颜色 | 十六进制 |
|------|------|----------|
| org (三级机构) | 蓝色 | #0070c0 |
| customer (客户类别) | 绿色 | #00b050 |
| business (业务类型) | 红色 | #ff0000 |
| energy (能源类型) | 浅蓝 | #5b9bd5 |
| renewal (续保状态) | 浅绿 | #a9d18e |
| terminal (终端来源) | 黄色 | #ffd966 |

#### 使用示例

```tsx
import { FilterTag } from '@/components/filters/FilterTag';

// 基础用法
<FilterTag
  label="成都本部"
  dimension="org"  // 蓝色边框
/>

// 可删除标签
<FilterTag
  label="商用车"
  dimension="business"  // 红色边框
  onRemove={() => handleRemove('商用车')}
/>

// 不同维度示例
<div className="flex flex-wrap gap-2">
  <FilterTag label="成都本部" dimension="org" />
  <FilterTag label="个人客户" dimension="customer" />
  <FilterTag label="商用车" dimension="business" />
  <FilterTag label="新能源" dimension="energy" />
  <FilterTag label="续保客户" dimension="renewal" />
  <FilterTag label="APP渠道" dimension="terminal" />
</div>
```

---

### 4. FilterDropdown组件

**路径**: `src/components/filters/FilterDropdown.tsx`

**特性**:
- ✅ 电商式下拉面板（类似淘宝/京东）
- ✅ 草稿模式（Draft → Applied）
- ✅ 支持搜索 + 批量勾选
- ✅ 全选/清空/取消/应用筛选
- ✅ 点击外部自动关闭
- ✅ 维度颜色标识

#### 使用示例

```tsx
import { FilterDropdown } from '@/components/filters/FilterDropdown';
import type { FilterOption } from '@/components/filters/FilterDropdown';

const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);

const orgOptions: FilterOption[] = [
  { value: 'sc_local_benbu', label: '成都本部' },
  { value: 'sc_local_tianfu', label: '天府' },
  { value: 'sc_local_gaoxin', label: '高新' },
  // ...更多选项
];

<FilterDropdown
  label="三级机构"
  dimension="org"  // 蓝色主题
  options={orgOptions}
  value={selectedOrgs}
  onChange={setSelectedOrgs}
  searchable
  placeholder="请选择机构"
/>

// 草稿模式工作流程：
// 1. 打开下拉 → 勾选值 → 点击"应用筛选" → 数据重算 → 关闭下拉
// 2. 草稿状态会保留，取消按钮会重置草稿
```

---

### 5. ChartContainer组件

**路径**: `src/components/charts/ChartContainer.tsx`

**特性**:
- ✅ 标准化图表容器
- ✅ 浅色玻璃质感背景
- ✅ 12px圆角 + 标准阴影
- ✅ 预设高度：sm(400px)、md(600px)、lg(600px)

#### 使用示例

```tsx
import { ChartContainer } from '@/components/charts/ChartContainer';
import ReactECharts from 'echarts-for-react';

// 基础用法
<ChartContainer title="月度目标分解">
  <ReactECharts option={chartOption} />
</ChartContainer>

// 带副标题
<ChartContainer
  title="经营概览趋势"
  subtitle="近12个月数据"
  height="lg"
>
  <ReactECharts option={chartOption} />
</ChartContainer>

// 自定义高度
<ChartContainer height={800}>
  <ReactECharts option={chartOption} />
</ChartContainer>
```

---

## 🎨 工具函数库

### echarts-utils工具函数

**路径**: `src/lib/echarts-utils.ts`

#### 1. X轴优化配置

**特性**:
- ✅ 倾斜45度避免标签重叠
- ✅ 字号10px节省空间
- ✅ 超长文本自动截断（8字符 + "..."）
- ✅ 强制显示所有标签（interval: 0）

```tsx
import { getOptimizedXAxisConfig } from '@/lib/echarts-utils';

const chartOption = {
  xAxis: {
    ...getOptimizedXAxisConfig(8),  // 8字符截断
    data: organizationNames,
  },
  // ...
};
```

#### 2. Y轴标准配置

```tsx
import { getStandardYAxisConfig } from '@/lib/echarts-utils';

const chartOption = {
  yAxis: getStandardYAxisConfig('保费（万元）'),
  // ...
};
```

#### 3. 网格配置

```tsx
import { getStandardGridConfig } from '@/lib/echarts-utils';

const chartOption = {
  grid: getStandardGridConfig(),  // 自动处理X轴倾斜后的底部空间
  // ...
};
```

#### 4. Tooltip标准配置

```tsx
import { getStandardTooltipConfig } from '@/lib/echarts-utils';

const chartOption = {
  tooltip: getStandardTooltipConfig(),
  // ...
};
```

#### 5. 图例标准配置

```tsx
import { getStandardLegendConfig } from '@/lib/echarts-utils';

const chartOption = {
  legend: getStandardLegendConfig('top'),  // 或 'bottom', 'left', 'right'
  // ...
};
```

#### 6. 柱状图系列创建

```tsx
import { createBarSeries } from '@/lib/echarts-utils';

const chartOption = {
  series: [
    createBarSeries('目标值', targetData, '#dceef9', true),
    createBarSeries('实际值', actualData, '#d3d3d3', true),
  ],
};
```

#### 7. 折线图系列创建

```tsx
import { createLineSeries } from '@/lib/echarts-utils';

const chartOption = {
  series: [
    createLineSeries('增长率', growthData, '#0070c0', 1),  // 右Y轴
  ],
};
```

#### 8. 完整图表示例

```tsx
import {
  getOptimizedXAxisConfig,
  getStandardYAxisConfig,
  getStandardGridConfig,
  getStandardTooltipConfig,
  createBarSeries,
  createLineSeries,
} from '@/lib/echarts-utils';

const chartOption = {
  grid: getStandardGridConfig(),
  tooltip: getStandardTooltipConfig(),
  xAxis: {
    ...getOptimizedXAxisConfig(8),
    data: monthLabels,
  },
  yAxis: [
    getStandardYAxisConfig('保费（万元）'),
    {
      ...getStandardYAxisConfig('增长率'),
      position: 'right',
    },
  ],
  series: [
    createBarSeries('目标', targetData, '#dceef9'),
    createLineSeries('增长率', growthData, '#0070c0', 1),
  ],
};
```

---

## 🎯 设计Token使用

**路径**: `src/styles/tokens.ts`

### 颜色系统

```tsx
import { colors } from '@/styles/tokens';

// 品牌色
colors.brand.primaryRed        // #a02724 主题红
colors.brand.primaryRedHover   // #8a2220 悬停红
colors.brand.teslaBlue         // #0070c0 特斯拉蓝

// 状态色
colors.status.good             // #00b050 优秀/绿色
colors.status.warning          // #ffc000 预警/橙色
colors.status.danger           // #c00000 危险/红色
colors.status.normal           // #666666 正常/灰色

// 维度颜色
colors.dimension.org           // #0070c0 机构/蓝色
colors.dimension.customer      // #00b050 客户/绿色
colors.dimension.business      // #ff0000 业务/红色
colors.dimension.energy        // #5b9bd5 能源/浅蓝
colors.dimension.renewal       // #a9d18e 续保/浅绿
colors.dimension.terminal      // #ffd966 终端/黄色
```

### 字体系统

```tsx
import { typography } from '@/styles/tokens';

typography.fontSize.xs         // 11px 辅助信息
typography.fontSize.sm         // 12px 小字
typography.fontSize.base       // 14px 正文
typography.fontSize.xxxl       // 48px KPI数值
```

### 间距系统

```tsx
import { spacing } from '@/styles/tokens';

spacing.xs                     // 4px
spacing.sm                     // 8px
spacing.md                     // 16px
spacing.lg                     // 24px
```

### 圆角系统

```tsx
import { radius } from '@/styles/tokens';

radius.sm                      // 8px 小圆角
radius.md                      // 12px 中圆角（标准卡片）
radius.lg                      // 16px 大圆角
```

### 阴影系统

```tsx
import { shadows } from '@/styles/tokens';

shadows.sm                     // 浅阴影
shadows.md                     // 标准阴影（卡片）
shadows.hover                  // 悬停阴影（蓝色光晕）
shadows.focus                  // 焦点阴影
```

---

## ✅ 最佳实践

### 1. 使用Button组件替代原生button

```tsx
// ❌ 旧代码
<button className="px-4 py-2 bg-red-600 text-white rounded">
  提交
</button>

// ✅ 新代码
<Button>提交</Button>
```

### 2. 使用设计Token而非硬编码

```tsx
// ❌ 旧代码
<div style={{ color: '#a02724' }}>标题</div>

// ✅ 新代码
<div style={{ color: colors.brand.primaryRed }}>标题</div>
```

### 3. 使用echarts-utils工具函数

```tsx
// ❌ 旧代码
xAxis: {
  type: 'category',
  data: labels,
  axisLabel: {
    rotate: 45,
    fontSize: 10,
  },
}

// ✅ 新代码
xAxis: {
  ...getOptimizedXAxisConfig(),
  data: labels,
}
```

### 4. 图表容器标准化

```tsx
// ❌ 旧代码
<div className="rounded-lg border p-4 bg-white">
  <ReactECharts option={option} />
</div>

// ✅ 新代码
<ChartContainer title="图表标题">
  <ReactECharts option={option} />
</ChartContainer>
```

---

## 🚨 常见问题

### Q: Button组件的悬停动画不生效？

A: 确保使用了正确的Tailwind类名，悬停动画是 `hover:-translate-y-[2px]`（精确2px），而非 `hover:-translate-y-0.5`。

### Q: FilterTag的颜色不正确？

A: 检查 `dimension` 属性是否正确映射到6种维度之一：org、customer、business、energy、renewal、terminal。

### Q: 图表X轴标签还是重叠？

A: 使用 `getOptimizedXAxisConfig()` 工具函数，它会自动45度倾斜并截断超长文本。

### Q: KpiCard的毛玻璃效果不显示？

A: 确保页面背景不是纯白色，毛玻璃效果需要背景才能看到模糊效果。使用 `bg-white/90 backdrop-blur-[20px]`。

---

## 📚 相关文档

- **UI重构原则.md** - 设计规范总纲
- **docs/design/全局设计规范.md** - 详细设计规范
- **docs/development/echarts-usage-examples.md** - ECharts使用示例

---

**维护者**: 开发团队
**版本**: 1.0.0
**更新日期**: 2025-12-27
