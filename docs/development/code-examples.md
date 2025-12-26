# 代码示例与模式

本文档提供项目中常用的代码模式和最佳实践示例。

**Last Updated:** 2025-12-26

---

## 🎯 Domain Layer 函数模板

### 标准函数模板

Domain 层的所有函数必须遵循以下模板：

```typescript
/**
 * [清晰的功能描述]
 *
 * @doc docs/business/[文件名].md:[行号]  ← 必需
 * @formula [数学公式，如适用]
 *
 * @param [参数名] [参数描述]
 * @returns [返回值描述，包括 null 的情况]
 *
 * @example
 * const rate = calculateAchievementRate(100, 80);
 * // => 1.25 (125% 完成率)
 */
export function functionName(
  param1: Type1,
  param2: Type2
): ReturnType | null {
  // 实现逻辑
}
```

### 完整示例：Achievement Rate 计算

```typescript
/**
 * 计算达成率（实际值 / 目标值）
 *
 * @doc docs/business/指标定义规范.md:45
 * @formula 达成率 = 实际值 / 目标值 × 100%
 *
 * @param actual 实际完成值
 * @param target 目标值
 * @returns 达成率（小数形式，如 1.25 表示 125%），目标为 0 时返回 null
 *
 * @example
 * calculateAchievementRate(100, 80)  // => 1.25
 * calculateAchievementRate(50, 100)  // => 0.5
 * calculateAchievementRate(100, 0)   // => null
 */
export function calculateAchievementRate(
  actual: number,
  target: number
): number | null {
  if (target === 0) return null;
  return actual / target;
}
```

---

## 🛡️ Null Safety 模式

### 核心原则

> **业务规则**：如果计算不可能（除以零、缺少基线），返回 `null` - **永远不要返回 `0`**

### 为什么不能返回 0？

```typescript
// ❌ 错误：返回 0 暗示"0% 完成率"
export function calculateAchievementRate(
  actual: number,
  target: number
): number {
  if (target === 0) return 0;  // ❌ 暗示没有任何进展
  return actual / target;
}

// ✅ 正确：返回 null 表示"无法计算"
export function calculateAchievementRate(
  actual: number,
  target: number
): number | null {
  if (target === 0) return null;  // ✅ 明确表示无法计算
  return actual / target;
}
```

### UI 层处理 null

```typescript
// 格式化函数应该处理 null
export function formatPercentage(value: number | null): string {
  if (value === null) return '—';  // em dash，不是减号
  return `${(value * 100).toFixed(1)}%`;
}

// 使用示例
const rate = calculateAchievementRate(actual, target);
<span>{formatPercentage(rate)}</span>
// 显示为 "125.0%" 或 "—"
```

### 链式计算的 null 处理

```typescript
// 多个计算步骤都可能返回 null
export function calculateGrowthRate(
  current: number,
  baseline: number | null
): number | null {
  // 如果基线数据缺失，无法计算增长率
  if (baseline === null || baseline === 0) return null;
  return (current - baseline) / baseline;
}

// 使用示例
const baseline = getBaseline2025(org, product);  // 可能返回 null
const growth = calculateGrowthRate(actualValue, baseline);
// growth 可能是 number 或 null
```

---

## 📊 TypeScript 类型定义

### Product 类型

```typescript
/**
 * 产品类型
 * - auto: 车险
 * - property: 财产险
 * - life: 寿险
 * - health: 健康险
 * - total: 总计（所有产品之和）
 */
export type Product = 'auto' | 'property' | 'life' | 'health' | 'total';
```

### Organization Mode 类型

```typescript
/**
 * 组织模式
 * - branch: 全分公司（14 个机构）
 * - local: 本地机构（成都地区 7 个）
 * - remote: 外地机构（其他城市 7 个）
 * - single: 单个机构
 * - multi: 自定义多选
 */
export type OrganizationMode = 'branch' | 'local' | 'remote' | 'single' | 'multi';
```

### Time Progress Mode 类型

```typescript
/**
 * 时间进度模式
 * - linear: 线性进度（当前天数 / 总天数）
 * - weighted: 工作日加权（考虑周末和节假日）
 * - actual2025: 基于 2025 年同期实际数据
 */
export type TimeProgressMode = 'linear' | 'weighted' | 'actual2025';
```

---

## 🔄 Data Loading Pattern

### 3-Tier 优先级

