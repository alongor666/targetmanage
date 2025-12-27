---
name: test-generation
description: 使用 Minion 框架生成智能测试用例
license: MIT
version: 1.0.0
category: minion-integration
---

# Test Generation Skill

## 能力概述

此技能提供基于 Minion 的测试用例生成能力，特别关注业务逻辑测试、边界条件测试、文档驱动测试。与项目 Vitest 框架集成，自动生成高质量测试。

## 核心功能

- **从业务文档生成测试**：提取文档中的测试场景
- **从代码自动生成测试**：分析函数签名生成测试
- **边界条件测试**：自动识别边界值和异常情况
- **覆盖率分析**：预测测试覆盖率并补充测试用例

## 工作流程

```
选择目标（代码或文档）
    ↓
Claude Code 调用此 Skill
    ↓
提取测试场景
    ↓
调用 Minion 生成测试
    ↓
返回测试代码
    ↓
集成到测试套件
```

## 使用示例

### 场景：为 Domain 函数生成测试

```typescript
// 1. 选择目标函数
const targetFunction = 'calculateAchievementRate';

// 2. 读取函数和文档
import { readFunctionCode } from '@/lib/code-utils';
import { extractBusinessDoc } from '@/lib/doc-utils';

const functionCode = await readFunctionCode(targetFunction);
const businessDoc = await extractBusinessDoc(functionCode);

// 3. 调用 Minion 生成测试
import { callMinionAPI } from '@/lib/minion-client';

const tests = await callMinionAPI({
  endpoint: '/api/generate-tests',
  method: 'POST',
  body: {
    target: {
      type: 'function',
      name: targetFunction,
      code: functionCode,
      documentation: businessDoc
    },
    framework: 'vitest',
    options: {
      includeBoundaryTests: true,
      includeNullTests: true,
      coverage: 'high'
    }
  }
});

// 4. 写入测试文件
await writeTestFile(targetFunction, tests.content);

// 5. 运行测试
import { exec } from 'child_process';
await exec('pnpm test ' + tests.testFile);
```

## 集成方式

### 测试框架选择

项目使用 Vitest：

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
});
```

### 从文档生成测试

```typescript
// 使用 @doc 标签定位业务文档
const docPath = extractDocTag(functionCode);
const docContent = await readDocFile(docPath);

// 提取测试场景
const scenarios = await callMinionAPI({
  endpoint: '/api/extract-scenarios',
  method: 'POST',
  body: {
    documentation: docContent
  }
});

// 生成测试代码
const tests = await callMinionAPI({
  endpoint: '/api/generate-tests',
  method: 'POST',
  body: {
    scenarios: scenarios.scenarios,
    targetFunction: functionCode,
    framework: 'vitest'
  }
});
```

## 测试类型

### 1. 单元测试

Minion 生成的测试示例：

```typescript
import { describe, it, expect } from 'vitest';
import { calculateAchievementRate } from '@/domain/achievement';

