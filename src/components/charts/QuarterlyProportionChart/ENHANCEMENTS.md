# QuarterlyProportionChart 阶段三增强功能文档

## 概述

阶段三为季度占比规划图组件添加了全面的增强功能，包括工具函数库、增强的 Tooltip、导出功能和完善的类型支持。

---

## 一、工具函数库

### 1. 格式化工具 (`utils/formatter.ts`)

提供 15+ 个格式化函数，涵盖数字、百分比、货币、日期时间等多种场景。

#### 核心函数

| 函数 | 说明 | 示例 |
|------|------|------|
| `formatPercent(value, decimals?)` | 格式化百分比 | `0.15 → "15.0%"` |
| `formatNumber(value, decimals?)` | 格式化数字（千分位） | `1234567 → "1,234,567"` |
| `formatCurrency(value, currency?)` | 格式化货币 | `1234 → "¥1,234"` |
| `getGrowthArrow(growth)` | 获取增长率趋势箭头 | `0.15 → "↗"` |
| `formatGrowth(growth, decimals?)` | 格式化增长率（带箭头） | `0.15 → "↗ 15.00%"` |
| `formatQuarterData(data)` | 格式化季度数据 | - |

#### 辅助函数

| 函数 | 说明 |
|------|------|
| `sanitizeFilename(filename)` | 清理文件名（移除特殊字符） |
| `formatDateTime(date, format?)` | 格式化日期时间 |
| `formatFileSize(bytes)` | 格式化文件大小 |
| `formatDuration(seconds)` | 格式化时长 |
| `truncateText(text, maxLength)` | 截断文本 |
| `getValueColorClass(value)` | 获取数值颜色类名 |
| `formatRange(min, max)` | 格式化数值范围 |

**使用示例**:
```typescript
import { formatPercent, formatGrowth } from '@/components/charts/QuarterlyProportionChart/utils';

console.log(formatPercent(0.15));        // "15.0%"
console.log(formatPercent(0.0556, 2));   // "5.56%"
console.log(formatGrowth(0.15));         // "↗ 15.00%"
console.log(formatGrowth(-0.05, 1));     // "↘ 5.0%"
```

---

### 2. 颜色工具 (`utils/colorUtils.ts`)

提供颜色计算、转换、处理等 15+ 个颜色相关函数。

#### 核心功能

| 函数 | 说明 | 示例 |
|------|------|------|
| `getWarningLevelColor(level)` | 根据预警级别获取颜色 | `'excellent' → '#4caf50'` |
| `getWarningLevelByGrowth(growth)` | 根据增长率获取预警级别 | `0.15 → 'excellent'` |
| `getGrowthColorClass(growth)` | 根据增长率获取 Tailwind 类名 | `0.15 → 'text-green-600'` |
| `adjustBrightness(color, amount)` | 调整颜色亮度 | `'#dceef9', 0.1 → 更亮` |
| `hexToRgba(color, alpha)` | 转换为 RGBA | `'#0070c0', 0.5 → 'rgba(...)'` |
| `createGradient(start, end, steps)` | 创建渐变色 | - |

#### 高级功能

| 函数 | 说明 |
|------|------|
| `getHeatmapColor(value, min, max, scheme)` | 热力图颜色 |
| `isDarkColor(color)` | 检查是否为深色 |
| `getContrastColor(color)` | 获取对比色（黑/白） |
| `blendColors(color1, color2, ratio)` | 混合两种颜色 |
| `withOpacity(color, opacity)` | 添加透明度 |
| `generatePalette(baseColor, steps)` | 生成调色板 |

**使用示例**:
```typescript
import {
  getWarningLevelColor,
  getGrowthColorClass,
  hexToRgba,
  createGradient
} from '@/components/charts/QuarterlyProportionChart/utils';

const color = getWarningLevelColor('excellent'); // '#4caf50'
const className = getGrowthColorClass(0.15);     // 'text-green-600'
const rgba = hexToRgba('#0070c0', 0.5);          // 'rgba(0, 112, 192, 0.5)'
const gradient = createGradient('#dceef9', '#b0d8ef', 5);
```

