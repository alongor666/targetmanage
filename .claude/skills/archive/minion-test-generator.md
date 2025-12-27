# minion-test-generator

使用 Minion 框架自动生成测试的 Skill

## 概述

此 Skill 利用 Minion 的代码理解能力和验证循环，为 TargetManage 项目自动生成高质量的单元测试、集成测试和端到端测试，特别针对 domain 层纯函数和业务逻辑。

## 何时使用

当用户需要：
- 为新开发的函数生成测试
- 提高现有代码的测试覆盖率
- 基于业务文档生成测试用例
- 生成边界条件和异常情况测试

## 工作流程

```
用户提供代码文件或函数名
    ↓
Claude Code 调用此 Skill
    ↓
Minion 分析代码和相关业务文档
    ↓
生成测试用例（正常、边界、异常）
    ↓
验证循环改进测试质量
    ↓
生成测试代码和文档
    ↓
返回测试文件和覆盖率预测
```

## 核心功能

### 1. Domain 层函数测试生成

```python
# Minion 执行的测试生成脚本
import ast
import inspect
from typing import List, Dict, Any

def generate_domain_tests(function_path: str) -> Dict[str, Any]:
    """
    为 domain 层函数生成测试

    Args:
        function_path: 函数路径，如 "src/domain/achievement.ts:calculateAchievementRate"

    Returns:
        生成的测试代码和元数据
    """
    # 解析源代码
    file_path, function_name = function_path.split(':')
    with open(file_path) as f:
        source_code = f.read()
        tree = ast.parse(source_code)

    # 找到目标函数
    target_function = None
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name == function_name:
            target_function = node
            break

    if not target_function:
        raise ValueError(f"Function {function_name} not found")

    # 提取函数信息
    function_info = extract_function_info(target_function, source_code)

    # 读取业务文档（从 @doc 标签）
    business_doc = read_business_doc(function_info.get('doc_reference'))

    # 生成测试用例
    test_cases = generate_test_cases(function_info, business_doc)

    # 生成测试代码
    test_code = generate_test_code(function_name, test_cases, function_info)

    return {
        'function_name': function_name,
        'test_code': test_code,
        'test_cases': test_cases,
        'metadata': {
            'total_tests': len(test_cases),
            'coverage_estimate': estimate_coverage(test_cases, function_info),
            'business_doc_reference': function_info.get('doc_reference')
        }
    }

def extract_function_info(function_node: ast.FunctionDef, source_code: str) -> Dict[str, Any]:
    """提取函数信息"""
    docstring = ast.get_docstring(function_node)

    # 解析 @doc 标签
    doc_reference = None
    if docstring and '@doc' in docstring:
        doc_match = re.search(r'@doc\s+(.+)', docstring)
        if doc_match:
            doc_reference = doc_match.group(1).strip()

    # 解析参数
    parameters = []
    for arg in function_node.args.args:
        param_info = {
            'name': arg.arg,
            'type': extract_type_annotation(arg.annotation)
        }
        parameters.append(param_info)

    # 解析返回类型
    return_type = extract_type_annotation(function_node.returns)

    # 提取业务规则（从 @formula 标签）
    formula = None
    if docstring and '@formula' in docstring:
        formula_match = re.search(r'@formula\s+(.+)', docstring)
        if formula_match:
            formula = formula_match.group(1).strip()

    return {
        'name': function_node.name,
        'parameters': parameters,
        'return_type': return_type,
        'doc_reference': doc_reference,
        'formula': formula,
        'docstring': docstring
    }

def generate_test_cases(function_info: Dict, business_doc: Dict) -> List[Dict[str, Any]]:
    """生成测试用例"""
    test_cases = []

    # 1. 正常情况测试
    normal_cases = generate_normal_cases(function_info)
    test_cases.extend(normal_cases)

    # 2. 边界条件测试
    boundary_cases = generate_boundary_cases(function_info)
    test_cases.extend(boundary_cases)

    # 3. 异常情况测试
    error_cases = generate_error_cases(function_info)
    test_cases.extend(error_cases)

    # 4. 基于业务文档的测试
    if business_doc:
        business_cases = generate_business_cases(function_info, business_doc)
        test_cases.extend(business_cases)

    return test_cases

def generate_normal_cases(function_info: Dict) -> List[Dict]:
    """生成正常情况测试用例"""
    cases = []

    # 示例：对于 calculateAchievementRate
    if function_info['name'] === 'calculateAchievementRate':
        cases.extend([
            {
                'description': '正常达成率计算',
                'input': { 'actual': 80000, 'target': 100000 },
                'expected': 0.8,
                'type': 'normal'
            },
            {
                'description': '超额完成',
                'input': { 'actual': 120000, 'target': 100000 },
                'expected': 1.2,
                'type': 'normal'
            },
            {
                'description': '刚好完成',
                'input': { 'actual': 100000, 'target': 100000 },
                'expected': 1.0,
                'type': 'normal'
            }
        ])

    return cases

def generate_boundary_cases(function_info: Dict) -> List[Dict]:
    """生成边界条件测试用例"""
    cases = []

    # 示例：对于 calculateAchievementRate
    if function_info['name'] === 'calculateAchievementRate':
        cases.extend([
            {
                'description': '最小非零值',
                'input': { 'actual': 0.01, 'target': 100000 },
                'expected': 0.0000001,
                'type': 'boundary'
            },
            {
                'description': '零目标（应返回 null）',
                'input': { 'actual': 80000, 'target': 0 },
                'expected': None,
                'type': 'boundary'
            },
            {
                'description': '零实际',
                'input': { 'actual': 0, 'target': 100000 },
                'expected': 0,
                'type': 'boundary'
            }
        ])

    return cases

def generate_error_cases(function_info: Dict) -> List[Dict]:
    """生成异常情况测试用例"""
    cases = []

    # 示例：对于 calculateAchievementRate
    if function_info['name'] === 'calculateAchievementRate':
        cases.extend([
            {
                'description': '负数实际值',
                'input': { 'actual': -1000, 'target': 100000 },
                'expected': None,  # 根据业务规则
                'type': 'error'
            },
            {
                'description': '负数目标',
                'input': { 'actual': 80000, 'target': -100000 },
                'expected': None,
                'type': 'error'
            }
        ])

    return cases

def generate_business_cases(function_info: Dict, business_doc: Dict) -> List[Dict]:
    """基于业务文档生成测试用例"""
    cases = []

    # 从业务文档提取规则和示例
    rules = business_doc.get('rules', [])
    examples = business_doc.get('examples', [])

    # 为每个规则生成测试
    for rule in rules:
        cases.append({
            'description': f"业务规则: {rule['description']}",
            'input': rule['input'],
            'expected': rule['expected'],
            'type': 'business_rule',
            'rule_reference': rule.get('reference')
        })

    # 为每个示例生成测试
    for example in examples:
        cases.append({
            'description': f"文档示例: {example['description']}",
            'input': example['input'],
            'expected': example['expected'],
            'type': 'documentation_example',
            'example_reference': example.get('reference')
        })

    return cases

def generate_test_code(function_name: str, test_cases: List[Dict], function_info: Dict) -> str:
    """生成测试代码"""
    test_code = f"""
import {{ {function_name} }} from '@/domain/{get_domain_file(function_name)}';

describe('{function_name}', () => {{
"""

    for i, test_case in enumerate(test_cases):
        test_code += f"""
  it('{test_case['description']}', () => {{
"""

        # 准备输入参数
        input_params = ', '.join([
            f"{param['name']}: {format_value(test_case['input'][param['name']])}"
            for param in function_info['parameters']
        ])

        # 添加测试代码
        if test_case['expected'] is None:
            test_code += f"    const result = {function_name}({input_params});\n"
            test_code += f"    expect(result).toBeNull();\n"
        else:
            test_code += f"    const result = {function_name}({input_params});\n"
            test_code += f"    expect(result).{get_matcher(test_case['expected'])}({format_value(test_case['expected'])});\n"

        test_code += "  });\n"

    test_code += "});\n"

    return test_code

def estimate_coverage(test_cases: List[Dict], function_info: Dict) -> Dict[str, float]:
    """估算测试覆盖率"""
    total_branches = estimate_branches(function_info)
    covered_branches = len(test_cases)

    return {
        'branch_coverage': min(covered_branches / total_branches, 1.0),
        'estimated_lines_covered': covered_branches * 5,  # 估算每个测试覆盖约5行
        'total_lines': estimate_lines_of_code(function_info)
    }

def read_business_doc(doc_reference: str) -> Dict:
    """读取业务文档"""
    if not doc_reference:
        return {}

    # 解析文档引用，如 "docs/business/指标定义规范.md:69"
    doc_path, line_number = doc_reference.split(':') if ':' in doc_reference else (doc_reference, None)

    try:
        with open(doc_path) as f:
            content = f.read()

        # 提取相关章节
        # ... 实现文档解析逻辑

        return {
            'path': doc_path,
            'content': content,
            'rules': extract_rules(content),
            'examples': extract_examples(content)
        }
    except FileNotFoundError:
        return {}
```

