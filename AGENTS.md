# AGENTS.md

> 通用 AI Agents 指令文件 - 知识图谱驱动的协作开发

## 🤖 支持的 AI Agents

本文件为以下AI工具提供统一的知识图谱访问接口：
- GitHub Copilot
- Cursor
- Tabnine
- Codeium
- Amazon CodeWhisperer
- 其他基于LSP的AI助手

## 🎯 核心原则

### 原则1: 索引优先
```
传统方式：
AI → 扫描代码 → 猜测意图 → 生成代码

索引方式：
AI → 读取索引 → 理解上下文 → 精准生成
```

### 原则2: 双向追溯
```
代码 ←→ 索引 ←→ 文档

任何修改都必须保持三者同步
```

### 原则3: 自动验证
```
生成代码 → 自动检查 → 索引验证 → 提交
```

## 🗺️ 知识图谱系统

### 索引文件结构
```json
// docs/.meta/docs-index.json
{
  "documents": {
    "docs/business/指标定义规范.md": {
      "id": "doc-metrics-definition",
      "title": "指标字典与计算口径",
      "implementedIn": ["src/domain/time.ts", ...],
      "sections": { ... }
    }
  }
}

// docs/.meta/code-index.json
{
  "modules": {
    "src/domain/time.ts": {
      "id": "module-time",
      "type": "domain-logic",
      "exports": ["linearProgressYear", ...],
      "documentedIn": ["docs/business/指标定义规范.md:26-64"],
      "usedBy": ["src/app/page.tsx:7-15"]
    }
  }
}

// docs/.meta/graph.json
{
  "nodes": [
    {"id": "doc-metrics", "type": "doc", ...},
    {"id": "code-time", "type": "code", ...}
  ],
  "edges": [
    {"from": "doc-metrics", "to": "code-time", "type": "defines"}
  ]
}
```

## 🔍 Agent 工作流

### 阶段1: 上下文理解
```typescript
function understandContext(task: Task): Context {
  // 1. 读取相关索引
  const codeIndex = readJson('docs/.meta/code-index.json');
  const docsIndex = readJson('docs/.meta/docs-index.json');

  // 2. 定位相关文件
  const relevantFiles = findRelevantFiles(task, codeIndex, docsIndex);

  // 3. 理解业务上下文
  const businessContext = extractBusinessContext(relevantFiles);

  return {
    files: relevantFiles,
    business: businessContext,
    dependencies: analyzeDependencies(relevantFiles)
  };
}
```

### 阶段2: 代码生成
```typescript
function generateCode(context: Context): Code {
  // 1. 参考现有模式
  const patterns = extractPatterns(context.files);

  // 2. 遵循业务定义
  const businessRules = context.business;

  // 3. 生成符合规范的代码
  return {
    code: generateWithPatterns(patterns, businessRules),
    docs: generateJSDoc(businessRules),
    tests: generateTests(businessRules)
  };
}
```

### 阶段3: 自动验证
```typescript
function validate(code: Code): ValidationResult {
  // 1. TypeScript 类型检查
  const typeCheck = runTypeCheck();

  // 2. 文档一致性检查
  const docsCheck = runDocsCheck();

  // 3. 索引完整性检查
  const indexCheck = verifyIndex();

  return {
    typeCheck,
    docsCheck,
    indexCheck,
    passed: allPassed(typeCheck, docsCheck, indexCheck)
  };
}
```

## 📖 使用场景

### 场景1: 自动补全（Copilot/Cursor）
```typescript
// 用户输入函数签名
export function calculate

// Agent 思考过程：
// 1. 识别到 domain 层
// 2. 查询 code-index.json 找相似函数
// 3. 读取业务文档理解需求
// 4. 生成符合规范的代码

// Agent 补全：
/**
 * 计算时间进度
 * @doc docs/business/指标定义规范.md:XX
 * @param month 当前月份（1-12）
 * @returns 进度值（0-1）
 */
export function calculateTimeProgress(month: number): number {
  // 基于索引理解，生成正确的逻辑
  return month / 12;
}
```

### 场景2: 重构建议（任何Agent）
```typescript
// 用户选中一段代码
function oldCalculate(a, b) {
  return a / b;
}

// Agent 分析：
// 1. 查询 code-index 找到该函数的文档
// 2. 读取业务定义
// 3. 发现缺少错误处理
// 4. 提供重构建议

// Agent 建议：
/**
 * 根据 docs/business/指标定义规范.md:XX
 * 该函数需要处理除零情况
 *
 * @doc docs/business/指标定义规范.md:XX
 */
function calculate(a: number, b: number): number | null {
  if (b === 0) return null;  // 根据业务规范
  return a / b;
}
```

