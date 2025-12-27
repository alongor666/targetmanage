# Minion Integration Guide

## 概述

本类别包含 Minion 框架的集成技能，用于增强 TargetManage 项目的数据分析、代码审查和测试生成能力。

**Minion 是什么？**

Minion 是一个 Python AI Agent 框架，提供：
- 多策略推理（CoT、代码执行、规划）
- 验证循环（自我检查和改进）
- 丰富的数据分析库（Pandas、NumPy、SciPy）

**为什么使用 Minion？**

| 特性 | 项目原生能力 | Minion 增强 |
|------|--------------|------------|
| 数据验证 | Zod schema | 统计学异常检测 |
| 业务分析 | Domain 计算 | 智能洞察生成 |
| 代码审查 | ESLint/TypeScript | 业务规则符合性 |
| 测试生成 | 手动编写 | 自动化生成 |

---

## 部署方式

### 选项 1：Docker（推荐）

```bash
# 拉取 Minion 镜像
docker pull femto/minion:latest

# 启动 Minion 服务
docker run -d \
  -p 8000:8000 \
  -v $(pwd)/.claude/minion.config.json:/app/config.json \
  --name minion-server \
  femto/minion:latest

# 验证服务运行
curl http://localhost:8000/health
```

### 选项 2：本地 Python

```bash
# 安装 Minion
pip install minion-framework

# 启动 Minion 服务器
minion-server start --port 8000 --config .claude/minion.config.json
```

### 选项 3：远程服务器

```bash
# 在远程服务器上启动
ssh user@server "minion-server start --port 8000"

# 在项目中配置远程地址
# 编辑 .claude/minion.config.json
{
  "server": {
    "url": "http://server-ip:8000"
  }
}
```

---

## 配置

### 1. 创建配置文件

```bash
# 复制配置模板
cp .claude/minion.config.example.json .claude/minion.config.json
```

### 2. 编辑配置

```json
{
  "version": "1.0.0",
  "mode": "api",
  "server": {
    "url": "http://localhost:8000",
    "timeout": 30000,
    "retryAttempts": 3
  },
  "skills": {
    "data-validation": {
      "enabled": true,
      "endpoint": "/api/validate",
      "timeout": 10000
    },
    "business-analysis": {
      "enabled": true,
      "endpoint": "/api/analyze",
      "timeout": 30000
    },
    "code-review": {
      "enabled": true,
      "endpoint": "/api/review",
      "timeout": 20000
    },
    "test-generation": {
      "enabled": true,
      "endpoint": "/api/generate-tests",
      "timeout": 15000
    }
  },
  "fallback": {
    "mode": "cli",
    "command": "minion"
  }
}
```

### 3. 测试连接

```bash
# 测试 Minion 服务
curl http://localhost:8000/health

# 预期输出
{"status": "ok", "version": "1.0.0"}
```

---

## 使用场景

### 数据验证（data-validation）

**用途**：CSV 数据导入前的深度验证

**调用方式**：
```typescript
import { callMinionAPI } from '@/lib/minion-client';

const result = await callMinionAPI({
  endpoint: '/api/validate',
  method: 'POST',
  body: {
    csvData: csvText,
    config: {
      schema: 'MonthlyActualRecordSchema',
      checks: {
        organization: true,
        anomalies: true
      }
    }
  }
});
```

**详细文档**: @code data-validation/SKILL.md

---

### 业务分析（business-analysis）

**用途**：智能业务数据分析和洞察生成

**调用方式**：
```typescript
const analysis = await callMinionAPI({
  endpoint: '/api/analyze',
  method: 'POST',
  body: {
    type: 'achievement-analysis',
    data: orgData,
    options: {
      detectAnomalies: true,
      generateInsights: true
    }
  }
});
```

**详细文档**: @code business-analysis/SKILL.md

---

### 代码审查（code-review）

**用途**：智能代码质量审查

**调用方式**：
```typescript
const review = await callMinionAPI({
  endpoint: '/api/review',
  method: 'POST',
  body: {
    files: codeChanges,
    checks: {
      businessRules: true,
      docConsistency: true
    }
  }
});
```

**详细文档**: @code code-review/SKILL.md

