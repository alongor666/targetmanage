# minion-code-reviewer

使用 Minion 框架进行智能代码审查的 Skill

## 概述

此 Skill 利用 Minion 的验证循环和多策略推理能力，对 TargetManage 项目进行深度代码审查，特别关注：
- 业务规则符合性
- 文档-代码一致性
- Domain 层纯函数验证
- @doc 标签完整性
- TypeScript 类型安全

## 何时使用

当用户需要：
- 提交代码前进行深度审查
- 检查代码是否符合业务文档规范
- 验证文档-代码索引一致性
- 确保所有 domain 函数有完整 @doc 标签

## 工作流程

```
代码变更检测
    ↓
Claude Code 调用此 Skill
    ↓
Minion 分析代码和相关文档
    ↓
执行多维度审查（业务规则、文档一致性、类型安全）
    ↓
验证循环改进审查结果
    ↓
生成详细审查报告
    ↓
显示问题和修复建议
```

## 核心功能

### 1. 业务规则符合性检查

```python
# Minion 执行的业务规则检查脚本
import ast
import re
from pathlib import Path

def check_business_rule_compliance(file_path, business_docs):
    """
    检查代码实现是否符合业务文档规则

    Args:
        file_path: 代码文件路径
        business_docs: 业务文档内容

    Returns:
        符合性报告
    """
    with open(file_path) as f:
        code = f.read()

    tree = ast.parse(code)
    issues = []

    # 检查 domain 层函数
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            # 检查是否有 @doc 标签
            docstring = ast.get_docstring(node)
            if not docstring or '@doc' not in docstring:
                issues.append({
                    'type': 'missing_doc_tag',
                    'function': node.name,
                    'line': node.lineno,
                    'severity': 'error'
                })

            # 检查是否引用了业务文档
            if docstring and '@doc' in docstring:
                doc_match = re.search(r'@doc\s+(.+)', docstring)
                if doc_match:
                    doc_ref = doc_match.group(1).strip()
                    if not business_doc_exists(doc_ref, business_docs):
                        issues.append({
                            'type': 'invalid_doc_reference',
                            'function': node.name,
                            'reference': doc_ref,
                            'line': node.lineno,
                            'severity': 'error'
                        })

    return {
        'file': str(file_path),
        'issues': issues,
        'score': calculate_compliance_score(issues)
    }

def verify_null_safety(file_path):
    """
    验证 domain 层代码遵循 null 安全规则
    """
    with open(file_path) as f:
        code = f.read()

    issues = []

    # 检查是否返回 0 而不是 null
    if re.search(r'return\s+0\s*;', code):
        # 检查上下文是否应该是 null
        if 'division' in code or 'target === 0' in code:
            issues.append({
                'type': 'null_safety_violation',
                'message': 'Should return null instead of 0 for impossible calculations',
                'severity': 'error'
            })

    return issues
```

### 2. 文档-代码一致性验证

```python
def verify_doc_code_consistency(code_index_path, docs_index_path):
    """
    验证 docs/.meta/code-index.json 和 docs-index.json 的一致性
    """
    import json

    with open(code_index_path) as f:
        code_index = json.load(f)

    with open(docs_index_path) as f:
        docs_index = json.load(f)

    issues = []

    # 检查每个代码模块是否都有 documentedIn
    for module_path, module_info in code_index['modules'].items():
        if not module_info.get('documentedIn'):
            issues.append({
                'type': 'missing_documentation',
                'module': module_path,
                'severity': 'warning'
            })

    # 检查每个文档是否都有 implementedIn
    for doc_path, doc_info in docs_index['documents'].items():
        if not doc_info.get('implementedIn'):
            issues.append({
                'type': 'unimplemented_document',
                'document': doc_path,
                'severity': 'warning'
            })

    # 检查引用完整性
    for module_path, module_info in code_index['modules'].items():
        for doc_ref in module_info.get('documentedIn', []):
            doc_path = doc_ref.split(':')[0].strip()
            if doc_path not in docs_index['documents']:
                issues.append({
                    'type': 'broken_doc_reference',
                    'module': module_path,
                    'reference': doc_ref,
                    'severity': 'error'
                })

    return issues
```

### 3. Domain 层纯函数检查

