# 项目规则

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