---

### 测试生成（test-generation）

**用途**：自动生成测试用例

**调用方式**：
```typescript
const tests = await callMinionAPI({
  endpoint: '/api/generate-tests',
  method: 'POST',
  body: {
    target: {
      type: 'function',
      name: 'calculateAchievementRate',
      code: functionCode
    },
    framework: 'vitest'
  }
});
```

**详细文档**: @code test-generation/SKILL.md

---

## 故障排除

### 问题 1：连接失败

**症状**：`Error: Minion API error: ECONNREFUSED`

**解决方案**：
```bash
# 1. 检查 Minion 服务状态
curl http://localhost:8000/health

# 2. 检查 Docker 容器
docker ps | grep minion

# 3. 查看服务日志
docker logs minion-server

# 4. 重启服务
docker restart minion-server
```

---

### 问题 2：超时

**症状**：`Error: Minion API error: Request timeout`

**解决方案**：
```json
// 增加超时时间
{
  "server": {
    "timeout": 60000
  }
}
```

---

### 问题 3：降级到 CLI 模式

**症状**：API 服务不可用，但需要紧急使用

**解决方案**：
```json
{
  "fallback": {
    "mode": "cli"
  }
}
```

```bash
# 使用 CLI 模式
minion run --skill data-validation --input.csv data.csv --output report.json
```

---

## 集成代码

### Minion 客户端

```typescript
// src/lib/minion-client.ts
export enum MinionMode {
  API = 'api',
  CLI = 'cli',
  Local = 'local'
}

export async function callMinionAPI<T>(params: {
  endpoint: string;
  method: 'GET' | 'POST';
  body?: any;
}): Promise<T> {
  const config = await loadMinionConfig();

  const response = await fetch(`${config.server.url}${params.endpoint}`, {
    method: params.method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params.body),
    signal: AbortSignal.timeout(config.server.timeout)
  });

  if (!response.ok) {
    throw new Error(`Minion API error: ${response.statusText}`);
  }

  return response.json();
}
```

### 配置加载

```typescript
// src/lib/minion-config.ts
export interface MinionConfig {
  version: string;
  mode: MinionMode;
  server: {
    url: string;
    timeout: number;
    retryAttempts: number;
  };
  skills: Record<string, {
    enabled: boolean;
    endpoint: string;
    timeout: number;
  }>;
}

export async function loadMinionConfig(): Promise<MinionConfig> {
  const configPath = '.claude/minion.config.json';
  const configContent = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(configContent);
}
```

---

## 最佳实践

### 1. 错误处理

```typescript
try {
  const result = await callMinionAPI({...});
} catch (error) {
  if (error.message.includes('ECONNREFUSED')) {
    console.error('Minion 服务未启动');
    console.error('请运行: docker start minion-server');
  } else {
    throw error;
  }
}
```

### 2. 性能优化

```typescript
// 缓存结果
const cache = new Map();

async function cachedMinionCall(key: string, params: any) {
  if (cache.has(key)) {
    return cache.get(key);
  }

  const result = await callMinionAPI(params);
  cache.set(key, result);
  return result;
}
```

### 3. 渐进式启用

```json
// 先只启用一个技能测试
{
  "skills": {
    "data-validation": {
      "enabled": true
    },
    "business-analysis": {
      "enabled": false  // 暂时禁用
    }
  }
}
```

---

## 相关文档

### 项目文档
- @doc docs/.meta/ai-context.md
- @doc docs/development/开发指南.md

### 技能文档
- @code data-validation/SKILL.md
- @code business-analysis/SKILL.md
- @code code-review/SKILL.md
- @code test-generation/SKILL.md

### 集成代码
- @code src/lib/minion-client.ts
- @code src/lib/minion-config.ts

---

## 支持

### 获取帮助

1. **查阅文档**：查看各技能的 SKILL.md 文件
2. **检查 Issues**：搜索 Minion 项目 Issues
3. **提 Issue**：创建详细的 bug 报告

### 外部资源

- **Minion GitHub**: https://github.com/femto/minion
- **Minion Discord**: https://discord.gg/HUC6xEK9aT
- **文档**: https://deepwiki.com/femto/minion