```python
def verify_domain_layer_purity(file_path):
    """
    验证 domain 层函数的纯函数特性
    """
    with open(file_path) as f:
        code = f.read()

    tree = ast.parse(code)
    issues = []

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            # 检查是否有副作用操作
            for child in ast.walk(node):
                # 检查文件 I/O
                if isinstance(child, ast.Call):
                    if (isinstance(child.func, ast.Attribute) and
                        child.func.attr in ['read', 'write', 'open']):
                        issues.append({
                            'type': 'side_effect_in_domain',
                            'function': node.name,
                            'operation': f'File I/O: {child.func.attr}',
                            'line': child.lineno,
                            'severity': 'error'
                        })

                # 检查网络请求
                if isinstance(child, ast.Call):
                    if (isinstance(child.func, ast.Name) and
                        child.func.id in ['fetch', 'axios', 'request']):
                        issues.append({
                            'type': 'side_effect_in_domain',
                            'function': node.name,
                            'operation': f'Network request: {child.func.id}',
                            'line': child.lineno,
                            'severity': 'error'
                        })

    return issues
```

## MCP 集成

```typescript
// src/mcp/minion-reviewer-server.ts
export class MinionReviewerServer {
  private server: MCPServer;

  constructor() {
    this.server = new MCPServer({
      name: 'minion-reviewer',
      version: '1.0.0'
    });

    this.registerTools();
  }

  private registerTools() {
    this.server.registerTool({
      name: 'review_code_changes',
      description: 'Review code changes using Minion framework',
      inputSchema: {
        type: 'object',
        properties: {
          files: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of changed files'
          },
          reviewLevel: {
            type: 'string',
            enum: ['quick', 'standard', 'thorough'],
            description: 'Review depth level'
          }
        },
        required: ['files']
      }
    });

    this.server.registerTool({
      name: 'verify_doc_consistency',
      description: 'Verify documentation-code consistency',
      inputSchema: {
        type: 'object',
        properties: {
          autoFix: {
            type: 'boolean',
            description: 'Auto-fix minor issues'
          }
        }
      }
    });
  }

  async reviewCodeChanges(args: any) {
    const reviewTasks = args.files.map((file: string) => {
      return this.callMinion({
        route: 'code',
        code: this.generateReviewScript(file),
        input: {
          file_path: file,
          review_level: args.reviewLevel || 'standard'
        },
        check: true,  // 启用验证循环
        improve: true  // 启用改进循环
      });
    });

    const results = await Promise.all(reviewTasks);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(this.aggregateResults(results), null, 2)
      }]
    };
  }

  private generateReviewScript(file: string): string {
    // 根据文件类型生成审查脚本
    if (file.startsWith('src/domain/')) {
      return `
# Domain layer review for ${file}
import sys
sys.path.append('/path/to/minion/reviewers')

from domain_reviewer import (
    check_business_rule_compliance,
    verify_null_safety,
    verify_domain_layer_purity
)

result = {
    'business_rules': check_business_rule_compliance('${file}'),
    'null_safety': verify_null_safety('${file}'),
    'purity': verify_domain_layer_purity('${file}')
}

print(json.dumps(result, indent=2))
`;
    } else {
      return `
# General code review for ${file}
import ast

# 执行通用代码审查
# ...
`;
    }
  }

  private async callMinion(params: any) {
    // 调用 Minion API
    const response = await fetch(`${process.env.MINION_URL}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    return response.json();
  }

  private aggregateResults(results: any[]) {
    // 聚合多个文件的审查结果
    return {
      total_files: results.length,
      total_issues: results.reduce((sum, r) => sum + r.issue_count, 0),
      files: results.map(r => ({
        path: r.file,
        issues: r.issues,
        score: r.score
      })),
      overall_score: this.calculateOverallScore(results)
    };
  }

  private calculateOverallScore(results: any[]): number {
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    return Math.round(avgScore * 100) / 100;
  }
}
```

## Git Hook 集成

```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "🔍 Running Minion code review..."

# 获取暂存的文件
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.ts$')

if [ -z "$STAGED_FILES" ]; then
    echo "No TypeScript files to review"
    exit 0
fi

# 调用 Minion 审查
REVIEW_RESULT=$(cat <<EOF | node -e "
const { spawn } = require('child_process');
const reviewer = require('./src/mcp/minion-reviewer-server');

const files = $(echo $STAGED_FILES | jq -R -s -c 'split("\n")[:-1]');

reviewer.reviewCodeChanges({
    files: files,
    reviewLevel: 'standard'
}).then(result => {
    console.log(JSON.stringify(result));
    process.exit(result.blocking_issues > 0 ? 1 : 0);
});
"
)

# 检查结果
echo "$REVIEW_RESULT" | jq '.'

BLOCKING_ISSUES=$(echo "$REVIEW_RESULT" | jq -r '.blocking_issues // 0')

