---
name: code-review
description: 使用 Minion 框架进行智能代码审查
license: MIT
version: 1.0.0
category: minion-integration
---

# Code Review Skill

## 能力概述

此技能提供基于 Minion 的代码审查能力，特别关注业务规则符合性、文档一致性、类型安全等。与项目文档系统深度集成，确保代码质量。

## 核心功能

- **业务规则符合性检查**：验证计算公式是否符合文档定义
- **文档一致性验证**：检查 @doc 标签和文档引用
- **类型安全验证**：TypeScript 类型检查
- **代码规范检查**：Domain 层纯函数验证

## 工作流程

```
代码变更检测
    ↓
Claude Code 调用此 Skill
    ↓
提取代码和相关文档
    ↓
调用 Minion 进行审查
    ↓
生成审查报告
    ↓
显示问题和建议
```

## 使用示例

### 场景：审查 Domain 层代码

```typescript
// 1. 提取代码和文档
const codeChanges = await extractModifiedFiles('src/domain/');
const relatedDocs = await findRelatedDocs(codeChanges);

// 2. 调用 Minion 审查
import { callMinionAPI } from '@/lib/minion-client';

const review = await callMinionAPI({
  endpoint: '/api/review',
  method: 'POST',
  body: {
    files: codeChanges,
    documents: relatedDocs,
    checks: {
      businessRules: true,
      docConsistency: true,
      docTags: true,
      typeSafety: true
    }
  }
});

// 3. 处理审查结果
if (review.criticalIssues > 0) {
  blockCommit(review.issues);
} else {
  showReviewReport(review);
}
```

## 集成方式

### 与文档系统集成

```typescript
// 使用现有的文档索引
import { docsIndex, codeIndex } from '@/lib/indices';

// 检查文档-代码一致性
const consistencyCheck = await callMinionAPI({
  endpoint: '/api/check-consistency',
  method: 'POST',
  body: {
    codeFile: 'src/domain/time.ts',
    documentedIn: codeIndex['src/domain/time.ts'].documentedIn
  }
});
```

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "🔍 Running code review..."

# 标准检查
pnpm typecheck || exit 1
pnpm docs:check || exit 1

# Minion 深度审查（可选）
if [ -n "$ENABLE_MINION_REVIEW" ]; then
  pnpm minion:review || exit 1
fi

echo "✅ Code review passed"
```

启用 Minion 审查：
```bash
export ENABLE_MINION_REVIEW=true
git commit -m "feat: add new feature"
```

## 审查检查项

### 1. 业务规则符合性

**检查内容**：
- 计算公式是否符合 @doc 引用的文档定义
- 边界条件处理是否正确（如除零）
- null 值处理是否符合规范（返回 null 而非 0）

**示例**：
```typescript
// ✅ 正确：null 安全
export function calculateAchievementRate(
  actual: number,
  target: number
): number | null {
  if (target === 0) return null;  // 符合规范
  return actual / target;
}

// ❌ 错误：返回 0
if (target === 0) return 0;  // 不符合 null 安全规范
```

### 2. 文档一致性

**检查内容**：
- @doc 标签是否存在
- 引用的文档是否存在
- 文档内容是否与代码同步

**示例**：
```typescript
/**
 * Calculate year-over-year growth rate
 *
 * @doc docs/business/指标定义规范.md:69  ← 必需
 * @formula (current - baseline) / baseline  ← 推荐
 *
 * @param current Current period value
 * @param baseline Baseline period value
 * @returns Growth rate (0-1) or null if baseline is 0
 */
export function calculateGrowthRate(...) { }
```

### 3. 类型安全

**检查内容**：
- 函数签名是否完整
- 返回值类型是否准确
- null 处理是否正确
- 避免使用 any 类型

**示例**：
```typescript
// ✅ 正确：完整类型定义
function calculateTimeProgress(
  currentMonth: number,
  mode: 'linear' | 'weighted' | '2025-actual'
): number | null {
  // ...
}

// ❌ 错误：使用 any
function calculateTimeProgress(mode: any): any {
  // ...
}
```

### 4. 代码规范

**检查内容**：
- Domain 层是否纯函数（无副作用）
- 是否有文件 I/O、网络请求
- 是否符合分层架构

**示例**：
```typescript
// ✅ 正确：Domain 层纯函数
// src/domain/achievement.ts
export function calculateAchievementRate(...) {
  // 纯计算，无副作用
}

// ❌ 错误：Domain 层有副作用
export function calculateAchievementRate(...) {
  fetch('/api/data');  // 不应该有网络请求
  localStorage.setItem(...);  // 不应该有 I/O
}
```

## 数据格式

### 输入格式

```json
{
  "files": [
    {
      "path": "src/domain/time.ts",
      "content": "export function calculateTimeProgress() {...}"
    }
  ],
  "documents": [
    {
      "path": "docs/business/指标定义规范.md",
      "content": "..."
    }
  ],
  "checks": {
    "businessRules": true,
    "docConsistency": true,
    "docTags": true,
    "typeSafety": true
  }
}
```

### 输出格式

```json
{
  "summary": {
    "filesReviewed": 5,
    "issuesFound": 12,
    "criticalIssues": 2
  },
  "issues": [
    {
      "file": "src/domain/time.ts",
      "line": 25,
      "type": "missing-doc-tag",
      "severity": "error",
      "message": "Function calculateTimeProgress missing @doc tag",
      "suggestion": "Add @doc docs/business/指标定义规范.md:26"
    },
    {
      "file": "src/domain/achievement.ts",
      "line": 42,
      "type": "null-safety-violation",
      "severity": "warning",
      "message": "Returning 0 instead of null when target is 0",
      "suggestion": "Return null to comply with null-safety specification"
    }
  ],
  "metrics": {
    "docCoverage": 0.92,
    "typeSafetyScore": 0.95,
    "businessRuleCompliance": 0.88
  }
}
```

## 最佳实践

### 1. 审查时机

```typescript
// 开发阶段：使用快速检查
pnpm typecheck

// PR 阶段：使用完整审查
pnpm docs:check
ENABLE_MINION_REVIEW=true git commit
```

### 2. 问题分级

| 级别 | 类型 | 处理方式 |
|------|------|----------|
| Critical | 类型错误、文档缺失 | 阻止提交 |
| Warning | 命名不规范、注释不完整 | 建议修复 |
| Info | 优化建议 | 可选修复 |

### 3. 修复流程

```typescript
// 自动修复：格式问题
const fixed = await autoFixCode(issue);
await writeFile(issue.file, fixed);

// 半自动：标签添加
const suggestion = generateDocTag(functionInfo);
console.log('建议添加:', suggestion);
// 用户手动添加

// 手动修复：业务逻辑
console.log('请手动审查业务逻辑:', issue.message);
```

### 4. 持续改进

```typescript
// 记录常见问题模式
const patterns = await analyzeReviewHistory();
console.log('常见问题:', patterns.top(5));

// 更新审查规则
await updateReviewRules(patterns);

// 改进文档质量
const lowDocFiles = review.metrics.lowDocCoverage;
await improveDocumentation(lowDocFiles);
```

## 参考文档

### 项目文档
- @doc docs/.meta/ai-context.md
- @doc docs/development/开发指南.md
- @doc docs/architecture/文档代码索引系统设计.md

### 代码实现
- @code src/domain/ (Domain 层代码)
- @code docs/.meta/code-index.json (代码索引)
- @code docs/.meta/docs-index.json (文档索引)

### 相关技能
- @code .claude/.skills/skill-loader/SKILL.md (技能加载器)