### 2. 集成测试生成

```python
def generate_integration_tests(feature: str) -> Dict[str, Any]:
    """
    生成集成测试

    Args:
        feature: 功能名称，如 "achievement_tracking"

    Returns:
        集成测试代码
    """
    # 分析相关的 domain 层函数
    domain_functions = find_related_domain_functions(feature)

    # 分析数据流
    data_flow = analyze_data_flow(feature)

    # 生成测试场景
    scenarios = generate_integration_scenarios(domain_functions, data_flow)

    # 生成测试代码
    test_code = generate_integration_test_code(feature, scenarios)

    return {
        'feature': feature,
        'test_code': test_code,
        'scenarios': scenarios,
        'metadata': {
            'total_scenarios': len(scenarios),
            'domain_functions_tested': len(domain_functions)
        }
    }

def generate_integration_scenarios(domain_functions: List[str], data_flow: Dict) -> List[Dict]:
    """生成集成测试场景"""
    scenarios = []

    # 场景 1: 完整的数据流
    scenarios.append({
        'name': '完整数据流：从目标到达成率',
        'description': '测试从年度目标分配到月度达成率计算的完整流程',
        'steps': [
            '加载年度目标',
            '执行月度分配',
            '加载月度实际数据',
            '计算达成率',
            '计算增长率'
        ],
        'expected_outcome': '所有计算步骤成功，结果一致'
    })

    # 场景 2: 边界条件
    scenarios.append({
        'name': '边界条件：零目标处理',
        'description': '测试当目标为零时，整个系统的处理',
        'steps': [
            '设置目标为零',
            '计算达成率',
            '验证返回 null',
            '验证 UI 正确显示'
        ],
        'expected_outcome': '所有函数正确返回 null，UI 显示 "—"'
    })

    return scenarios
```

