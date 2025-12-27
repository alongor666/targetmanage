# minion-data-validator

使用 Minion 框架进行智能数据验证的 Skill

## 概述

此 Skill 将 Minion 的 Python 执行能力和验证循环集成到 TargetManage 项目中，提供智能的 CSV 数据导入验证和异常检测功能。

## 何时使用

当用户需要：
- 导入新的 CSV 数据文件
- 验证数据完整性和一致性
- 检测数据异常和不合理值
- 生成数据质量报告

## 工作流程

```
用户上传 CSV
    ↓
Claude Code 调用此 Skill
    ↓
生成 Python 验证脚本
    ↓
通过 MCP 调用 Minion 执行
    ↓
Minion 验证循环改进
    ↓
返回验证结果和报告
    ↓
显示给用户
```

## 实现步骤

### 1. 准备验证模板

创建 Python 脚本模板用于数据验证：

```python
# 数据验证脚本模板
import pandas as pd
import json

def validate_data(csv_path, schema_rules):
    """
    验证 CSV 数据符合业务规则

    Args:
        csv_path: CSV 文件路径
        schema_rules: Zod schema 规则

    Returns:
        验证报告 dict
    """
    df = pd.read_csv(csv_path)
    report = {
        'total_rows': len(df),
        'errors': [],
        'warnings': [],
        'statistics': {}
    }

    # 检查必填字段
    required_fields = schema_rules.get('required', [])
    for field in required_fields:
        if field not in df.columns:
            report['errors'].append(f"Missing required field: {field}")

    # 检查数值范围
    numeric_rules = schema_rules.get('numeric', {})
    for field, rules in numeric_rules.items():
        if field in df.columns:
            min_val = rules.get('min')
            max_val = rules.get('max')
            if min_val is not None:
                invalid = df[df[field] < min_val]
                if not invalid.empty:
                    report['errors'].append(
                        f"{field}: {len(invalid)} rows below minimum {min_val}"
                    )
            if max_val is not None:
                invalid = df[df[field] > max_val]
                if not invalid.empty:
                    report['errors'].append(
                        f"{field}: {len(invalid)} rows above maximum {max_val}"
                    )

    # 生成统计信息
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            report['statistics'][col] = {
                'mean': float(df[col].mean()),
                'std': float(df[col].std()),
                'min': float(df[col].min()),
                'max': float(df[col].max())
            }

    return report
```

### 2. 创建 MCP 服务器包装

创建 Minion MCP 服务器以暴露验证能力：

```typescript
// src/mcp/minion-validator-server.ts
import { MCPServer } from '@modelcontextprotocol/sdk/server/index.js';

export class MinionValidatorServer {
  private server: MCPServer;

  constructor() {
    this.server = new MCPServer({
      name: 'minion-validator',
      version: '1.0.0'
    });

    this.registerTools();
  }

  private registerTools() {
    this.server.registerTool({
      name: 'validate_csv_data',
      description: 'Validate CSV data using Minion framework',
      inputSchema: {
        type: 'object',
        properties: {
          csvPath: {
            type: 'string',
            description: 'Path to CSV file'
          },
          schemaName: {
            type: 'string',
            description: 'Schema name (e.g., MonthlyActualRecordSchema)'
          }
        },
        required: ['csvPath', 'schemaName']
      }
    });

    this.server.setRequestHandler('tools/call', async (request) => {
      if (request.params.name === 'validate_csv_data') {
        return await this.validateCSV(request.params.arguments);
      }
    });
  }

  private async validateCSV(args: any) {
    // 调用 Minion 执行验证
    const result = await this.callMinion({
      route: 'code',
      code: this.generateValidationScript(args.schemaName),
      input: {
        csv_path: args.csvPath
      },
      check: true  // 启用验证循环
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  private async callMinion(params: any) {
    // 通过 HTTP 或 subprocess 调用 Minion
    // 实现取决于 Minion 部署方式
  }

  private generateValidationScript(schemaName: string): string {
    // 根据 schema 生成验证脚本
    return `
# Generated validation script for ${schemaName}
import pandas as pd
# ... 验证逻辑
`;
  }
}
```

