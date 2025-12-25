# 项目规则

## 🔍 组件复用优先原则 (CRITICAL)

> **核心原则**: 开发新功能前，必须先检查是否有可复用的组件、数据、指标、字段、UI、UX设计等。如果没有则新建，并立即更新到文档中，便于后续复用。

### 📋 必须检查的复用资源

AI在任何开发任务开始前，必须按以下优先级检查：

```typescript
const REUSE_CHECKLIST = {
  // 1. UI 组件 (最高优先级)
  uiComponents: [
    'src/components/ui/index.ts',           // UI组件索引
    'src/components/charts/UniversalChart', // 通用图表组件
    'docs/design/组件设计规范.md',           // 组件设计规范
  ],

  // 2. 数据结构和类型
  dataStructures: [
    'src/schemas/types.ts',                 // 类型定义
    'src/schemas/schema.ts',                // Zod schemas
    'docs/business/指标定义规范.md',         // 业务指标定义
  ],

  // 3. 业务逻辑和工具函数
  businessLogic: [
    'src/domain/*.ts',                       // 领域逻辑
    'src/lib/*.ts',                         // 工具函数
    'docs/.meta/code-index.json',           // 代码索引
  ],

  // 4. 数据配置
  dataConfig: [
    'public/data/*.json',                   // 静态数据
    'src/config/*.ts',                      // 配置文件
  ],

  // 5. UI/UX 设计模式
  designPatterns: [
    'docs/design/全局设计规范.md',           // 设计规范
    'docs/design/设计实现指南.md',           // 实现指南
  ],
};
```

### ✅ 复用检查工作流

#### 阶段1: 需求分析时
```bash
# AI 接到任务后的第一步
1. 分析任务需求
2. 搜索现有组件库
3. 检查文档中的组件索引
4. 评估可复用性
```

#### 阶段2: 实施前
```bash
# 如果找到可复用组件
→ 使用现有组件
→ 更新使用文档
→ 记录使用场景

# 如果没有找到可复用组件
→ 创建新组件
→ 更新组件索引
→ 编写使用文档
→ 添加到设计规范
```

#### 阶段3: 完成后
```bash
# 必须执行的文档更新
1. 更新 docs/design/组件设计规范.md
2. 更新 src/components/ui/index.ts
3. 创建使用示例文档
4. 更新 docs/.meta/code-index.json (运行 pnpm docs:sync)
```

### 🚨 违规后果

**如果 AI 直接创建新组件而不检查复用：**
- ❌ 代码审查会被拒绝
- ❌ 必须重构为使用现有组件
- ❌ 记录到开发日志作为负面案例

### 💡 正确示例

```typescript
// ✅ 正确做法：先检查复用
// 1. AI 检查 src/components/ui/index.ts
// 2. 发现 SortButtonGroup 组件已存在
// 3. 直接复用，无需创建新组件
import { SortButtonGroup, SortPresets } from '@/components/ui/SortButtonGroup';

// ❌ 错误做法：直接创建新组件
// 浪费时间，增加维护成本，代码不一致
```

### 📊 复用率监控

```bash
# 项目应保持的复用率指标
- UI 组件复用率: > 80%
- 业务逻辑复用率: > 70%
- 类型定义复用率: > 90%
- 设计模式复用率: > 85%
```

---

## 代码变更与文档同步规则

### 🤖 AI主动协作原则
AI不得被动等待指令，必须主动识别并建议以下动作：

1. **业务逻辑变更时**
   - 自动识别影响范围
   - 生成文档更新建议
   - 提供变更模板

2. **架构变更时**
   - 更新系统架构文档
   - 检查设计规范一致性
   - 生成影响分析报告

3. **数据结构变更时**
   - 更新数据模型文档
   - 检查数据文件一致性
   - 更新变更日志

### 📋 必须检查的映射关系

```typescript
const MUST_CHECK_MAPPINGS = {
  // 业务逻辑 → 指标定义文档
  'src/domain/*.ts': 'docs/business/指标定义规范.md',
  
  // 前端页面 → 系统架构文档  
  'src/app/page.tsx': 'docs/architecture/系统架构设计.md',
  
  // 数据配置 → 变更日志
  'public/data/*.json': 'CHANGELOG_HQ_TARGET.md',
  
  // 新增组件 → 设计规范
  'src/components/**/*.tsx': 'docs/design/组件设计规范.md'
};
```

### 🔄 自动化工作流（带防循环）

#### 每次代码变更后，AI必须执行防循环检查：

1. **防循环检查** ← 🔥 必须先执行
   ```javascript
   // 防循环检测
   const loopDetector = new LoopDetector();
   if (!loopDetector.shouldRunAICheck(filePath, context)) {
     return; // 跳过本次检查
   }
   ```

2. **影响分析**
   ```javascript
   // AI自动运行
   const analysis = analyzeCodeChanges(modifiedFiles);
   ```

3. **文档检查**
   ```javascript
   // AI自动检查
   const docUpdates = checkRequiredDocs(analysis);
   ```

4. **生成建议**
   ```javascript
   // AI自动生成
   const suggestions = generateUpdateTemplate(docUpdates);
   ```

5. **请求确认**
   ```javascript
   // AI主动询问
   "检测到业务逻辑变更，建议更新以下文档：[...]
    是否同意自动更新？"
   ```

### ✅ 验证标准

AI必须确保：
- [ ] 代码变更都有对应的文档说明
- [ ] 业务逻辑变更都更新了指标定义
- [ ] 架构变更都反映在系统设计文档中
- [ ] 数据变更都有变更日志记录

### 🚨 异常处理

如果AI发现：
- 代码变更但文档未更新 → 必须提醒
- 文档与代码不一致 → 必须报告
- 缺少必要文档 → 必须建议创建

### 🎯 质量门禁

AI在任何代码提交前必须检查：
```bash
npm run check:docs-sync  # 必须通过
npm run typecheck        # 必须通过  
npm run test            # 必须通过
```

## 特殊规则

### 时间进度口径相关变更
- 任何修改 `src/domain/time.ts` 或 `src/domain/allocation.ts`
- 必须立即检查 `docs/business/指标定义规范.md` 中的"时间进度口径"章节
- 必须更新相关的业务逻辑说明

### 总公司目标相关变更  
- 任何修改 `src/domain/headquarters.ts` 或相关数据文件
- 必须检查 `CHANGELOG_HQ_TARGET.md`
- 必须更新功能说明和使用指南

---

**核心原则：AI不是被动工具，而是主动的质量守护者！**