### 3. E2E 测试生成

```python
def generate_e2e_tests(user_story: str) -> Dict[str, Any]:
    """
    生成端到端测试

    Args:
        user_story: 用户故事，如 "作为管理员，我要导入 CSV 数据以更新实际数据"

    Returns:
        E2E 测试代码
    """
    # 解析用户故事
    story_steps = parse_user_story(user_story)

    # 生成 Playwright 测试
    test_code = generate_playwright_test(user_story, story_steps)

    return {
        'user_story': user_story,
        'test_code': test_code,
        'steps': story_steps,
        'metadata': {
            'test_framework': 'playwright',
            'estimated_duration': estimate_test_duration(story_steps)
        }
    }

def generate_playwright_test(user_story: str, steps: List[Dict]) -> str:
    """生成 Playwright 测试代码"""
    test_code = f"""
import {{ test, expect }} from '@playwright/test';

test.describe('{user_story}', () => {{
"""

    for i, step in enumerate(steps):
        test_code += f"""
  test('{step['description']}', async ({{ page }}) => {{
"""

        if step['action'] === 'navigate':
            test_code += f"    await page.goto('{step['url']}');\n"

        elif step['action'] === 'upload':
            test_code += f"    await page.setInputFiles('{step['selector']}', '{step['file']}');\n"

        elif step['action'] === 'click':
            test_code += f"    await page.click('{step['selector']}');\n"

        elif step['action'] === 'assert':
            test_code += f"    await expect(page.locator('{step['selector']}')).{step['condition']}('{step['value']}');\n"

        test_code += "  });\n"

    test_code += "});\n"

    return test_code
```

## MCP 集成