### 场景3: 文档生成（任何Agent）
```typescript
// 用户写了函数但没有文档
export function actual2025ProgressYear(actuals: number[], month: number) {
  const yearTotal = actuals.reduce((sum, v) => sum + (v ?? 0), 0);
  if (yearTotal === 0) return 0;
  const elapsed = actuals.slice(0, month).reduce((sum, v) => sum + (v ?? 0), 0);
  return elapsed / yearTotal;
}

// Agent 分析：
// 1. 查询 docs-index 找相关业务文档
// 2. 理解函数逻辑
// 3. 匹配业务定义
// 4. 生成完整文档

// Agent 补充：
/**
 * 年度2025实际进度
 *
 * 基于2025年实际数据计算当前月份的时间进度。
 * 这是三种时间进度口径之一，最贴近真实业务节奏。
 *
 * @doc docs/business/指标定义规范.md:31
 * @formula sum(actuals2025[0..month-1]) / sum(actuals2025[0..11])
 * @param actuals 2025年12个月实际数据数组（可能包含null）
 * @param month 当前月份（1-12）
 * @returns 进度值（0-1），如果数据不足返回0
 *
 * @example
 * const actuals = [100, 110, 120, ...];  // 12个月数据
 * const progress = actual2025ProgressYear(actuals, 6);
 * // 返回: 前6个月累计 / 全年累计
 */
```

### 场景4: 测试生成
```typescript
// Agent 读取索引后，理解：
// 1. 函数的业务定义
// 2. 边界条件
// 3. null 处理策略

// Agent 生成测试：
describe('actual2025ProgressYear', () => {
  it('应正确计算前6个月的进度', () => {
    const actuals = [
      100, 100, 100, 100, 100, 100,  // 前6个月
      200, 200, 200, 200, 200, 200   // 后6个月
    ];
    const progress = actual2025ProgressYear(actuals, 6);
    // 前6个月累计 600，全年累计 1800
    expect(progress).toBe(600 / 1800);  // 0.333...
  });

  it('当全年数据为0时应返回0', () => {
    const actuals = Array(12).fill(0);
    const progress = actual2025ProgressYear(actuals, 6);
    expect(progress).toBe(0);
  });

  it('应正确处理包含null的数据', () => {
    const actuals = [100, null, 100, ...];
    // Agent 根据业务规范知道 null 应该被视为 0
    const progress = actual2025ProgressYear(actuals, 3);
    expect(progress).toBeGreaterThan(0);
  });
});
```

## 🛠️ Agent 集成指南

### 集成步骤

#### Step 1: 配置环境
```bash
# 1. 确保索引文件存在
pnpm docs:sync

# 2. 配置 AI Agent 访问路径
# 在 .vscode/settings.json 或相应配置文件中
{
  "ai.indexPath": "docs/.meta",
  "ai.contextFiles": [
    "docs/.meta/code-index.json",
    "docs/.meta/docs-index.json",
    "docs/.meta/ai-context.md"
  ]
}
```

#### Step 2: 提供上下文
```typescript
// 在 AI Agent 的提示词中包含：
const contextPrompt = `
你正在协助开发一个项目，该项目使用知识图谱索引系统。

重要文件：
- docs/.meta/code-index.json  # 代码索引
- docs/.meta/docs-index.json  # 文档索引
- docs/.meta/graph.json       # 知识图谱

工作流程：
1. 先读取相关索引文件
2. 理解业务上下文
3. 生成符合规范的代码
4. 自动添加 @doc 标记

质量要求：
- domain 层必须有完整文档
- 必须包含 @doc 标记
- 必须包含 @formula（如有公式）
- 必须处理边界条件
`;
```

#### Step 3: 验证机制
```bash
# Agent 生成代码后，自动运行
pnpm typecheck  && \
pnpm docs:check && \
echo "✅ 代码生成成功，文档一致性验证通过"
```

## 📊 Agent 质量检查

### 自动检查项
```yaml
TypeScript:
  - [ ] 类型定义正确
  - [ ] 无编译错误
  - [ ] 导入导出正确

文档:
  - [ ] JSDoc 注释完整
  - [ ] @doc 标记存在
  - [ ] @param/@returns 说明清楚
  - [ ] 业务文档已更新

索引:
  - [ ] code-index.json 已更新
  - [ ] docs-index.json 已更新
  - [ ] graph.json 关联正确

测试:
  - [ ] 边界条件覆盖
  - [ ] null/undefined 处理
  - [ ] 错误情况测试
```