if [ "$BLOCKING_ISSUES" -gt 0 ]; then
    echo "❌ Code review failed with $BLOCKING_ISSUES blocking issues"
    echo "Please fix the issues before committing"
    exit 1
else
    echo "✅ Code review passed"
fi

# 继续其他检查
pnpm typecheck
pnpm docs:check
```

## CLI 工具

```typescript
// scripts/minion-review.ts
import { program } from 'commander';
import { MinionReviewerServer } from '../src/mcp/minion-reviewer-server';

program
  .command('review')
  .description('Review code changes using Minion')
  .option('-f, --files <files...>', 'Files to review')
  .option('-l, --level <level>', 'Review level (quick|standard|thorough)', 'standard')
  .option('--fix', 'Auto-fix minor issues')
  .action(async (options) => {
    const reviewer = new MinionReviewerServer();

    if (!options.files || options.files.length === 0) {
      // 获取 git 变更文件
      const { execSync } = require('child_process');
      const changedFiles = execSync('git diff --name-only HEAD')
        .toString()
        .split('\n')
        .filter(f => f.endsWith('.ts'));

      options.files = changedFiles;
    }

    console.log(`🔍 Reviewing ${options.files.length} files...`);

    const result = await reviewer.reviewCodeChanges({
      files: options.files,
      reviewLevel: options.level
    });

    displayResults(result);

    if (options.fix && result.fixable_issues > 0) {
      console.log('\n🔧 Auto-fixing issues...');
      await reviewer.autoFixIssues(result.issues);
    }
  });

program.parse(process.argv);

function displayResults(result: any) {
  console.log('\n📊 Review Results:');
  console.log(`   Total Files: ${result.total_files}`);
  console.log(`   Total Issues: ${result.total_issues}`);
  console.log(`   Overall Score: ${result.overall_score}`);

  if (result.blocking_issues > 0) {
    console.log(`\n❌ Blocking Issues: ${result.blocking_issues}`);
    result.issues
      .filter((i: any) => i.severity === 'error')
      .forEach((issue: any) => {
        console.log(`   - ${issue.file}:${issue.line} - ${issue.message}`);
      });
  }
}
```

## 与现有 Skills 配合

```yaml
工作流:
  1. user-code-change:
     - 用户修改代码

  2. minion-code-reviewer:
     - 执行深度代码审查
     - 检查业务规则符合性
     - 验证文档一致性

  3. husky:
     - 运行 CI 检查
     - 执行 typecheck 和 docs:check

  4. commit-fast:
     - 如果所有检查通过，自动提交

  5. add-to-changelog:
     - 更新变更日志
```

## 审查报告格式

```json
{
  "summary": {
    "total_files": 5,
    "total_issues": 12,
    "blocking_issues": 2,
    "overall_score": 0.85
  },
  "files": [
    {
      "path": "src/domain/achievement.ts",
      "score": 0.92,
      "issues": [
        {
          "type": "missing_doc_tag",
          "function": "calculateAchievementRate",
          "line": 15,
          "severity": "error",
          "suggestion": "Add @doc tag referencing docs/business/指标定义规范.md"
        },
        {
          "type": "null_safety_violation",
          "function": "calculateAchievementRate",
          "line": 23,
          "severity": "warning",
          "message": "Consider returning null instead of 0 when target is 0"
        }
      ],
      "business_rules_compliance": true,
      "doc_consistency": true,
      "purity": true
    }
  ],
  "aggregated_metrics": {
    "doc_coverage": 0.95,
    "null_safety_score": 0.88,
    "type_safety_score": 1.0,
    "business_rule_compliance": 0.92
  },
  "recommendations": [
    "Add @doc tags to 2 functions in src/domain/",
    "Consider null-safety improvements in achievement calculations",
    "Update docs/.meta/code-index.json after changes"
  ],
  "auto_fix_available": 3
}
```

## 高级功能

### 1. 智能修复建议

```python
# Minion 生成的修复补丁
def generate_fix_suggestions(issue):
    """
    根据问题类型生成修复建议
    """
    if issue['type'] == 'missing_doc_tag':
        return f"""
/**
 * {issue['function']}
 *
 * @doc docs/business/指标定义规范.md:XX
 * @formula [TODO: Add formula]
 *
 * @param [TODO: Add params]
 * @returns [TODO: Add returns]
 */
"""

    if issue['type'] == 'null_safety_violation':
        return """
# Replace:
if (target === 0) return 0;

# With:
if (target === 0) return null;
"""

    return ""
```

### 2. 历史对比

```typescript
// 对比当前审查与历史审查
const currentReview = await reviewer.reviewCodeChanges({ files });
const historicalReview = await reviewer.getHistoricalReview(commitHash);