```typescript
// src/mcp/minion-test-generator-server.ts
export class MinionTestGeneratorServer {
  private server: MCPServer;

  constructor() {
    this.server = new MCPServer({
      name: 'minion-test-generator',
      version: '1.0.0'
    });

    this.registerTools();
  }

  private registerTools() {
    this.server.registerTool({
      name: 'generate_unit_tests',
      description: 'Generate unit tests using Minion',
      inputSchema: {
        type: 'object',
        properties: {
          targetFunction: {
            type: 'string',
            description: 'Function path (e.g., src/domain/achievement.ts:calculateAchievementRate)'
          },
          framework: {
            type: 'string',
            enum: ['vitest', 'jest'],
            description: 'Testing framework'
          }
        },
        required: ['targetFunction']
      }
    });

    this.server.registerTool({
      name: 'generate_integration_tests',
      description: 'Generate integration tests',
      inputSchema: {
        type: 'object',
        properties: {
          feature: {
            type: 'string',
            description: 'Feature name'
          }
        },
        required: ['feature']
      }
    });

    this.server.registerTool({
      name: 'generate_e2e_tests',
      description: 'Generate end-to-end tests',
      inputSchema: {
        type: 'object',
        properties: {
          userStory: {
            type: 'string',
            description: 'User story description'
          }
        },
        required: ['userStory']
      }
    });
  }

  async generateUnitTests(args: any) {
    const result = await this.callMinion({
      route: 'code',
      task: `Generate comprehensive unit tests for function: ${args.targetFunction}`,
      code: this.generateTestScript(args.targetFunction, 'unit'),
      input: {
        function_path: args.targetFunction,
        framework: args.framework || 'vitest'
      },
      check: true,  # 验证生成的测试
      improve: true  # 改进测试质量
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  private async callMinion(params: any) {
    const response = await fetch(`${process.env.MINION_URL}/api/generate-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    return response.json();
  }

  private generateTestScript(target: string, type: 'unit' | 'integration' | 'e2e'): string {
    return `
import sys
sys.path.append('/path/to/minion/test_generators')

from ${type}_test_generator import generate_${type}_tests

result = generate_${type}_tests('${target}')
print(json.dumps(result, indent=2))
`;
  }
}
```

## 前端集成

```typescript
// src/components/testing/TestGeneratorPanel.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

export function TestGeneratorPanel() {
  const [targetFunction, setTargetFunction] = useState('');
  const [generatedTests, setGeneratedTests] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async (params: { target: string; framework: string }) => {
      const response = await fetch('/api/minion/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetFunction: params.target,
          framework: params.framework
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedTests(data);
    }
  });

  const handleGenerate = () => {
    if (!targetFunction) {
      alert('请输入目标函数路径');
      return;
    }

    generateMutation.mutate({
      target: targetFunction,
      framework: 'vitest'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>测试生成器</h2>

        <input
          type="text"
          value={targetFunction}
          onChange={(e) => setTargetFunction(e.target.value)}
          placeholder="src/domain/achievement.ts:calculateAchievementRate"
          className="w-full p-2 border rounded"
        />

        <button
          onClick={handleGenerate}
          disabled={generateMutation.isLoading}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          {generateMutation.isLoading ? '生成中...' : '生成测试'}
        </button>
      </div>

      {generatedTests && (
        <TestResult result={generatedTests} />
      )}
    </div>
  );
}

function TestResult({ result }: { result: any }) {
  return (
    <div className="space-y-4">
      {/* 元数据 */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label>生成测试数</label>
          <p className="text-2xl">{result.metadata.total_tests}</p>
        </div>

        <div>
          <label>预计覆盖率</label>
          <p className="text-2xl">
            {(result.metadata.coverage_estimate.branch_coverage * 100).toFixed(1)}%
          </p>
        </div>

        <div>
          <label>业务文档引用</label>
          <p className="text-sm">
            {result.metadata.business_doc_reference || '无'}
          </p>
        </div>
      </div>

      {/* 测试用例 */}
      <div>
        <h3>生成的测试用例</h3>

        <div className="space-y-2">
          {result.test_cases.map((testCase: any, i: number) => (
            <div key={i} className="p-3 border rounded">
              <div className="flex justify-between">
                <span className={`badge badge-${testCase.type}`}>
                  {testCase.type}
                </span>
                <span>{testCase.description}</span>
              </div>

              <div className="mt-2 text-sm">
                <div>输入: {JSON.stringify(testCase.input)}</div>
                <div>期望: {JSON.stringify(testCase.expected)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 生成的代码 */}
      <div>
        <h3>生成的测试代码</h3>
        <pre className="p-4 bg-gray-100 rounded overflow-auto max-h-96">
          <code>{result.test_code}</code>
        </pre>

        <button
          onClick={() => copyToClipboard(result.test_code)}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
        >
          复制到剪贴板
        </button>

        <button
          onClick={() => saveTestFile(result.function_name, result.test_code)}
          className="mt-2 ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          保存到文件
        </button>
      </div>
    </div>
  );
}

async function saveTestFile(functionName: string, testCode: string) {
  const testFilePath = `src/domain/__tests__/${functionName}.test.ts`;

  const response = await fetch('/api/save-test-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: testFilePath,
      content: testCode
    })
  });

  if (response.ok) {
    alert(`测试已保存到 ${testFilePath}`);
  }
}
```

## 配置

```typescript
// minion-test-generator.config.ts
export const testGeneratorConfig = {
  // 默认测试框架
  defaultFramework: 'vitest',

  // 测试文件路径
  testPaths: {
    unit: 'src/domain/__tests__',
    integration: 'tests/integration',
    e2e: 'tests/e2e'
  },

  // 覆盖率目标
  coverageTargets: {
    statements: 100,
    branches: 100,
    functions: 100,
    lines: 100
  },

  // 生成选项
  generationOptions: {
    includeBoundaryCases: true,
    includeErrorCases: true,
    includeBusinessRules: true,
    includeDocumentationExamples: true
  },

  // Minion 配置
  minion: {
    url: process.env.MINION_URL || 'http://localhost:8000',
    timeout: 30000,
    retries: 3
  }
};
```

## 使用示例

```typescript
// 示例 1: 为 domain 函数生成测试
const result = await fetch('/api/minion/generate-test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    targetFunction: 'src/domain/achievement.ts:calculateAchievementRate',
    framework: 'vitest'
  })
}).then(r => r.json());