describe('calculateAchievementRate', () => {
  it('should calculate achievement rate correctly', () => {
    const result = calculateAchievementRate(8500, 10000);
    expect(result).toBe(0.85);
  });

  it('should return null when target is 0', () => {
    const result = calculateAchievementRate(8500, 0);
    expect(result).toBeNull();
  });

  it('should return null when actual is null', () => {
    const result = calculateAchievementRate(null, 10000);
    expect(result).toBeNull();
  });

  it('should handle超额完成', () => {
    const result = calculateAchievementRate(12000, 10000);
    expect(result).toBe(1.2);
  });
});
```

### 2. 边界条件测试

自动生成的边界测试：

```typescript
describe('calculateAchievementRate - boundary conditions', () => {
  it('should handle minimum non-zero value', () => {
    const result = calculateAchievementRate(0.01, 10000);
    expect(result).toBeCloseTo(0.000001);
  });

  it('should handle zero actual', () => {
    const result = calculateAchievementRate(0, 10000);
    expect(result).toBe(0);
  });

  it('should handle negative values', () => {
    const result = calculateAchievementRate(-1000, 10000);
    expect(result).toBeCloseTo(-0.1);
  });
});
```

### 3. 业务规则测试

从文档提取的业务规则测试：

```typescript
describe('calculateAchievementRate - business rules', () => {
  it('should follow @doc specification', () => {
    // 测试文档中定义的规则
    const { actual, target } = getTestCaseFromDoc();
    const expected = getExpectedFromDoc();
    const result = calculateAchievementRate(actual, target);
    expect(result).toBe(expected);
  });

  it('should comply with null-safety specification', () => {
    // 文档要求：target 为 0 时返回 null
    expect(calculateAchievementRate(100, 0)).toBeNull();
  });
});
```

### 4. 集成测试

多个函数协作测试：

```typescript
describe('Growth metrics calculation - integration', () => {
  it('should calculate complete growth metrics', async () => {
    const actuals = await loadActualsMonthly2026();
    const targets = await loadTargetsAnnual2026();

    const metrics = calculateGrowthMetrics(actuals, targets);

    expect(metrics).toHaveProperty('growth_month_rate');
    expect(metrics).toHaveProperty('inc_ytd');
    expect(metrics.growth_month_rate).toBeGreaterThanOrEqual(0);
  });
});
```

## 数据格式

### 输入格式

```json
{
  "target": {
    "type": "function",
    "name": "calculateAchievementRate",
    "code": "export function calculateAchievementRate(actual: number, target: number): number | null {...}",
    "documentation": "@doc docs/business/指标定义规范.md:120"
  },
  "framework": "vitest",
  "options": {
    "includeBoundaryTests": true,
    "includeNullTests": true,
    "coverage": "high"
  }
}
```

### 输出格式

```json
{
  "testFile": "src/domain/__tests__/calculateAchievementRate.test.ts",
  "content": "import { describe, it, expect } from 'vitest';\n...",
  "testCases": [
    {
      "name": "should calculate correctly",
      "input": { "actual": 8500, "target": 10000 },
      "expected": 0.85
    },
    {
      "name": "should return null for zero target",
      "input": { "actual": 8500, "target": 0 },
      "expected": null
    }
  ],
  "coverageEstimate": "95%",
  "recommendations": [
    "Add tests for negative values",
    "Consider adding performance tests for large datasets"
  ]
}
```

## 最佳实践

### 1. 测试组织

```typescript
// ✅ 正确：清晰的测试组织
describe('FunctionName', () => {
  describe('normal cases', () => {
    it('should do X', () => {});
  });

  describe('boundary conditions', () => {
    it('should handle Y', () => {});
  });

  describe('error cases', () => {
    it('should throw Z', () => {});
  });
});

// ❌ 错误：扁平结构
describe('FunctionName', () => {
  it('test 1', () => {});
  it('test 2', () => {});
  // 15 个测试混在一起
});
```

### 2. 测试数据

```typescript
// ✅ 正确：使用固定测试数据
const testCases = [
  { actual: 8500, target: 10000, expected: 0.85 },
  { actual: 0, target: 10000, expected: 0 }
];

// ❌ 错误：随机数据（不稳定）
const actual = Math.random() * 10000;
```

### 3. 断言选择

```typescript
// 精确匹配
expect(result).toBe(0.85);

// 类型检查
expect(result).toBeNull();
expect(result).toBeNumber();

// 范围检查
expect(result).toBeGreaterThan(0);
expect(result).toBeLessThanOrEqual(1);

// 浮点数比较
expect(result).toBeCloseTo(0.85, 1);
```

### 4. 覆盖率目标

| 层级 | 目标覆盖率 | 优先级 |
|------|-----------|--------|
| Domain 层 | 100% | 最高 |
| Services 层 | 80%+ | 高 |
| Components 层 | 60%+ | 中 |
| Utils 层 | 90%+ | 高 |

## 参考文档

### 项目文档
- @doc docs/development/开发指南.md
- @doc docs/development/质量检查清单.md
- @doc docs/business/指标定义规范.md

### 代码实现
- @code src/domain/ (Domain 层代码 - 测试目标)
- @code package.json (Vitest 配置在 package.json 中)
- @code src/services/loaders.ts (数据加载 - 测试辅助)

### 相关技能
- @code .claude/.skills/minion-integration/code-review/SKILL.md (代码审查技能)