const comparison = {
  improved: currentReview.score > historicalReview.score,
  new_issues: findNewIssues(currentReview, historicalReview),
  resolved_issues: findResolvedIssues(currentReview, historicalReview)
};
```

### 3. 团队统计

```typescript
// 生成团队代码质量统计
const teamStats = await reviewer.generateTeamStats({
  timeRange: 'last-30-days',
  groupBy: 'developer'
});

console.log(`
Top Contributors:
- Developer A: 45 commits, avg score 0.92
- Developer B: 32 commits, avg score 0.88
- Developer C: 28 commits, avg score 0.95

Common Issues:
1. Missing @doc tags: 15 occurrences
2. Null-safety violations: 8 occurrences
3. Type safety issues: 3 occurrences
`);
```

## 配置

```typescript
// minion-reviewer.config.ts
export const reviewerConfig = {
  // 审查级别
  levels: {
    quick: {
      checks: ['syntax', 'imports'],
      timeout: 5000
    },
    standard: {
      checks: ['syntax', 'imports', 'business_rules', 'doc_consistency'],
      timeout: 15000
    },
    thorough: {
      checks: ['all'],
      verifyWithTests: true,
      timeout: 60000
    }
  },

  // 阻止提交的阈值
  blockCommitThreshold: {
    score: 0.7,
    blockingIssues: 0
  },

  // 自动修复
  autoFix: {
    enabled: false,
    safeFixesOnly: true
  },

  // 业务规则路径
  businessDocsPath: 'docs/business',

  // 索引文件
  codeIndexPath: 'docs/.meta/code-index.json',
  docsIndexPath: 'docs/.meta/docs-index.json'
};
```

## 测试

```typescript
// tests/minion-reviewer.test.ts
import { MinionReviewerServer } from '@/mcp/minion-reviewer-server';

describe('Minion Code Reviewer', () => {
  let reviewer: MinionReviewerServer;

  beforeEach(() => {
    reviewer = new MinionReviewerServer();
  });

  it('should detect missing @doc tags', async () => {
    const result = await reviewer.reviewCodeChanges({
      files: ['test-fixtures/missing-doc-tag.ts']
    });

    expect(result.issues).toContainEqual(
      expect.objectContaining({
        type: 'missing_doc_tag',
        severity: 'error'
      })
    );
  });

  it('should verify null-safety compliance', async () => {
    const result = await reviewer.reviewCodeChanges({
      files: ['test-fixtures/null-safety-violation.ts']
    });

    expect(result.issues).toContainEqual(
      expect.objectContaining({
        type: 'null_safety_violation'
      })
    );
  });

  it('should use verification loop', async () => {
    const result = await reviewer.reviewCodeChanges({
      files: ['test-fixtures/complex-code.ts'],
      reviewLevel: 'thorough'
    });

    // 验证循环应该提高准确性
    expect(result.score).toBeGreaterThan(0.9);
    expect(result.verificationIterations).toBeGreaterThan(1);
  });
});
```

## 性能优化

1. **增量审查**: 只审查变更的代码
2. **并行处理**: 多个文件并行审查
3. **缓存机制**: 相同代码不重复审查
4. **智能批处理**: 按模块批量审查

```typescript
// 增量审查示例
async function incrementalReview(changes: GitDiff[]) {
  const affectedModules = identifyAffectedModules(changes);

  // 只审查受影响的模块
  const filesToReview = affectedModules.flatMap(m =>
    getFilesInModule(m)
  );

  return parallelReview(filesToReview);
}
```

## 监控和指标

```typescript
// 记录审查指标
function logReviewMetrics(result: ReviewResult) {
  metrics.histogram('review.score').record(result.overallScore);
  metrics.counter('review.issues.total').increment(result.total_issues);
  metrics.counter('review.issues.blocking').increment(result.blocking_issues);
  metrics.timer('review.duration').record(result.duration);

  // 按文件类型分组
  result.files.forEach(file => {
    metrics.counter('review.issues.by_file_type', {
      type: getFileType(file.path)
    }).increment(file.issues.length);
  });
}
```

## 相关文档

- `docs/.meta/ai-context.md` - AI 工具使用指南
- `docs/development/开发指南.md` - 开发规范
- `docs/business/指标定义规范.md` - 业务规则权威文档

## 相关文件

- `src/mcp/minion-reviewer-server.ts` - MCP 服务器
- `scripts/minion-review.ts` - CLI 工具
- `.git/hooks/pre-commit` - Git hook
- `minion-reviewer.config.ts` - 配置文件
