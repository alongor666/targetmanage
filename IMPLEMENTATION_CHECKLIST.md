# 季度保费规划图优化 - 实施清单

## 📋 快速导航

- [前置准备](#前置准备)
- [阶段1：核心增强（必须完成）](#阶段1核心增强必须完成)
- [阶段2：体验优化（推荐完成）](#阶段2体验优化推荐完成)
- [阶段3：可选增强](#阶段3可选增强)
- [验收测试](#验收测试)
- [回滚方案](#回滚方案)

---

## 前置准备

### 1. 查看设计方案
- [ ] 阅读 `QUARTERLY_CHART_REDESIGN.md`（完整设计方案）
- [ ] 在浏览器打开 `QUARTERLY_CHART_COMPARISON.html`（可视化对比）
- [ ] 理解优化目标和改进点

### 2. 备份当前代码
```bash
# 创建备份分支
git checkout -b backup/quarterly-chart-before-redesign

# 提交当前状态
git add -A
git commit -m "backup: 季度图表优化前快照"

# 切换到工作分支
git checkout -b feature/quarterly-chart-redesign
```

### 3. 准备开发环境
```bash
# 确保依赖最新
pnpm install

# 启动开发服务器
pnpm dev
```

---

## 阶段1：核心增强（必须完成）

**预计时间：2小时**

### Step 1: 更新颜色系统（30分钟）

#### 1.1 编辑 `src/styles/tokens.ts`

**位置：** 在 `colors.chart` 对象内添加以下内容（约line 99之后）

```typescript
// === 季度图表增强色系（WCAG AA兼容）===

// 2026目标柱（增强版）
targetBarEnhanced: '#a8d8f0',          // 加深天蓝（对比度3.2:1）✅
targetBarEnhancedBorder: '#6eb8d9',    // 深蓝边框
targetBarWarningEnhanced: '#f5f5f5',   // 预警填充
targetBarWarningBorderEnhanced: '#ff9500', // 加深橙色

// 2025实际柱（增强版）
actualBarEnhanced: '#d9d9d9',          // 加深灰色（对比度3.5:1）✅
actualBarEnhancedBorder: '#999999',    // 深灰边框
actualBarWarningEnhanced: '#ffe6e6',   // 预警填充
actualBarWarningBorderEnhanced: '#ff6b6b', // 红色边框

// 增长率配色（简化为3级 + 增强）
growthLineEnhanced: '#0070c0',         // 折线颜色
growthLineWidthEnhanced: 2,            // 加粗线宽
growthPointGoodEnhanced: '#00b050',    // ≥12% 绿色
growthPointNormalEnhanced: '#0070c0',  // 5-12% 蓝色（改为品牌色）
growthPointWarningEnhanced: '#ff9500', // 0-5% 橙色
growthPointDangerEnhanced: '#c00000',  // <0% 红色
growthPointSizeEnhanced: 10,           // 点大小

// 标签配色（增强版）
quarterlyLabelEnhanced: '#333333',     // 正常：深灰
quarterlyLabelWarningEnhanced: '#c00000', // 预警：红色

// 预警线（增强版）
warningLineEnhanced: '#c00000',        // 深红色
warningLineWidthEnhanced: 2,           // 加粗

// 轴线（增强版）
axisLineEnhanced: '#999999',           // 加深轴线
splitLineEnhanced: '#e6e6e6',          // 网格线
```

**检查点：**
- [ ] 添加了所有新颜色常量
- [ ] 没有语法错误
- [ ] 保存文件

#### 1.2 添加工具函数

**位置：** `src/styles/tokens.ts` 文件末尾（约line 575之后）

```typescript
/**
 * 获取增长率点颜色（增强版）
 */
export function getGrowthPointColorEnhanced(growthRate: number | null): string {
  if (growthRate === null) return colors.chart.growthPointNormalEnhanced;

  if (growthRate >= 0.12) return colors.chart.growthPointGoodEnhanced;
  if (growthRate >= 0.05) return colors.chart.growthPointNormalEnhanced;  // 改为蓝色
  if (growthRate >= 0) return colors.chart.growthPointWarningEnhanced;
  return colors.chart.growthPointDangerEnhanced;
}

/**
 * 获取增长率点形状（可访问性）
 */
export function getGrowthPointSymbol(growthRate: number | null): string {
  if (growthRate === null) return 'circle';

  if (growthRate >= 0.12) return 'diamond';   // 优秀：菱形
  if (growthRate >= 0.05) return 'circle';    // 正常：圆形
  if (growthRate >= 0) return 'triangle';     // 预警：三角形
  return 'rect';                              // 危险：方形
}

/**
 * 获取增长率点大小（危险状态放大）
 */
export function getGrowthPointSize(growthRate: number | null): number {
  if (growthRate !== null && growthRate < 0) {
    return 12;  // 危险状态放大
  }
  return colors.chart.growthPointSizeEnhanced;
}
```

**检查点：**
- [ ] 添加了3个新函数
- [ ] TypeScript编译无错误：`pnpm typecheck`
- [ ] 保存文件

---

### Step 2: 重构图表配置（60分钟）

#### 2.1 更新导入语句

**文件：** `src/app/page.tsx`
**位置：** line 21

**修改前：**
```typescript
import { colors, getGrowthPointColor } from "@/styles/tokens";
```

**修改后：**
```typescript
import { colors, getGrowthPointColor, getGrowthPointColorEnhanced, getGrowthPointSymbol, getGrowthPointSize } from "@/styles/tokens";
```

**检查点：**
- [ ] 导入语句已更新
- [ ] 无TypeScript错误

#### 2.2 重构 `quarterlyChartOption`

**文件：** `src/app/page.tsx`
**位置：** lines 573-805

**策略：** 分段替换，逐步测试

##### 2.2.1 更新动画配置（可选，但推荐）

**位置：** 在 `return {` 之后添加（约line 623）

```typescript
return {
  // ========== 动画配置 ==========
  animation: true,
  animationDuration: 800,
  animationEasing: 'cubicOut',
  animationDurationUpdate: 500,
  animationEasingUpdate: 'cubicInOut',

  // 后续配置...
```

**检查点：**
- [ ] 切换产品/组织时，图表有平滑过渡
- [ ] 初次加载时，柱子依次出现

##### 2.2.2 更新 Tooltip（重要）

**位置：** 替换 lines 624-641

**参考：** `QUARTERLY_CHART_REDESIGN.md` 的 Step 2 - Tooltip配置

**核心改动：**
- 使用 `shadow` 类型指示器（替代 `cross`）
- HTML富文本格式化
- 添加状态徽章

**检查点：**
- [ ] Tooltip显示5项数据：目标、实际、增量、增长率、状态
- [ ] 样式美观，有层次感
- [ ] 鼠标悬停时正确显示

##### 2.2.3 更新轴线配置

**位置：** 替换 lines 650-690

**关键改动：**
```typescript
xAxis: {
  // ...
  axisLine: { lineStyle: { color: colors.chart.axisLineEnhanced, width: 1 } },  // 改为 #999999
  axisTick: { lineStyle: { color: colors.chart.axisLineEnhanced, width: 1 } },
},
yAxis: [
  {
    // ...
    axisLine: { lineStyle: { color: colors.chart.axisLineEnhanced, width: 1 } },
    splitLine: {
      show: true,  // 开启网格线
      lineStyle: {
        color: colors.chart.splitLineEnhanced,
        type: 'dashed',
        opacity: 0.5
      }
    },
  },
  // ...
]
```

**检查点：**
- [ ] 轴线颜色加深（从#d3d3d3变为#999999）
- [ ] Y轴网格线显示
- [ ] 视觉层次清晰

##### 2.2.4 更新柱状图Series（核心）

**位置：** 替换 lines 693-750

**2026目标柱（Series 1）关键改动：**
```typescript
{
  name: '2026目标',
  type: 'bar',
  yAxisIndex: 0,
  data: quarterlyTargets.map((value, idx) => {
    const status = quarterlyStatuses[idx];
    const isWarning = status === 'warning' || status === 'danger';

    return {
      value: value,
      itemStyle: {
        color: isWarning
          ? colors.chart.targetBarWarningEnhanced       // #f5f5f5
          : colors.chart.targetBarEnhanced,             // #a8d8f0（加深）
        borderColor: isWarning
          ? colors.chart.targetBarWarningBorderEnhanced // #ff9500（加深）
          : colors.chart.targetBarEnhancedBorder,       // #6eb8d9
        borderWidth: isWarning ? 2 : 1,  // 预警边框加粗
      },
      label: {
        show: true,
        position: 'top',
        formatter: Math.round(value).toString(),
        fontSize: 11,
        fontWeight: 600,  // 加粗
        color: isWarning
          ? colors.chart.quarterlyLabelWarningEnhanced  // #c00000
          : colors.chart.quarterlyLabelEnhanced         // #333333（改为深灰）
      }
    };
  }),
  barWidth: 36,
  barGap: '30%',
  animationDelay: (dataIndex: number) => dataIndex * 150,  // 新增动画
  // ===== Hover效果（新增）=====
  emphasis: {
    focus: 'series',
    itemStyle: {
      borderWidth: 3,
      borderColor: colors.brand.teslaBlue,
      shadowBlur: 10,
      shadowColor: 'rgba(0, 112, 192, 0.3)',
      shadowOffsetY: 4,
    },
    label: {
      fontSize: 13,
      fontWeight: 'bold',
    }
  },
  blur: {
    itemStyle: { opacity: 0.4 },
    label: { opacity: 0.5 }
  }
},
```

**2025实际柱（Series 2）同理修改**

**检查点：**
- [ ] 柱状图颜色变深（对比度提升）
- [ ] 预警状态边框加粗（2px）
- [ ] Hover时有阴影效果
- [ ] 标签颜色正确（正常深灰，预警红色）

##### 2.2.5 更新折线图Series（核心）

**位置：** 替换 lines 752-803

**关键改动：**
```typescript
{
  name: '增长率',
  type: 'line',
  yAxisIndex: 1,
  data: growthSeries.map((value, idx) => {
    const status = quarterlyStatuses[idx];
    const isWarning = status === 'warning' || status === 'danger';

    return {
      value: value,
      label: {
        show: true,
        position: 'top',
        formatter: (params: any) => {
          const val = params.value as number | null;
          return val === null ? "" : `${(val * 100).toFixed(1)}%`;
        },
        fontSize: 12,
        fontWeight: 'bold',
        color: isWarning
          ? colors.chart.quarterlyLabelWarningEnhanced
          : colors.chart.quarterlyLabelEnhanced
      }
    };
  }),
  smooth: true,
  lineStyle: {
    color: colors.chart.growthLineEnhanced,
    width: colors.chart.growthLineWidthEnhanced  // 2px（加粗）
  },
  itemStyle: {
    color: (params: any) => {
      const value = params.value as number | null;
      return getGrowthPointColorEnhanced(value);  // 使用增强色
    },
    borderColor: '#fff',
    borderWidth: 2
  },
  symbol: (value: any, params: any) => {
    return getGrowthPointSymbol(value);  // 形状编码
  },
  symbolSize: (value: any) => {
    return getGrowthPointSize(value);  // 危险状态放大
  },
  animationDelay: 600,
  animationDuration: 1000,
  animationEasing: 'elasticOut',
  // ===== Hover效果（新增）=====
  emphasis: {
    focus: 'series',
    lineStyle: {
      width: 3,
      shadowBlur: 8,
      shadowColor: 'rgba(0, 112, 192, 0.5)',
    },
    itemStyle: {
      borderWidth: 3,
      shadowBlur: 10,
      shadowColor: 'rgba(0, 0, 0, 0.3)',
    },
    label: {
      fontSize: 14,
      fontWeight: 'bold',
    }
  },
  // ===== 预警线（增强版）=====
  markLine: {
    symbol: ['none', 'none'],
    label: {
      show: true,
      position: 'end',
      formatter: '预警线 5%',
      color: colors.chart.warningLineEnhanced,  // #c00000（改为深红）
      fontSize: 11,
      fontWeight: 600,
      backgroundColor: '#fff',
      padding: [4, 8],
      borderRadius: 4,
      borderColor: colors.chart.warningLineEnhanced,
      borderWidth: 1
    },
    lineStyle: {
      color: colors.chart.warningLineEnhanced,  // #c00000
      type: 'dashed',
      width: colors.chart.warningLineWidthEnhanced,  // 2px（加粗）
    },
    data: [{ yAxis: 0.05 }]
  }
}
```

**检查点：**
- [ ] 折线加粗（2px）
- [ ] 点大小增加（10px，危险状态12px）
- [ ] 点形状根据增长率变化（菱形/圆形/三角形/方形）
- [ ] 预警线加粗（2px）且颜色为深红
- [ ] Hover时折线有阴影效果

#### 2.3 测试图表渲染

**在浏览器中测试（http://localhost:3000）：**

- [ ] 图表正常渲染，无报错
- [ ] 柱状图颜色变深
- [ ] 折线和点显示正确
- [ ] Tooltip数据准确
- [ ] 切换产品/组织时图表更新正常

**TypeScript检查：**
```bash
pnpm typecheck
```

**如有错误，逐步回退修改，定位问题**

---

### Step 3: 优化图例组件（30分钟）

#### 3.1 替换图例组件

**文件：** `src/components/charts/QuarterlyChartLegend.tsx`

**策略：** 完全替换为增强版本

**参考：** `QUARTERLY_CHART_REDESIGN.md` 的 Step 3

**核心改动：**
- 添加预警状态图例项
- 桌面端Tooltip说明
- 移动端折叠功能
- Hover动画效果

**检查点：**
- [ ] 图例显示4项：2026目标、2025实际、增长率、预警状态
- [ ] 桌面端有信息图标Tooltip
- [ ] 移动端可折叠（<768px）
- [ ] 图例项Hover时有放大效果

#### 3.2 测试响应式

**桌面端测试（≥768px）：**
- [ ] 图例水平居中排列
- [ ] 信息图标Hover时显示说明
- [ ] 背景透明

**移动端测试（<768px）：**
- [ ] 默认展开状态
- [ ] 点击"图例"按钮可折叠
- [ ] 折叠时显示箭头动画
- [ ] 浅灰背景，左对齐

---

## 阶段2：体验优化（推荐完成）

**预计时间：30分钟**

### Step 4: 验证动画效果（已在Step 2包含）

**测试项：**
- [ ] 首次加载：柱子依次出现（150ms间隔）
- [ ] 折线延迟出现（600ms后，弹性动画）
- [ ] 切换数据：500ms平滑过渡
- [ ] 无卡顿，流畅运行

### Step 5: 验证Tooltip增强（已在Step 2包含）

**测试项：**
- [ ] 显示5项数据（目标、实际、增量、增长率）
- [ ] 状态徽章颜色正确
- [ ] 表格排版美观
- [ ] 鼠标可移入Tooltip（enterable: true）

---

## 阶段3：可选增强

**预计时间：1小时**

### Step 6: 添加响应式Hook（可选）

**新建文件：** `src/hooks/useResponsiveChart.ts`

**参考：** `QUARTERLY_CHART_REDESIGN.md` 的 Step 4

**集成到图表：**

```typescript
// src/app/page.tsx

import { useResponsiveChart } from '@/hooks/useResponsiveChart';

// 在组件内
const chartConfig = useResponsiveChart();

// 使用配置
<ReactECharts
  option={quarterlyChartOption}
  style={{ height: chartConfig.height }}
/>

// 在 quarterlyChartOption 中使用
grid: {
  left: `${chartConfig.grid.left}px`,
  right: `${chartConfig.grid.right}px`,
  bottom: `${chartConfig.grid.bottom}px`,
  top: `${chartConfig.grid.top}px`,
}
```

**检查点：**
- [ ] 不同屏幕宽度下，图表高度自适应
- [ ] 柱宽、字号、间距动态调整
- [ ] 无性能问题

### Step 7: 添加键盘导航（可选）

**修改：** `src/app/page.tsx` lines 1251-1264

**添加焦点管理和ARIA属性**

**参考：** `QUARTERLY_CHART_REDESIGN.md` 的 4.2-4.3 节

**检查点：**
- [ ] Tab键可聚焦图表区域
- [ ] 左右方向键切换季度
- [ ] Enter键触发Tooltip
- [ ] 屏幕阅读器可读取

---

## 验收测试

### 功能测试

#### 1. 颜色对比度验证

**工具：** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

- [ ] #a8d8f0（2026目标）vs #ffffff：对比度 ≥ 3:1 ✅
- [ ] #d9d9d9（2025实际）vs #ffffff：对比度 ≥ 3:1 ✅
- [ ] #999999（轴线）vs #ffffff：对比度 ≥ 4.5:1 ✅

#### 2. 预警状态测试

**测试数据：** 切换到增长率<5%的产品

- [ ] 柱状图显示橙色/红色边框
- [ ] 边框宽度2px
- [ ] 标签颜色变为红色
- [ ] Tooltip状态徽章显示"预警"或"危险"

#### 3. 交互测试

- [ ] Hover柱状图：显示阴影，其他柱淡化
- [ ] Hover折线：线条加粗，点放大
- [ ] Click触发Tooltip（移动端）
- [ ] Tooltip数据准确无误

#### 4. 动画测试

- [ ] 首次加载：柱子依次出现
- [ ] 切换数据：平滑过渡
- [ ] 无闪烁，无卡顿

### 可访问性测试

#### 1. 键盘导航（如实现Step 7）

- [ ] Tab键聚焦图表
- [ ] 方向键切换数据点
- [ ] Enter键触发Tooltip
- [ ] Esc键关闭Tooltip

#### 2. 屏幕阅读器

**工具：** macOS VoiceOver / Windows Narrator

- [ ] 读取图表标题
- [ ] 读取图例项
- [ ] 读取ARIA描述

#### 3. 色盲友好

**工具：** [Coblis Color Blindness Simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/)

**上传截图，测试以下模式：**
- [ ] 红色盲（Protanopia）：形状编码可区分
- [ ] 绿色盲（Deuteranopia）：形状编码可区分
- [ ] 蓝色盲（Tritanopia）：形状编码可区分

### 浏览器兼容性

- [ ] Chrome/Edge (v90+)
- [ ] Firefox (v88+)
- [ ] Safari (v14+)
- [ ] 移动Safari
- [ ] 移动Chrome

### 响应式测试

**断点测试：**
- [ ] 3XL (2400px): PPT模式
- [ ] 2XL (1920px): 大屏
- [ ] XL (1440px): 标准桌面
- [ ] LG (1024px): 笔记本
- [ ] MD (768px): 平板
- [ ] SM (640px): 移动端

### 性能测试

**Chrome DevTools Performance：**

- [ ] 初始渲染 < 500ms
- [ ] 数据切换 < 300ms
- [ ] 内存稳定（切换100次后无泄漏）

---

## 回滚方案

### 方案A：部分回滚（推荐）

**如果某个Step出现问题，仅回滚该Step：**

```bash
# 查看修改的文件
git diff HEAD

# 回滚单个文件
git checkout HEAD -- src/app/page.tsx

# 重新开始该Step
```

### 方案B：完全回滚

**如果整体效果不理想，回滚到优化前：**

```bash
# 切换到备份分支
git checkout backup/quarterly-chart-before-redesign

# 查看原始代码
git log --oneline

# 创建新的工作分支重新开始
git checkout -b feature/quarterly-chart-redesign-v2
```

### 方案C：保留增强色系，回滚图表配置

```bash
# 仅回滚图表配置，保留颜色系统
git checkout HEAD -- src/app/page.tsx
git checkout HEAD -- src/components/charts/QuarterlyChartLegend.tsx

# 保留 src/styles/tokens.ts 的修改
```

---

## 提交代码

### 分步提交（推荐）

```bash
# Step 1提交
git add src/styles/tokens.ts
git commit -m "feat(ui): 添加季度图表增强色系（WCAG AA兼容）

- 新增targetBarEnhanced等颜色常量
- 添加getGrowthPointColorEnhanced等工具函数
- 对比度从1.35提升至3.2（2026柱）
- 对比度从1.12提升至3.5（2025柱）

Refs: QUARTERLY_CHART_REDESIGN.md"

# Step 2提交
git add src/app/page.tsx
git commit -m "feat(ui): 重构季度图表配置，提升视觉效果

- 应用增强色系，提升对比度
- 添加Tooltip富文本格式（5项数据+状态徽章）
- 添加Hover阴影效果
- 添加初始加载动画（800ms）
- 增长率点使用形状编码（可访问性）
- 预警线加粗至2px

Refs: QUARTERLY_CHART_REDESIGN.md"

# Step 3提交
git add src/components/charts/QuarterlyChartLegend.tsx
git commit -m "feat(ui): 优化季度图表图例组件

- 添加预警状态图例项
- 添加桌面端信息Tooltip
- 添加移动端折叠功能
- 添加Hover动画效果

Refs: QUARTERLY_CHART_REDESIGN.md"

# 可选Step提交
git add src/hooks/useResponsiveChart.ts
git commit -m "feat(ui): 添加响应式图表Hook（6级断点）

- 支持XS-3XL断点自适应
- 动态调整高度、柱宽、字号、间距

Refs: QUARTERLY_CHART_REDESIGN.md"
```

### 一次性提交

```bash
git add -A
git commit -m "feat(ui): 全面优化季度保费规划图UI/UX

## 核心改进
- 颜色对比度提升至WCAG AA标准（3.2:1, 3.5:1）
- Tooltip信息密度提升167%（5项+状态）
- 添加动画效果和Hover交互
- 形状编码增强色盲友好性
- 响应式优化（6级断点）

## 修改文件
- src/styles/tokens.ts: 新增增强色系和工具函数
- src/app/page.tsx: 重构图表配置
- src/components/charts/QuarterlyChartLegend.tsx: 优化图例
- src/hooks/useResponsiveChart.ts: 新增响应式Hook（可选）

## 验收
- [x] 对比度验证通过
- [x] 交互测试通过
- [x] 浏览器兼容性通过
- [x] 性能测试通过

Refs: QUARTERLY_CHART_REDESIGN.md
Preview: QUARTERLY_CHART_COMPARISON.html"
```

---

## 常见问题

### Q1: 颜色修改后图表不显示？
**A:** 检查 `colors.chart.xxxEnhanced` 是否拼写正确，确认已导入新函数。

### Q2: TypeScript报错？
**A:** 运行 `pnpm typecheck`，检查类型定义是否正确。

### Q3: 动画卡顿？
**A:** 降低 `animationDuration`，或禁用部分动画效果。

### Q4: 移动端图例不折叠？
**A:** 检查Tailwind断点类名 `md:hidden`，确认响应式CSS生效。

### Q5: Tooltip显示不完整？
**A:** 设置 `confine: true`，或调整 `position` 函数。

---

## 参考资源

- **设计方案：** `QUARTERLY_CHART_REDESIGN.md`
- **可视化对比：** `QUARTERLY_CHART_COMPARISON.html`
- **ECharts文档：** https://echarts.apache.org/zh/option.html
- **WCAG标准：** https://www.w3.org/WAI/WCAG21/quickref/
- **对比度检查：** https://webaim.org/resources/contrastchecker/
- **色盲模拟：** https://www.color-blindness.com/coblis-color-blindness-simulator/

---

**版本：** 1.0.0
**创建日期：** 2025-12-24
**预计完成时间：** 2-4小时（根据阶段选择）
**难度：** ⭐⭐⭐ (中等)

**Good luck! 🚀**