console.log('生成的测试:', result.test_code);
// 输出:
// import { calculateAchievementRate } from '@/domain/achievement';
//
// describe('calculateAchievementRate', () => {
//   it('正常达成率计算', () => {
//     const result = calculateAchievementRate({ actual: 80000, target: 100000 });
//     expect(result).toBeCloseTo(0.8);
//   });
//
//   it('零目标（应返回 null）', () => {
//     const result = calculateAchievementRate({ actual: 80000, target: 0 });
//     expect(result).toBeNull();
//   });
//
//   // ... 更多测试
// });

// 示例 2: 为集成功能生成测试
const integrationTests = await fetch('/api/minion/generate-integration-test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    feature: 'achievement_tracking'
  })
}).then(r => r.json());

console.log('集成测试:', integrationTests.test_code);
```

## 高级功能

### 1. 测试改进循环

```python
# Minion 的验证循环可以改进生成的测试
def verify_and_improve_tests(test_code: str, function_info: Dict) -> str:
    """
    验证并改进测试代码
    """
    # 第一轮：执行测试
    test_result = execute_test(test_code)

    if test_result.passed:
        return test_code

    # 分析失败原因
    failure_analysis = analyze_test_failures(test_result)

    # 改进测试
    improved_tests = fix_test_issues(test_code, failure_analysis)

    # 第二轮：验证改进后的测试
    improved_result = execute_test(improved_tests)

    return improved_tests if improved_result.passed else test_code
```

### 2. 覆盖率优化

```typescript
// 优化测试以达到目标覆盖率
async function optimizeCoverage(
  targetFunction: string,
  currentCoverage: number,
  targetCoverage: number
) {
  if (currentCoverage >= targetCoverage) {
    return;  // 已达到目标
  }

  // 分析未覆盖的分支
  const uncoveredBranches = await analyzeUncoveredBranches(targetFunction);

  // 为未覆盖的分支生成额外测试
  const additionalTests = await generateTestsForBranches(
    targetFunction,
    uncoveredBranches
  );

  return additionalTests;
}
```

### 3. 智能测试选择

```python
# 使用 Minion 的规划能力选择最优测试集
def select_optimal_test_suite(all_tests: List[Dict], time_budget: int) -> List[Dict]:
    """
    在时间预算内选择最优测试集
    """
    # 使用 Minion 的规划策略
    plan = minion.plan(
        task='Select tests that maximize coverage within time budget',
        tests=all_tests,
        time_budget=time_budget,
        check=True
    )

    return plan.selected_tests
```

## 与现有功能配合

```yaml
工作流:
  1. 用户开发新功能

  2. minion-test-generator:
     - 分析代码
     - 生成测试
     - 验证测试质量

  3. write-tests:
     - 写入测试文件

  4. test-coverage:
     - 运行测试
     - 检查覆盖率

  5. husky:
     - 如果覆盖率未达标，阻止提交
```

## 相关文档

- `docs/.meta/ai-context.md` - AI 工具使用指南
- `vitest config` - Vitest 配置文档

## 相关文件

- `src/mcp/minion-test-generator-server.ts` - MCP 服务器
- `src/components/testing/TestGeneratorPanel.tsx` - UI 组件
- `minion/test_generators/` - Minion 测试生成器