### 3. 集成到导入流程

修改现有的 CSV 导入页面：

```typescript
// src/app/import/page.tsx
import { useState } from 'react';
import { callMinionValidation } from '@/lib/minion-client';

export default function ImportPage() {
  const [validationResult, setValidationResult] = useState(null);

  const handleFileUpload = async (file: File) => {
    // 1. 预检查
    const preliminaryCheck = await performPreliminaryCheck(file);

    if (preliminaryCheck.hasErrors) {
      showErrors(preliminaryCheck.errors);
      return;
    }

    // 2. 调用 Minion 深度验证
    const validation = await callMinionValidation({
      csvFile: file,
      schemaName: 'MonthlyActualRecordSchema',
      checkMode: 'thorough'  // 使用验证循环
    });

    setValidationResult(validation);

    // 3. 显示验证结果
    if (validation.errors.length > 0) {
      showValidationErrors(validation.errors);
    } else {
      showSuccessAndProceed(validation);
    }
  };

  return (
    <div>
      {/* 上传界面 */}
      <input type="file" onChange={handleFileUpload} />

      {/* 验证结果展示 */}
      {validationResult && (
        <ValidationReport result={validationResult} />
      )}
    </div>
  );
}
```

### 4. 客户端调用封装

```typescript
// src/lib/minion-client.ts
export async function callMinionValidation(params: {
  csvFile: File;
  schemaName: string;
  checkMode?: 'quick' | 'thorough';
}) {
  const response = await fetch('/api/minion/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      csv_path: params.csvFile.name,
      schema: params.schemaName,
      check: params.checkMode === 'thorough'
    })
  });

  return response.json();
}
```

## 与现有功能的配合

### 1. 与 Zod Schema 配合

```typescript
import { MonthlyActualRecordSchema } from '@/schemas/schema';

// 从 Zod schema 生成验证规则
function generateValidationRules(zodSchema: typeof MonthlyActualRecordSchema) {
  // 解析 Zod schema 提取验证规则
  // 转换为 Python 验证脚本
}

// Minion 使用这些规则验证
const rules = generateValidationRules(MonthlyActualRecordSchema);
const result = await callMinionValidation({ rules });
```

### 2. 与文档系统集成

```typescript
// 验证完成后，更新文档索引
if (validationResult.passed) {
  await exec('pnpm docs:sync');
  await exec('pnpm docs:check');
}
```

### 3. 与现有 Skills 配合

- **import-csv Skill**: 处理文件上传和基础解析
- **minion-data-validator Skill**: 执行深度验证
- **check-file Skill**: 最终代码质量检查

## 验证报告格式

```json
{
  "summary": {
    "total_rows": 1200,
    "valid_rows": 1156,
    "error_count": 44,
    "warning_count": 8
  },
  "errors": [
    {
      "row": 23,
      "field": "actual",
      "message": "Value (-500) is below minimum (0)",
      "severity": "error"
    }
  ],
  "warnings": [
    {
      "field": "achievement_rate",
      "message": "Unusually high value (2.5) may indicate data error",
      "severity": "warning"
    }
  ],
  "statistics": {
    "actual": {
      "mean": 125000.50,
      "std": 45000.20,
      "min": 0,
      "max": 500000
    }
  },
  "recommendations": [
    "Check row 23: negative value in actual field",
    "Verify achievement_rate calculation for high values",
    "Consider adding outlier detection for values > 2.0"
  ]
}
```

## 高级功能

### 1. 自定义验证规则

用户可以定义自定义验证规则：

```typescript
const customRules = {
  achievement_rate: {
    max: 1.5,  // 超过 150% 标记为警告
    condition: '(actual > 0) && (target > 0)'
  },
  month: {
    validRange: [1, 12],
    message: 'Month must be between 1 and 12'
  }
};

const result = await callMinionValidation({
  rules: customRules,
  checkMode: 'thorough'
});
```

### 2. 历史对比

```typescript
// 与历史数据对比
const historicalValidation = await callMinionValidation({
  compareWith: 'previous_month',
  detectAnomalies: true
});
```

### 3. 智能修复建议