```typescript
/**
 * 数据加载的 3 层优先级模式
 *
 * 1. localStorage (用户导入) - 最高优先级
 * 2. public/data/*.json (默认数据) - 中优先级
 * 3. fallback (空数据结构) - 最低优先级
 */
export async function loadTargetsData(): Promise<TargetsData> {
  // 第 1 层：尝试从 localStorage 加载用户导入的数据
  const localData = loadFromLocalStorage('targets-2026');
  if (localData) {
    try {
      const validated = TargetsSchema.parse(localData);
      return validated;
    } catch (error) {
      console.warn('localStorage data invalid, trying JSON file');
    }
  }

  // 第 2 层：从 public/data/ 加载默认数据
  try {
    const response = await fetch('/data/targets-2026.json');
    if (response.ok) {
      const jsonData = await response.json();
      const validated = TargetsSchema.parse(jsonData);
      return validated;
    }
  } catch (error) {
    console.warn('JSON file not found, using fallback');
  }

  // 第 3 层：返回空数据结构
  return {
    year: 2026,
    organizations: [],
    products: ['auto', 'property', 'life', 'health', 'total'],
  };
}
```

### 永远不要硬编码数据

```typescript
// ❌ 错误：硬编码业务数据
const TARGET_2026 = 1000000;
const BASELINE_2025 = 800000;

// ✅ 正确：从数据文件加载
const targets = await loadTargetsData();
const baseline = await loadBaselineData();
```

---

## 📝 JSDoc 标签规范

### @doc 标签格式

```typescript
/**
 * @doc docs/business/指标定义规范.md:45
 *      ^                ^              ^
 *      |                |              行号
 *      |                文件路径（相对于项目根目录）
 *      标签名
 */
```

### @formula 标签示例

```typescript
/**
 * 计算同比增长率
 *
 * @doc docs/business/指标定义规范.md:78
 * @formula 增长率 = (当期值 - 同期值) / 同期值 × 100%
 *
 * @param current 当期值
 * @param baseline 同期值
 * @returns 增长率（小数形式），基线为 0 或 null 时返回 null
 */
export function calculateYoYGrowth(
  current: number,
  baseline: number | null
): number | null {
  if (baseline === null || baseline === 0) return null;
  return (current - baseline) / baseline;
}
```

---

## 🎨 Component 模式

### 原子组件复用

```typescript
// ✅ 复用原子组件
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';

export function KpiCard({ title, value }: KpiCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3>{title}</h3>
      <p>{formatCurrency(value)}</p>
      <Button onClick={handleExport}>导出</Button>
    </div>
  );
}
```

### 避免重复造轮子

```typescript
// ❌ 错误：重新实现已有的格式化函数
function formatMoney(value: number): string {
  return `¥${value.toLocaleString()}`;
}

// ✅ 正确：使用现有的工具函数
import { formatCurrency } from '@/lib/formatters';
```

---

## 🧪 Testing 模式

### Domain 层测试

```typescript
import { describe, it, expect } from 'vitest';
import { calculateAchievementRate } from '@/domain/achievement';

describe('calculateAchievementRate', () => {
  it('should calculate rate correctly', () => {
    expect(calculateAchievementRate(100, 80)).toBe(1.25);
    expect(calculateAchievementRate(50, 100)).toBe(0.5);
  });

  it('should return null when target is 0', () => {
    expect(calculateAchievementRate(100, 0)).toBeNull();
  });

  it('should handle 0 actual value', () => {
    expect(calculateAchievementRate(0, 100)).toBe(0);
  });
});
```

---

## 📂 File Naming 示例

```
src/
├── components/
│   ├── KpiCard.tsx              ← PascalCase (组件)
│   ├── DataTable.tsx
│   └── ui/
│       ├── button.tsx           ← kebab-case (shadcn/ui 组件)
│       └── input.tsx
│
├── lib/
│   ├── formatters.ts            ← camelCase (工具函数)
│   ├── sortOrgItems.ts
│   └── utils.ts
│
├── types/
│   ├── Target.types.ts          ← PascalCase.types.ts
│   └── Organization.types.ts
│
└── domain/
    ├── achievement.ts           ← camelCase (业务逻辑模块)
    ├── growth.ts
    └── time.ts
```

---

## 🔧 Git 操作模式

### 移动文件使用 git mv

```bash
# ❌ 错误：删除并重新创建
rm src/components/OldName.tsx
# 创建 src/components/NewName.tsx
git add src/components/NewName.tsx

# ✅ 正确：使用 git mv 保留历史
git mv src/components/OldName.tsx src/components/NewName.tsx
git commit -m "refactor: rename OldName to NewName"
```

### 提交前检查

```bash
# 1. 运行类型检查
pnpm typecheck

# 2. 验证 @doc 标签
pnpm docs:check

# 3. 查看变更
git status
git diff

# 4. 提交
git add .
git commit -m "feat: add new feature"
```

---

## 📚 相关文档

- **开发指南**：`docs/development/开发指南.md`
- **架构设计**：`docs/architecture/系统架构设计.md`
- **业务规则**：`docs/business/指标定义规范.md`
- **问题排查**：`docs/troubleshooting/common-issues.md`

---

**维护者**：开发团队
**版本**：1.0.0
**最后更新**：2025-12-26