---

### 3. 导出工具 (`utils/export.ts`)

提供 7 种导出功能，支持 CSV、图片、JSON、打印等多种格式。

#### 导出函数

| 函数 | 说明 | 格式 |
|------|------|------|
| `exportToCSV(data, filename?)` | 导出数据为 CSV | .csv |
| `exportToImage(chartRef, filename?, options?)` | 导出图表为图片 | .png / .jpeg |
| `exportQuarterDetails(details, filename?)` | 导出季度详情 | .csv |
| `exportToJSON(data, filename?)` | 导出为 JSON | .json |
| `printChart(chartRef, title?)` | 打印图表 | 打印对话框 |
| `copyToClipboard(data, format?)` | 复制到剪贴板 | 剪贴板 |
| `generateReport(chartRef, data, filename?)` | 生成完整报表 | .html |

**CSV 导出示例**:
```typescript
import { exportToCSV } from '@/components/charts/QuarterlyProportionChart/utils';

exportToCSV(data, '2024年一季度占比数据');
// 生成: 2024年一季度占比数据.csv
```

**图片导出示例**:
```typescript
import { exportToImage } from '@/components/charts/QuarterlyProportionChart/utils';

exportToImage(chartRef, '季度占比规划图', {
  type: 'png',
  pixelRatio: 2,
  backgroundColor: '#fff',
});
```

**生成报表示例**:
```typescript
import { generateReport } from '@/components/charts/QuarterlyProportionChart/utils';

generateReport(chartRef, data, '季度占比完整报表');
// 生成包含图表和数据的 HTML 报表
```

---

## 二、增强的 Tooltip

### 视觉改进

#### 1. 更好的布局
- 左右对齐的标签和数值
- 更合理的内边距和间距
- 最小宽度保证内容不被截断

#### 2. 颜色编码
增长率根据数值自动使用对应颜色：
- **绿色** (≥15%): 优秀
- **灰色** (5-15%): 正常
- **橙色** (0-5%): 预警
- **红色** (<0%): 危险

#### 3. 趋势箭头
- ↗ 正增长
- → 无增长
- ↘ 负增长

#### 4. 样式对比

**之前**:
```
一季度
• 2026规划占比: 25.0%
• 2025实际占比: 24.0%
• 增长率: ↗ 4.76%
```

**之后**:
```
一季度                          (加粗，更大)
2026规划占比        25.0%      (左右对齐)
2025实际占比        24.0%
增长率              ↗ 4.76%    (根据值着色)
```

---

## 三、组件结构更新

### 新增文件

```
src/components/charts/QuarterlyProportionChart/
├── utils/
│   ├── index.ts              # ✅ 工具函数导出
│   ├── formatter.ts          # ✅ 格式化工具（15+ 函数）
│   ├── colorUtils.ts         # ✅ 颜色工具（15+ 函数）
│   └── export.ts             # ✅ 导出工具（7 个函数）
└── hooks/
    └── useChartConfig.ts     # ✅ 更新：增强的 Tooltip
```

### 导出清单

现在可以从组件导出 **40+ 个函数和类型**：

**格式化工具** (15 个):
- formatPercent, formatNumber, formatCurrency
- getGrowthArrow, formatGrowth, formatQuarterData
- sanitizeFilename, formatDateTime, formatFileSize
- formatDuration, truncateText, getValueColorClass
- formatRange, 等

**颜色工具** (15 个):
- DEFAULT_COLORS, WARNING_LEVEL_COLORS
- getWarningLevelColor, getWarningLevelByGrowth
- getGrowthColorClass, adjustBrightness
- hexToRgba, createGradient, getHeatmapColor
- isDarkColor, getContrastColor, blendColors
- withOpacity, generatePalette, 等

**导出工具** (7 个):
- exportToCSV, exportToImage
- exportQuarterDetails, exportToJSON
- printChart, copyToClipboard
- generateReport

---

## 四、使用示例

### 示例 1: 使用工具函数

