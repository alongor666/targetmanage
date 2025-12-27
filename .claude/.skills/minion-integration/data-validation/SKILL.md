---
name: data-validation
description: 使用 Minion 框架进行智能数据验证
license: MIT
version: 1.0.0
category: minion-integration
---

# Data Validation Skill

## 能力概述

此技能提供基于 Minion 框架的数据验证能力，用于 CSV 数据导入前的深度验证和质量检查。通过统计学方法和业务规则验证，确保数据准确性和一致性。

## 核心功能

- **业务规则验证**：机构、产品、数值范围检查
- **异常值检测**：使用 Z-score、IQR 等统计学方法
- **数据一致性检查**：字段完整性、数据类型验证
- **历史数据对比**：与历史数据对比发现偏差

## 工作流程

```
用户上传 CSV 文件
    ↓
Claude Code 调用此 Skill
    ↓
生成验证配置（schema + rules）
    ↓
调用 Minion API 进行验证
    ↓
返回验证报告（错误 + 警告 + 统计）
    ↓
展示结果和修复建议
```

## 使用示例

### 场景：验证月度实际数据导入

```typescript
// 1. 准备验证配置
const validationConfig = {
  schema: 'MonthlyActualRecordSchema',
  checks: {
    organization: true,      // 检查机构是否存在
    product: true,           // 检查产品是否有效
    valueRange: {
      min: 0,
      max: 1000000
    },
    anomalies: true          // 启用异常检测
  }
};

// 2. 调用 Minion API
import { callMinionAPI } from '@/lib/minion-client';

const result = await callMinionAPI({
  endpoint: '/api/validate',
  method: 'POST',
  body: {
    csvData: csvText,        // CSV 文本内容
    config: validationConfig
  }
});

// 3. 处理验证结果
if (result.errors.length > 0) {
  // 显示错误，阻止导入
  showErrors(result.errors);
} else if (result.warnings.length > 0) {
  // 显示警告，允许继续
  showWarningsAndConfirm(result.warnings);
} else {
  // 验证通过，继续导入
  proceedWithImport(result.data);
}
```

## 集成方式

### Minion 部署

Minion 作为独立的 Python 服务运行：

```bash
# 使用 Docker（推荐）
docker run -d -p 8000:8000 \
  -v $(pwd)/config:/app/config \
  --name minion-server \
  minion-framework:latest

# 或本地安装
pip install minion-framework
minion-server start --port 8000
```

### 配置文件

创建 `.claude/minion.config.json`:

```json
{
  "version": "1.0.0",
  "mode": "api",
  "server": {
    "url": "http://localhost:8000",
    "timeout": 30000
  },
  "skills": {
    "data-validation": {
      "enabled": true,
      "endpoint": "/api/validate",
      "timeout": 10000
    }
  }
}
```

### API 调用封装

```typescript
// src/lib/minion-client.ts
export async function callMinionAPI<T>(params: {
  endpoint: string;
  method: 'GET' | 'POST';
  body?: any;
}): Promise<T> {
  const config = await loadMinionConfig();
  const response = await fetch(`${config.server.url}${params.endpoint}`, {
    method: params.method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params.body)
  });

  if (!response.ok) {
    throw new Error(`Minion API error: ${response.statusText}`);
  }

  return response.json();
}
```

## 数据格式

### 输入格式

```json
{
  "csvData": "year,month,org_cn,product_cn,premium\n2026,1,成都分公司,车险,8500\n...",
  "config": {
    "schema": "MonthlyActualRecordSchema",
    "checks": {
      "organization": true,
      "product": true,
      "valueRange": { "min": 0, "max": 1000000 },
      "anomalies": true,
      "method": "zscore",
      "threshold": 3
    }
  }
}
```

### 输出格式

```json
{
  "summary": {
    "totalRows": 1200,
    "validRows": 1156,
    "errorCount": 44,
    "warningCount": 8
  },
  "errors": [
    {
      "row": 23,
      "field": "premium",
      "message": "Value (-500) is below minimum (0)",
      "severity": "error",
      "suggestion": "检查数据录入是否正确，保费不应为负数"
    }
  ],
  "warnings": [
    {
      "row": 156,
      "field": "achievement_rate",
      "message": "Unusually high value (2.5) may indicate data error",
      "severity": "warning",
      "suggestion": "验证计算公式是否正确"
    }
  ],
  "statistics": {
    "premium": {
      "mean": 125000.50,
      "std": 45000.20,
      "min": 0,
      "max": 500000
    }
  },
  "recommendations": [
    "检查 row 23: 负值问题",
    "验证 row 156: 高达成率数据准确性",
    "建议对异常值进行二次确认"
  ]
}
```

## 最佳实践

### 1. 验证级别选择

- **开发环境**：使用快速验证（基本规则检查）
  ```json
  { "checks": { "organization": true, "product": true } }
  ```

- **生产环境**：使用完整验证（包括异常检测）
  ```json
  { "checks": { "anomalies": true, "historical": true } }
  ```

### 2. 错误处理策略

- **阻断性错误**（error）：必填字段缺失、数值范围错误 → 阻止导入
- **警告性错误**（warning）：异常值、历史偏差大 → 显示确认对话框

### 3. 性能优化

- **大文件处理**（>10000 行）：使用分块验证
  ```typescript
  const chunks = splitCSV(csvText, 1000);
  for (const chunk of chunks) {
    await callMinionAPI({ endpoint: '/api/validate', body: { csvData: chunk } });
  }
  ```

- **缓存机制**：相同文件不重复验证
  ```typescript
  const cacheKey = hash(csvText);
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  ```

### 4. 用户反馈

- **错误定位**：显示具体行号和字段名
- **修复建议**：提供可操作的改进建议
- **进度反馈**：大数据量显示验证进度条

## 参考文档

### 项目文档
- @doc docs/business/业务流程规范.md
- @doc docs/business/指标定义规范.md
- @doc docs/development/项目导入指南.md

### 代码实现
- @code src/schemas/schema.ts (Zod schema 定义)
- @code src/services/loaders.ts (数据加载逻辑)
- @code src/services/storage.ts (localStorage 操作)

### 相关技能
- @code .claude/.skills/data-import/SKILL.md (数据导入技能)
