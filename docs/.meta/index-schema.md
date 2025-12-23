# 文档-代码索引元数据规范

## 索引文件结构

### 文档索引 (docs-index.json)
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-23T10:00:00Z",
  "documents": {
    "docs/business/指标定义规范.md": {
      "id": "doc-metrics-definition",
      "title": "指标字典与计算口径",
      "category": "business",
      "tags": ["指标", "计算", "时间进度", "增长率"],
      "relatedDocs": [
        "docs/business/目标分配规则.md",
        "docs/development/UI开发指南.md"
      ],
      "implementedIn": [
        "src/domain/time.ts",
        "src/domain/achievement.ts",
        "src/domain/growth.ts"
      ],
      "sections": {
        "时间进度与时间进度达成率": {
          "lineRange": [26, 64],
          "implementations": ["src/domain/time.ts:12-101"]
        },
        "同比增长与增量": {
          "lineRange": [66, 92],
          "implementations": ["src/domain/growth.ts:1-50"]
        }
      },
      "lastModified": "2025-12-23T09:30:00Z",
      "checksum": "sha256:abc123..."
    }
  },
  "crossReferences": [
    {
      "from": "docs/business/指标定义规范.md:30",
      "to": "src/domain/time.ts:12",
      "type": "defines",
      "description": "time_progress_linear_year 定义"
    }
  ]
}
```

### 代码索引 (code-index.json)
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-23T10:00:00Z",
  "modules": {
    "src/domain/time.ts": {
      "id": "module-time",
      "type": "domain-logic",
      "exports": [
        "linearProgressYear",
        "weightedProgressYear",
        "actual2025ProgressYear",
        "linearProgressQuarter",
        "weightedProgressQuarter",
        "actual2025ProgressQuarter",
        "monthToQuarter"
      ],
      "documentedIn": [
        "docs/business/指标定义规范.md:26-64",
        "CLAUDE.md:110-126"
      ],
      "usedBy": [
        "src/app/page.tsx:7-15"
      ],
      "dependencies": [],
      "functions": {
        "actual2025ProgressYear": {
          "lineRange": [62, 75],
          "documentation": "docs/business/指标定义规范.md:31",
          "tests": [],
          "lastModified": "2025-12-23T09:30:00Z"
        }
      }
    }
  }
}
```

## 元数据注释规范

### 文档中的元数据标记
```markdown
<!--meta
id: doc-metrics-definition
implements: src/domain/time.ts, src/domain/growth.ts
version: 2.0
lastReviewed: 2025-12-23
-->

## 时间进度与时间进度达成率（三口径）

<!--anchor:time-progress-modes-->
### 年度进度计算
- **time_progress_linear_year** <!--impl:src/domain/time.ts:12-14-->
```

### 代码中的元数据标记
```typescript
/**
 * 年度2025实际进度
 * @doc docs/business/指标定义规范.md:31
 * @formula sum(actuals2025[0..month-1]) / sum(actuals2025[0..11])
 * @param actuals2025 2025年12个月实际数据数组（可能包含null）
 * @param month 当前月份（1-12）
 * @returns 进度值（0-1），如果数据不足返回0
 * @see docs/business/指标定义规范.md#时间进度与时间进度达成率
 */
export function actual2025ProgressYear(
  actuals2025: Array<number | null>,
  month: number
): number {
  // ...
}
```

## 索引文件位置
```
docs/
  .meta/
    index-schema.md          # 本规范文件
    docs-index.json          # 文档索引
    code-index.json          # 代码索引
    graph.json               # 知识图谱
    sync-rules.yaml          # 同步规则配置
```