### 人工审查项
```yaml
业务逻辑:
  - [ ] 实现符合业务定义
  - [ ] 公式与文档一致
  - [ ] 边界条件合理

代码质量:
  - [ ] 命名清晰
  - [ ] 结构合理
  - [ ] 性能可接受

可维护性:
  - [ ] 易于理解
  - [ ] 易于扩展
  - [ ] 易于测试
```

## 🎯 最佳实践

### 实践1: 上下文注入
```typescript
// ✅ 好的做法
// Agent 先读取索引，理解上下文
const context = await loadContext('time_progress');
const code = generateCode(context);

// ❌ 不好的做法
// Agent 直接生成，可能偏离业务定义
const code = generateCodeDirectly();
```

### 实践2: 模式学习
```typescript
// ✅ 好的做法
// Agent 学习项目中的模式
const patterns = extractPatterns(existingCode);
const newCode = applyPatterns(patterns, newRequirement);

// ❌ 不好的做法
// Agent 使用通用模板，不符合项目风格
const newCode = useGenericTemplate();
```

### 实践3: 增量验证
```typescript
// ✅ 好的做法
// 每生成一小段代码就验证
generateFunction()
  .then(validate)
  .then(generateTests)
  .then(validate)
  .then(updateDocs)
  .then(validate);

// ❌ 不好的做法
// 生成大量代码后再验证
generateAllCode()
  .then(validateAll);  // 错误太多，难以修复
```

## 📚 Agent 学习资源

### 必读文件
1. `docs/.meta/ai-context.md` - 完整的AI工具使用指南
2. `docs/.meta/index-schema.md` - 索引数据结构规范
3. `docs/architecture/文档代码索引系统设计.md` - 系统设计

### 示例代码
查看 `src/domain/` 目录下的代码，学习：
- 如何写JSDoc注释
- 如何添加 @doc 标记
- 如何处理边界条件
- 如何保持文档一致性

### 知识图谱
```bash
# 查看完整图谱
cat docs/.meta/graph.json | jq .

# 统计信息
pnpm docs:sync && \
jq '{docs: .nodes | map(select(.type=="doc")) | length, 
     code: .nodes | map(select(.type=="code")) | length}' \
   docs/.meta/graph.json
```

## 🚨 常见错误

### 错误1: 跳过索引查询
```typescript
// ❌ 错误
直接根据函数名猜测意图，生成代码

// ✅ 正确
1. 查询 code-index.json
2. 找到 documentedIn 字段
3. 阅读业务定义
4. 生成符合定义的代码
```

### 错误2: 忽略业务文档
```typescript
// ❌ 错误
只看代码，不看文档，按经验生成

// ✅ 正确
1. 先看文档理解业务规则
2. 再看代码理解实现方式
3. 生成既符合业务又符合风格的代码
```

### 错误3: 不验证一致性
```typescript
// ❌ 错误
生成代码后直接提交

// ✅ 正确
生成代码 → pnpm docs:check → 修复问题 → 再提交
```

## 💡 高级技巧

### 技巧1: 批量操作
```bash
# Agent 可以批量处理多个文件
for file in src/domain/*.ts; do
  checkDocumentation $file
  if [ $? -ne 0 ]; then
    generateDocumentation $file
  fi
done
```

### 技巧2: 智能建议
```typescript
// Agent 分析代码后，提供改进建议
analyzeCode('src/domain/time.ts')
  .then(suggestions => {
    console.log('建议：');
    suggestions.forEach(s => console.log(`- ${s}`));
  });

// 输出示例：
// 建议：
// - actual2025ProgressQuarter 缺少单元测试
// - 建议提取公共逻辑到 progressHelper
// - 性能：可以缓存 yearTotal 计算结果
```

### 技巧3: 自动修复
```bash
# Agent 发现问题后自动修复
pnpm docs:check || {
  echo "发现一致性问题，尝试自动修复..."
  pnpm docs:fix
}
```

---

## 🤝 贡献指南

### 为Agent开发新功能
1. 添加新的索引字段到 `docs/.meta/index-schema.md`
2. 更新 `scripts/sync-docs-code.ts` 扫描逻辑
3. 更新本文档说明新功能
4. 提供使用示例

### 改进Agent体验
1. 收集Agent使用反馈
2. 识别常见问题
3. 优化索引结构
4. 提升自动化程度

---

**让 AI Agents 成为你的得力助手，而不是增加混乱！** 🤖✨