```typescript
import {
  formatPercent,
  formatGrowth,
  getWarningLevelByGrowth
} from '@/components/charts/QuarterlyProportionChart/utils';

function MyComponent() {
  const growth = 0.15;
  const level = getWarningLevelByGrowth(growth);

  return (
    <div>
      <p>增长率: {formatGrowth(growth)}</p>
      <p>预警级别: {level}</p>
    </div>
  );
}
```

### 示例 2: 导出功能

```typescript
'use client';

import { QuarterlyProportionChart, exportToCSV, exportToImage } from '@/components/charts/QuarterlyProportionChart';
import { useRef } from 'react';

function MyPage() {
  const chartRef = useRef<any>();

  return (
    <div>
      <QuarterlyProportionChart
        data={data}
        ref={chartRef}
      />

      <button onClick={() => exportToCSV(data)}>
        导出 CSV
      </button>

      <button onClick={() => exportToImage(chartRef.current, '图表')}>
        导出图片
      </button>
    </div>
  );
}
```

### 示例 3: 自定义 Tooltip

工具函数已集成到组件中，Tooltip 自动使用增强样式：

```typescript
<QuarterlyProportionChart
  data={data}
  config={{
    showDataLabel: true,  // 启用数据标签
  }}
/>
```

---

## 五、性能优化

### 1. 工具函数优化
- 所有函数都是纯函数，无副作用
- 可以安全地在 useMemo 和 useCallback 中使用

### 2. 导出优化
- 使用 Blob API 生成文件，无需服务器
- 异步导出，不阻塞 UI

### 3. 内存管理
- 导出后自动释放 Blob URL
- 避免内存泄漏

---

## 六、浏览器兼容性

| 功能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| 格式化工具 | ✅ | ✅ | ✅ | ✅ |
| 颜色工具 | ✅ | ✅ | ✅ | ✅ |
| CSV 导出 | ✅ | ✅ | ✅ | ✅ |
| 图片导出 | ✅ | ✅ | ✅ | ✅ |
| 剪贴板 API | ✅ | ✅ | ✅* | ✅ |
| 打印 | ✅ | ✅ | ✅ | ✅ |

* Safari 需要用户手势触发

---

## 七、TypeScript 类型支持

所有工具函数都有完整的类型定义：

```typescript
// 自动类型推断
const percent = formatPercent(0.15); // string
const arrow = getGrowthArrow(0.15);  // string

// 完整的类型提示
formatPercent(value: number | null, decimals?: number): string
getGrowthArrow(growth: number | null): string
```

---

## 八、代码统计

| 模块 | 文件 | 代码行数 | 函数数量 |
|------|------|---------|---------|
| 格式化工具 | formatter.ts | ~200 | 15 |
| 颜色工具 | colorUtils.ts | ~300 | 15 |
| 导出工具 | export.ts | ~400 | 7 |
| **总计** | **3 个文件** | **~900** | **37** |

---

## 九、测试建议

### 单元测试

```typescript
// 测试格式化函数
describe('formatPercent', () => {
  it('should format percentage correctly', () => {
    expect(formatPercent(0.15)).toBe('15.0%');
    expect(formatPercent(null)).toBe('—');
  });
});

// 测试颜色函数
describe('getWarningLevelByGrowth', () => {
  it('should return correct warning level', () => {
    expect(getWarningLevelByGrowth(0.15)).toBe('excellent');
    expect(getWarningLevelByGrowth(0.03)).toBe('warning');
  });
});
```

### 集成测试

```typescript
// 测试导出功能
describe('exportToCSV', () => {
  it('should download CSV file', () => {
    const mockData = { /* ... */ };
    exportToCSV(mockData, 'test');
    // 验证文件下载
  });
});
```

---

## 十、下一步

阶段三已完成！您现在可以：

1. **阶段四** - 集成到主页面 `src/app/page.tsx`
2. **添加单元测试** - 为工具函数添加测试
3. **性能优化** - 使用 Chrome DevTools 分析性能
4. **文档完善** - 添加更多使用示例
5. **其他功能** - 根据需求添加更多功能

---

## 版本信息

- **版本**: 2.0.0
- **最后更新**: 2025-12-24
- **维护者**: Development Team
