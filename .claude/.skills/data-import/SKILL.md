---
name: data-import
description: 车险经营数据导入技能，支持CSV/JSON解析、验证、优先级管理
license: MIT
version: 1.0.0
category: data-processing
---

# Data Import Skill

## 能力概述
此技能提供车险经营数据的完整导入解决方案，支持 CSV 和 JSON 格式，包含数据解析、验证、优先级管理和错误处理。

## 支持的数据类型

### 1. 年度目标数据 (`targets_annual_2026.json`)
```json
{
  "year": 2026,
  "unit": "万元",
  "type": "targets_annual",
  "records": [
    {
      "org_cn": "成都分公司",
      "product_cn": "车险",
      "annual_target": 120000
    }
  ]
}
```

### 2. 年度实际数据 (`actuals_annual_2025.json`)
```json
{
  "year": 2025,
  "unit": "万元",
  "type": "actuals_annual",
  "records": [
    {
      "org_cn": "成都分公司",
      "product_cn": "车险",
      "annual_actual": 95000
    }
  ]
}
```

### 3. 月度实际数据 (`actuals_monthly_2026.csv`)
```csv
year,month,org_cn,product_cn,premium
2026,1,成都分公司,车险,8500
2026,2,成都分公司,车险,9200
2026,3,成都分公司,车险,10500
```

## 数据加载优先级

系统遵循以下 4 级优先级策略：

```
优先级 1（最高）: localStorage (用户导入数据)
优先级 2: public/data (静态默认数据)
优先级 3: 兼容路径 (旧文件名)
优先级 4（最低）: fallback (空数据)
```

## CSV 解析流程

### 使用 PapaParse 库
```typescript
import Papa from "papaparse";

function parseMonthlyCsv(text: string) {
  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase()
  });

  if (parsed.errors?.length) {
    throw new Error(`csv_parse_error: ${parsed.errors[0].message}`);
  }

  return parsed.data;
}
```

### CSV 字段映射
| CSV 列名 | JSON 字段 | 类型 | 必填 | 说明 |
|---------|-----------|------|------|------|
| year | year | number | ✅ | 年份（如 2026） |
| month | month | number | ✅ | 月份（1-12） |
| org_cn | org_cn | string | ✅ | 机构中文名称 |
| product_cn | product_cn | string | ✅ | 产品中文名称 |
| premium | premium | number | ✅ | 保费（万元） |

## 数据验证规则

### 1. 机构验证
```typescript
// 检查机构是否存在于 orgs.json
function validateOrganization(org_cn: string): boolean {
  const orgs = loadOrgs(); // 加载机构列表
  return orgs.some(org => org.name_cn === org_cn);
}
```

### 2. 产品验证
```typescript
// 支持的产品类型
const VALID_PRODUCTS = ['车险', '非车险', '健康险'];

function validateProduct(product_cn: string): boolean {
  return VALID_PRODUCTS.includes(product_cn);
}
```

### 3. 数据范围验证
```typescript
function validatePremium(premium: number): boolean {
  return premium >= 0 && premium <= 1000000; // 合理范围
}

function validateMonth(month: number): boolean {
  return month >= 1 && month <= 12;
}
```

### 4. 重复数据检测
```typescript
function detectDuplicates(records: Array<any>): void {
  const seen = new Set();
  records.forEach((record, index) => {
    const key = `${record.year}_${record.month}_${record.org_cn}_${record.product_cn}`;
    if (seen.has(key)) {
      console.warn(`Duplicate record at index ${index}: ${key}`);
    }
    seen.add(key);
  });
}
```

## 错误处理

### 常见错误类型

| 错误码 | 错误信息 | 处理方式 |
|-------|---------|---------|
| `csv_parse_error` | CSV 解析失败 | 显示具体行号和错误原因 |
| `invalid_org` | 机构名称无效 | 提示使用有效机构名称 |
| `invalid_product` | 产品名称无效 | 提示支持的产品类型 |
| `invalid_premium` | 保费值超出范围 | 提示合理范围 |
| `invalid_month` | 月份无效 | 提示 1-12 范围 |
| `duplicate_record` | 重复记录 | 警告但继续处理 |

### 错误处理示例
```typescript
try {
  const data = parseMonthlyCsv(csvText);
  const validated = data.map(record => {
    if (!validateOrganization(record.org_cn)) {
      throw new Error(`Invalid organization: ${record.org_cn}`);
    }
    if (!validateProduct(record.product_cn)) {
      throw new Error(`Invalid product: ${record.product_cn}`);
    }
    return record;
  });
  return validated;
} catch (error) {
  console.error('Data import error:', error);
  throw error; // 重新抛出以便上层处理
}
```

## 使用示例

### 示例 1：导入 CSV 文件
```
用户请求：帮我导入这份月度数据 2026.csv

AI 处理流程：
1. 使用 PapaParse 解析 CSV
2. 验证机构、产品、保费、月份字段
3. 检测重复数据
4. 将数据保存到 localStorage
5. 刷新页面显示新数据
```

### 示例 2：导入 JSON 文件
```
用户请求：导入年度目标数据

AI 处理流程：
1. 使用 Zod schema 验证 JSON 结构
2. 检查必填字段
3. 验证数据类型（年份、保费等）
4. 保存到指定存储位置
5. 返回导入记录数
```

### 示例 3：数据降级处理
```
场景：用户导入的 CSV 数据有缺失

AI 处理流程：
1. 尝试加载 localStorage 数据 → 失败
2. 尝试加载 public/data 数据 → 失败
3. 尝试加载兼容路径数据 → 成功
4. 记录降级日志
5. 继续处理业务逻辑
```

## 依赖项

### 运行时依赖
- `papaparse`: ^5.4.1 (CSV 解析)
- `zod`: ^3.23.8 (数据验证)

### 数据文件
- `/public/data/orgs.json` (机构列表)
- `/public/data/allocation_rules.json` (权重规则)

## 最佳实践

1. **数据备份**：每次导入前先备份现有数据
2. **增量验证**：逐条验证并记录错误位置
3. **友好提示**：提供具体的错误原因和修复建议
4. **批量回滚**：导入失败时支持回滚到导入前状态
5. **进度反馈**：大数据量导入时显示进度条

## 参考文档
- @doc docs/development/数据导入指南.md
- @doc docs/business/数据校验标准.md
- @code src/services/loaders.ts
- @code src/schemas/schema.ts