Minion 可以生成修复脚本：

```python
# Minion 生成的修复脚本
def fix_row_23(df):
    """修复第 23 行的负值问题"""
    df.loc[22, 'actual'] = abs(df.loc[22, 'actual'])
    return df
```

## 错误处理

```typescript
try {
  const result = await callMinionValidation(params);

  if (result.score < 0.8) {
    // 验证分数低，阻止导入
    showBlockingErrors(result.errors);
  } else if (result.warnings.length > 0) {
    // 有警告但允许继续
    showWarningsAndConfirm(result.warnings);
  } else {
    // 完全通过
    proceedWithImport();
  }
} catch (error) {
  if (error.type === 'MinionExecutionError') {
    showMinionError(error.message);
  } else if (error.type === 'ValidationError') {
    showValidationErrors(error.errors);
  }
}
```

## 配置选项

```typescript
// minion-validator.config.ts
export const validatorConfig = {
  // Minion 服务器配置
  minionServer: {
    url: process.env.MINION_URL || 'http://localhost:8000',
    timeout: 30000,
    retryAttempts: 3
  },

  // 验证级别
  validationLevel: process.env.NODE_ENV === 'production'
    ? 'thorough'  // 生产环境使用完整验证
    : 'quick',    // 开发环境快速验证

  // 自动修复
  autoFix: false,  // 不自动修复，需要用户确认

  // 报告格式
  reportFormat: 'json',  // json | html | markdown

  // 异常检测
  anomalyDetection: {
    enabled: true,
    threshold: 2.5  // 标准差倍数
  }
};
```

## 测试

```typescript
// tests/minion-validator.test.ts
import { callMinionValidation } from '@/lib/minion-client';

describe('Minion Data Validator', () => {
  it('should detect negative values', async () => {
    const result = await callMinionValidation({
      csvFile: createTestCSV([{ actual: -100 }]),
      schemaName: 'MonthlyActualRecordSchema'
    });

    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: 'actual',
        message: expect.stringContaining('below minimum')
      })
    );
  });

  it('should detect out-of-range months', async () => {
    const result = await callMinionValidation({
      csvFile: createTestCSV([{ month: 13 }]),
      schemaName: 'MonthlyActualRecordSchema'
    });

    expect(result.errors).toHaveLength(1);
  });

  it('should use verification loop for complex cases', async () => {
    const result = await callMinionValidation({
      csvFile: createLargeTestCSV(),
      checkMode: 'thorough'
    });

    // 验证循环应该提高准确性
    expect(result.score).toBeGreaterThan(0.9);
  });
});
```

## 性能优化

1. **缓存验证结果**: 相同文件不重复验证
2. **并行验证**: 多个文件并行处理
3. **增量验证**: 只验证变更的部分
4. **流式处理**: 大文件分块验证

```typescript
// 缓存示例
const validationCache = new Map();

async function cachedValidation(params: ValidationParams) {
  const cacheKey = generateCacheKey(params);

  if (validationCache.has(cacheKey)) {
    return validationCache.get(cacheKey);
  }

  const result = await callMinionValidation(params);
  validationCache.set(cacheKey, result);

  return result;
}
```

## 监控和日志

```typescript
// 记录验证指标
function logValidationMetrics(result: ValidationResult) {
  metrics.counter('csv.validation.total').increment();
  metrics.counter('csv.validation.errors').increment(result.errorCount);
  metrics.histogram('csv.validation.score').record(result.score);
  metrics.timer('csv.validation.duration').record(result.duration);

  // 发送到监控系统
  if (result.errorCount > 10) {
    alert('High validation error count detected');
  }
}
```

## 相关文档

- `docs/business/数据导入规范.md` - 数据导入业务规则
- `src/schemas/schema.ts` - Zod schema 定义
- `docs/.meta/ai-context.md` - AI 工具集成指南

## 相关文件

- `src/mcp/minion-validator-server.ts` - MCP 服务器实现
- `src/lib/minion-client.ts` - 客户端调用封装
- `src/app/import/page.tsx` - 导入页面
- `scripts/minion-validation.py` - Python 验证脚本模板
