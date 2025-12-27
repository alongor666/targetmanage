# minion-mcp-bridge

将 Minion 框架桥接到 MCP (Model Context Protocol) 的 Skill

## 概述

此 Skill 创建一个双向桥梁，让 Claude Code 能够通过 MCP 协议直接调用 Minion 的所有能力（代码执行、多策略推理、验证循环等），同时让 Minion 能够访问 TargetManage 项目的数据和工具。

## 何时使用

当需要：
- 从 Claude Code 调用 Minion 执行复杂任务
- 让 Minion 访问项目数据进行推理
- 实现 Claude Code ↔ Minion 的双向通信
- 扩展 Minion 的工具集（集成 Serena、文档系统等）

## 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                   Claude Code                            │
│  (使用此 Skill 调用 Minion 能力)                          │
└──────────────────┬──────────────────────────────────────┘
                   │ MCP Protocol
                   ↓
┌──────────────────────────────────────────────────────────┐
│              Minion MCP Bridge Server                    │
│  - 接收 Claude Code 请求                                  │
│  - 转换为 Minion API 调用                                  │
│  - 暴露项目工具给 Minion                                  │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/WebSocket
                   ↓
┌──────────────────────────────────────────────────────────┐
│                  Minion Framework                        │
│  - CodeAgent / Brain                                     │
│  - 验证循环                                               │
│  - 多策略推理                                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
         ┌────────────────────┐
         │  TargetManage      │
         │  - Data loaders    │
         │  - Domain logic    │
         │  - Documentation   │
         └────────────────────┘
```

## 实现方案

### 1. Minion MCP 服务器

```typescript
// src/mcp/minion-bridge-server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

export class MinionMCPServer {
  private server: Server;
  private minionUrl: string;

  constructor(minionUrl: string = process.env.MINION_URL || 'http://localhost:8000') {
    this.minionUrl = minionUrl;
    this.server = new Server(
      {
        name: 'minion-bridge',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'minion_execute',
            description: 'Execute a task using Minion framework with multi-strategy reasoning',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Task description or query',
                },
                route: {
                  type: 'string',
                  enum: ['code', 'cot', 'plan', 'auto'],
                  description: 'Reasoning strategy (code, chain-of-thought, planning, or auto-select)',
                },
                check: {
                  type: 'boolean',
                  description: 'Enable verification loop',
                  default: false,
                },
                improve: {
                  type: 'boolean',
                  description: 'Enable improvement loop',
                  default: false,
                },
                tools: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Tools to make available to Minion',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'minion_analyze_data',
            description: 'Analyze business data using Minion',
            inputSchema: {
              type: 'object',
              properties: {
                dataSource: {
                  type: 'string',
                  description: 'Data source name (actuals_monthly, targets, etc.)',
                },
                analysisType: {
                  type: 'string',
                  enum: ['anomalies', 'trends', 'comparison', 'forecast'],
                  description: 'Type of analysis to perform',
                },
                parameters: {
                  type: 'object',
                  description: 'Analysis parameters',
                },
              },
              required: ['dataSource', 'analysisType'],
            },
          },
          {
            name: 'minion_validate_code',
            description: 'Validate code against business rules using Minion',
            inputSchema: {
              type: 'object',
              properties: {
                files: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Files to validate',
                },
                checks: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['business_rules', 'doc_consistency', 'null_safety', 'purity'],
                  },
                  description: 'Validation checks to perform',
                },
              },
              required: ['files'],
            },
          },
          {
            name: 'minion_generate_test',
            description: 'Generate tests using Minion',
            inputSchema: {
              type: 'object',
              properties: {
                targetFile: {
                  type: 'string',
                  description: 'File to generate tests for',
                },
                testType: {
                  type: 'string',
                  enum: ['unit', 'integration', 'e2e'],
                  description: 'Type of tests to generate',
                },
                framework: {
                  type: 'string',
                  enum: ['jest', 'vitest', 'playwright'],
                  description: 'Testing framework',
                },
              },
              required: ['targetFile'],
            },
          },
          {
            name: 'minion_query_docs',
            description: 'Query documentation and code knowledge graph using Minion',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Query about documentation or code',
                },
                context: {
                  type: 'string',
                  enum: ['business', 'technical', 'both'],
                  description: 'Type of context to search',
                },
              },
              required: ['query'],
            },
          },
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'minion_execute':
            return await this.executeMinion(args);

          case 'minion_analyze_data':
            return await this.analyzeData(args);

          case 'minion_validate_code':
            return await this.validateCode(args);

          case 'minion_generate_test':
            return await this.generateTest(args);

          case 'minion_query_docs':
            return await this.queryDocs(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: error.message,
                stack: error.stack,
              }),
            },
          ],
        };
      }
    });
  }

  private async executeMinion(args: any) {
    const response = await fetch(`${this.minionUrl}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: args.query,
        route: args.route || 'auto',
        check: args.check || false,
        improve: args.improve || false,
        tools: this.prepareTools(args.tools),
      }),
    });

    const result = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async analyzeData(args: any) {
    // 加载项目数据
    const data = await this.loadProjectData(args.dataSource);

    const response = await fetch(`${this.minionUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: data,
        analysis_type: args.analysisType,
        parameters: args.parameters || {},
      }),
    });

    const result = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async validateCode(args: any) {
    const code = await this.loadCodeFiles(args.files);

    const response = await fetch(`${this.minionUrl}/api/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        checks: args.checks || ['business_rules', 'doc_consistency'],
      }),
    });

    const result = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async generateTest(args: any) {
    const code = await this.loadCodeFile(args.targetFile);

    const response = await fetch(`${this.minionUrl}/api/generate-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        test_type: args.testType,
        framework: args.framework || 'jest',
      }),
    });

    const result = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async queryDocs(args: any) {
    // 加载文档索引
    const docsIndex = await this.loadDocsIndex();
    const codeIndex = await this.loadCodeIndex();

    const response = await fetch(`${this.minionUrl}/api/query-docs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: args.query,
        context: args.context || 'both',
        docs_index: docsIndex,
        code_index: codeIndex,
      }),
    });

    const result = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  // 辅助方法：准备工具
  private prepareTools(toolNames?: string[]) {
    const availableTools = {
      // 项目数据工具
      load_actuals_monthly: {
        type: 'function',
        function: {
          name: 'load_actuals_monthly',
          description: 'Load monthly actual data',
          parameters: {
            type: 'object',
            properties: {
              year: { type: 'number' },
            },
          },
        },
      },
      load_targets: {
        type: 'function',
        function: {
          name: 'load_targets',
          description: 'Load annual targets',
          parameters: {
            type: 'object',
            properties: {
              year: { type: 'number' },
            },
          },
        },
      },

      // Domain 层计算工具
      calculate_achievement: {
        type: 'function',
        function: {
          name: 'calculate_achievement',
          description: 'Calculate achievement rate',
          parameters: {
            type: 'object',
            properties: {
              actual: { type: 'number' },
              target: { type: 'number' },
            },
            required: ['actual', 'target'],
          },
        },
      },

      // 文档工具
      search_business_docs: {
        type: 'function',
        function: {
          name: 'search_business_docs',
          description: 'Search business documentation',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string' },
            },
            required: ['query'],
          },
        },
      },
    };

    if (!toolNames) {
      return Object.values(availableTools);
    }

    return toolNames.map((name) => availableTools[name]).filter(Boolean);
  }

  // 辅助方法：加载项目数据
  private async loadProjectData(dataSource: string) {
    switch (dataSource) {
      case 'actuals_monthly':
        return await import('@/services/loaders').then((m) => m.loadActualsMonthly2026());

      case 'targets':
        return await import('@/services/loaders').then((m) => m.loadTargetsAnnual2026());

      default:
        throw new Error(`Unknown data source: ${dataSource}`);
    }
  }

  private async loadCodeFiles(files: string[]) {
    const code = {};
    for (const file of files) {
      const fs = await import('fs/promises');
      const content = await fs.readFile(file, 'utf-8');
      code[file] = content;
    }
    return code;
  }

  private async loadCodeFile(file: string) {
    const fs = await import('fs/promises');
    return await fs.readFile(file, 'utf-8');
  }

  private async loadDocsIndex() {
    const fs = await import('fs/promises');
    const content = await fs.readFile('docs/.meta/docs-index.json', 'utf-8');
    return JSON.parse(content);
  }

  private async loadCodeIndex() {
    const fs = await import('fs/promises');
    const content = await fs.readFile('docs/.meta/code-index.json', 'utf-8');
    return JSON.parse(content);
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error('Minion MCP Bridge Server running on stdio');
  }
}

// 启动服务器
if (require.main === module) {
  const server = new MinionMCPServer();
  server.start().catch(console.error);
}
```

### 2. Minion 端工具适配器

```python
# minion/tools/project_tools.py
"""
Minion 工具集：访问 TargetManage 项目数据和功能
"""
import json
import subprocess
from typing import Any, Dict
from pathlib import Path

class ProjectTools:
    """TargetManage 项目工具集"""

    def __init__(self, project_root: str):
        self.project_root = Path(project_root)

    async def load_actuals_monthly(self, year: int = 2026) -> Dict[str, Any]:
        """加载月度实际数据"""
        # 调用项目数据加载器
        result = subprocess.run(
            ['pnpm', 'exec', 'tsx', '-e', `
              const { loadActualsMonthly2026 } = require('./src/services/loaders');
              console.log(JSON.stringify(loadActualsMonthly2026()));
            `],
            cwd=self.project_root,
            capture_output=True,
            text=True
        )

        return json.loads(result.stdout)

    async def load_targets(self, year: int = 2026) -> Dict[str, Any]:
        """加载年度目标"""
        result = subprocess.run(
            ['pnpm', 'exec', 'tsx', '-e', `
              const { loadTargetsAnnual2026 } = require('./src/services/loaders');
              console.log(JSON.stringify(loadTargetsAnnual2026()));
            `],
            cwd=self.project_root,
            capture_output=True,
            text=True
        )

        return json.loads(result.stdout)

    async def calculate_achievement(self, actual: float, target: float) -> float | None:
        """计算达成率（使用项目的 domain 层逻辑）"""
        if target == 0:
            return None  # 遵循 null 安全原则

        result = subprocess.run(
            ['pnpm', 'exec', 'tsx', '-e', `
              const { calculateAchievementRate } = require('./src/domain/achievement');
              console.log(calculateAchievementRate(${actual}, ${target}));
            `],
            cwd=self.project_root,
            capture_output=True,
            text=True
        )

        return float(result.stdout.strip()) if result.stdout.strip() else None

    async def search_business_docs(self, query: str) -> Dict[str, Any]:
        """搜索业务文档"""
        # 读取文档索引
        docs_index_path = self.project_root / 'docs/.meta/docs-index.json'

        with open(docs_index_path) as f:
            docs_index = json.load(f)

        # 简单的关键词搜索
        results = []
        for doc_path, doc_info in docs_index['documents'].items():
            if query.lower() in doc_info.get('title', '').lower():
                results.append({
                    'path': doc_path,
                    'title': doc_info.get('title', ''),
                    'excerpt': doc_info.get('summary', '')[:200]
                })

        return {'query': query, 'results': results}

    async def verify_doc_consistency(self) -> Dict[str, Any]:
        """验证文档-代码一致性"""
        code_index_path = self.project_root / 'docs/.meta/code-index.json'
        docs_index_path = self.project_root / 'docs/.meta/docs-index.json'

        with open(code_index_path) as f:
            code_index = json.load(f)

        with open(docs_index_path) as f:
            docs_index = json.load(f)

        issues = []

        # 检查代码模块是否都有文档
        for module_path, module_info in code_index['modules'].items():
            if not module_info.get('documentedIn'):
                issues.append({
                    'type': 'missing_documentation',
                    'module': module_path,
                    'severity': 'warning'
                })

        # 检查文档是否都有实现
        for doc_path, doc_info in docs_index['documents'].items():
            if not doc_info.get('implementedIn'):
                issues.append({
                    'type': 'unimplemented_document',
                    'document': doc_path,
                    'severity': 'warning'
                })

        return {
            'total_issues': len(issues),
            'issues': issues,
            'score': 1.0 - (len(issues) / max(len(code_index['modules']), 1))
        }


def register_tools(minion_instance):
    """注册工具到 Minion 实例"""
    tools = ProjectTools(minion_instance.project_root)

    minion_instance.register_tool({
        'name': 'load_actuals_monthly',
        'function': tools.load_actuals_monthly,
        'description': 'Load monthly actual data from the project'
    })

    minion_instance.register_tool({
        'name': 'load_targets',
        'function': tools.load_targets,
        'description': 'Load annual targets from the project'
    })

    minion_instance.register_tool({
        'name': 'calculate_achievement',
        'function': tools.calculate_achievement,
        'description': 'Calculate achievement rate using domain logic'
    })

    minion_instance.register_tool({
        'name': 'search_business_docs',
        'function': tools.search_business_docs,
        'description': 'Search business documentation'
    })

    minion_instance.register_tool({
        'name': 'verify_doc_consistency',
        'function': tools.verify_doc_consistency,
        'description': 'Verify documentation-code consistency'
    })
```

### 3. Claude Code 配置

```json
// .claude/settings.local.json
{
  "mcpServers": {
    "minion-bridge": {
      "command": "node",
      "args": [
        "-e",
        "require('./src/mcp/minion-bridge-server').new MinionMCPServer().start()"
      ],
      "env": {
        "MINION_URL": "http://localhost:8000"
      }
    }
  }
}
```

### 4. 使用示例

```typescript
// 从 Claude Code 调用 Minion
// 示例 1: 业务分析
const analysisResult = await minion_execute({
  query: '分析本月的异常达成率数据，识别需要关注的机构',
  route: 'code',  # 使用代码执行策略
  check: true,    # 启用验证循环
  tools: ['load_actuals_monthly', 'calculate_achievement']
});

console.log('分析结果:', analysisResult);

// 示例 2: 代码验证
const validationResult = await minion_validate_code({
  files: ['src/domain/achievement.ts'],
  checks: ['business_rules', 'doc_consistency', 'null_safety']
});

console.log('验证结果:', validationResult);

// 示例 3: 文档查询
const docResult = await minion_query_docs({
  query: '达成率计算的业务规则是什么？',
  context: 'business'
});

console.log('文档查询结果:', docResult);

// 示例 4: 测试生成
const testResult = await minion_generate_test({
  targetFile: 'src/domain/achievement.ts',
  testType: 'unit',
  framework: 'vitest'
});

console.log('生成的测试:', testResult);
```

## 与现有 Skills 的集成

### 工作流编排

```yaml
场景 1: 数据导入验证
  steps:
    1. import-csv:
       - 用户上传 CSV 文件

    2. minion-mcp-bridge:
       - 调用 Minion 执行深度验证
       - 检测异常值和一致性问题

    3. data-validator:
       - 应用 Zod schema 验证

    4. result:
       - 显示验证报告
       - 提供修复建议

场景 2: 代码开发工作流
  steps:
    1. 用户修改 domain 层代码

    2. minion-mcp-bridge:
       - 验证业务规则符合性
       - 检查文档-代码一致性
       - 验证 null 安全

    3. minion-code-reviewer:
       - 生成详细审查报告

    4. husky:
       - 运行 typecheck
       - 运行 docs:check

    5. commit-fast:
       - 如果所有检查通过，提交代码

场景 3: 智能分析
  steps:
    1. 用户查看仪表盘

    2. minion-mcp-bridge:
       - 调用 minion_analyze_data
       - 检测异常趋势
       - 生成洞察

    3. minion-business-analyzer:
       - 展示分析结果
       - 可视化建议

场景 4: 测试生成
  steps:
    1. 用户开发新功能

    2. minion-mcp-bridge:
       - 调用 minion_generate_test
       - 基于业务规则生成测试

    3. write-tests:
       - 写入测试文件

    4. test-coverage:
       - 运行测试并检查覆盖率
```

## 配置和部署

### 1. Minion 服务器配置

```yaml
# config/minion.yaml
models:
  "default":
    api_type: "openai"
    base_url: "${OPENAI_BASE_URL}"
    api_key: "${OPENAI_API_KEY}"
    model: "gpt-4.1"
    temperature: 0

tools:
  - name: "project_tools"
    path: "/path/to/minion/tools/project_tools.py"
    type: "python"

routes:
  code:
    workers: ["PythonMinion", "CodeMinion"]
    check: true
    improve: true

  cot:
    workers: ["CotMinion"]
    check: false

  plan:
    workers: ["PlanMinion"]
    check: true
```

### 2. 部署脚本

```bash
#!/bin/bash
# scripts/start-minion-bridge.sh

echo "🚀 Starting Minion MCP Bridge..."

# 检查 Minion 是否运行
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "❌ Minion server is not running. Please start Minion first."
    echo "   Run: cd /path/to/minion && python -m minion.cli"
    exit 1
fi

# 启动 MCP Bridge
echo "✅ Minion is running. Starting MCP Bridge..."
node -e "
  const { MinionMCPServer } = require('./src/mcp/minion-bridge-server');
  const server = new MinionMCPServer();
  server.start();
"
```

### 3. Docker Compose（可选）

```yaml
# docker-compose.yml
version: '3.8'

services:
  minion:
    image: minion:latest
    ports:
      - "8000:8000"
    volumes:
      - ./config:/app/config
      - ./project:/app/project
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENAI_BASE_URL=${OPENAI_BASE_URL}

  minion-bridge:
    build: .
    depends_on:
      - minion
    environment:
      - MINION_URL=http://minion:8000
    volumes:
      - ./src:/app/src
      - ./docs:/app/docs
```

## 测试和验证

```typescript
// tests/minion-bridge.test.ts
import { MinionMCPServer } from '@/mcp/minion-bridge-server';

describe('Minion MCP Bridge', () => {
  let server: MinionMCPServer;

  beforeAll(() => {
    server = new MinionMCPServer('http://localhost:8000');
  });

  it('should execute Minion tasks', async () => {
    const result = await server.executeMinion({
      query: 'What is 2 + 2?',
      route: 'cot'
    });

    expect(result.answer).toContain('4');
  });

  it('should analyze project data', async () => {
    const result = await server.analyzeData({
      dataSource: 'actuals_monthly',
      analysisType: 'trends'
    });

    expect(result).toHaveProperty('trends');
  });

  it('should validate code', async () => {
    const result = await server.validateCode({
      files: ['src/domain/achievement.ts'],
      checks: ['null_safety']
    });

    expect(result).toHaveProperty('issues');
  });

  it('should query documentation', async () => {
    const result = await server.queryDocs({
      query: 'achievement rate calculation',
      context: 'business'
    });

    expect(result.results).toBeInstanceOf(Array);
  });
});
```

## 性能优化

1. **连接池**: 复用 Minion HTTP 连接
2. **缓存**: 缓存常见查询结果
3. **并行处理**: 支持批量请求
4. **流式响应**: 支持流式返回 Minion 推理过程

```typescript
// 性能优化示例
class MinionMCPServer {
  private connectionPool: Map<string, any>;
  private cache: LRUCache;

  async executeMinion(args: any) {
    // 检查缓存
    const cacheKey = this.generateCacheKey(args);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // 使用连接池
    const connection = await this.getConnection();

    // 执行请求
    const result = await connection.request(args);

    // 缓存结果
    this.cache.set(cacheKey, result);

    return result;
  }
}
```

## 监控和日志

```typescript
// 监控 Minion 调用
function monitorMinionCall(method: string, args: any, result: any) {
  metrics.counter('minion.calls.total', { method }).increment();
  metrics.timer('minion.duration', { method }).record(result.duration);

  if (result.error) {
    metrics.counter('minion.errors.total', { method: result.error }).increment();
  }

  // 记录使用统计
  logger.info('Minion call', {
    method,
    args: JSON.stringify(args),
    success: !result.error,
    duration: result.duration
  });
}
```

## 相关文档

- Minion 官方文档: https://github.com/femto/minion
- MCP 协议规范: https://modelcontextprotocol.io
- `docs/.meta/ai-context.md` - AI 工具集成指南

## 相关文件

- `src/mcp/minion-bridge-server.ts` - MCP 服务器实现
- `minion/tools/project_tools.py` - Minion 端工具适配器
- `.claude/settings.local.json` - Claude Code 配置
- `scripts/start-minion-bridge.sh` - 启动脚本
