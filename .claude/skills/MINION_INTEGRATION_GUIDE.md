# Minion 与 TargetManage 集成指南

**创建日期**: 2025-12-27
**版本**: 1.0.0
**状态**: 方案设计完成

---

## 📋 执行总结

本文档提供了将 **Minion AI Agent 框架** 集成到 **TargetManage (川分目标管理系统)** 的完整方案，包括 5 个核心 Skills 的设计文档和实施指南。

### 核心价值

| 维度 | Minion 贡献 | 预期收益 |
|------|------------|---------|
| **代码质量** | 验证循环 + 智能审查 | 检测率提升 30%+ |
| **测试覆盖** | 自动生成 + 边界测试 | Domain 层 100% 覆盖 |
| **业务洞察** | 多策略推理 + 异常检测 | 智能分析决策支持 |
| **开发效率** | 自动化工作流 | 减少 50%+ 手动工作 |
| **知识管理** | 文档-代码一致性 | 索引完整性 > 95% |

---

## 🎯 创建的 Skills

### 1. **minion-data-validator** - 数据验证 Skill

**文件**: `.claude/skills/minion-data-validator.md`

**核心功能**:
- ✅ CSV 导入数据深度验证
- ✅ 异常值检测（Z-score, IQR, Isolation Forest）
- ✅ 数据质量报告生成
- ✅ 智能修复建议

**使用场景**:
```typescript
// 用户上传 CSV 时调用
const validation = await callMinionValidation({
  csvFile: uploadedFile,
  schemaName: 'MonthlyActualRecordSchema',
  checkMode: 'thorough'  // 使用验证循环
});
```

**与现有功能配合**:
- **import-csv**: 基础文件解析
- **Zod Schemas**: 数据结构验证
- **minion-data-validator**: 深度业务规则验证

---

### 2. **minion-code-reviewer** - 代码审查 Skill

**文件**: `.claude/skills/minion-code-reviewer.md`

**核心功能**:
- ✅ 业务规则符合性检查
- ✅ 文档-代码一致性验证
- ✅ Domain 层纯函数检查
- ✅ @doc 标签完整性验证
- ✅ Null 安全规则执行

**使用场景**:
```typescript
// Git pre-commit hook
const review = await minionReviewCodeChanges({
  files: getChangedFiles(),
  reviewLevel: 'standard'
});

if (review.blocking_issues > 0) {
  blockCommit(review.issues);
}
```

**与现有功能配合**:
- **docs:sync / docs:check**: 文档一致性验证
- **husky**: CI 检查集成
- **commit-fast**: 审查通过后自动提交

---

### 3. **minion-business-analyzer** - 业务分析 Skill

**文件**: `.claude/skills/minion-business-analyzer.md`

**核心功能**:
- ✅ 异常检测（多统计算法）
- ✅ 趋势分析和预测
- ✅ 多维度对比（机构、产品、时间）
- ✅ 智能洞察生成

**使用场景**:
```typescript
// 仪表盘分析按钮
const analysis = await minionAnalyzeData({
  dataSource: 'actuals_monthly',
  analysisType: 'anomalies',
  parameters: { threshold: 3, method: 'zscore' }
});

displayAnomalies(analysis.anomalies);
showRecommendations(analysis.recommendations);
```

**与现有功能配合**:
- **ECharts**: 可视化分析结果
- **Domain 层**: 计算逻辑复用
- **UI 组件**: 展示分析洞察

---

### 4. **minion-test-generator** - 测试生成 Skill

**文件**: `.claude/skills/minion-test-generator.md`

**核心功能**:
- ✅ 自动生成单元测试
- ✅ 基于业务文档生成测试用例
- ✅ 边界条件和异常测试
- ✅ 覆盖率优化

**使用场景**:
```typescript
// 开发新功能后生成测试
const tests = await minionGenerateTests({
  targetFunction: 'src/domain/achievement.ts:calculateAchievementRate',
  framework: 'vitest'
});

saveTestFile(tests.test_code);
runTests();
checkCoverage();
```

**与现有功能配合**:
- **write-tests**: 保存生成的测试
- **test-coverage**: 验证覆盖率
- **Vitest**: 执行测试

---

### 5. **minion-mcp-bridge** - MCP 桥接 Skill

**文件**: `.claude/skills/minion-mcp-bridge.md`

**核心功能**:
- ✅ Claude Code ↔ Minion 双向通信
- ✅ 暴露项目工具给 Minion
- ✅ 统一的工具调用接口
- ✅ 流式响应支持

**架构**:
```
Claude Code → MCP Protocol → Minion MCP Bridge → Minion Framework
                                                        ↓
                                            TargetManage 数据和工具
```

**与现有功能配合**:
- 所有其他 Skills 通过此桥接 Skill 调用 Minion
- 提供 5 个核心工具接口
- 支持自定义工具扩展

---

## 🚀 实施路线图

### 阶段 1: 基础设施搭建 (1-2 周)

**目标**: 建立 Minion 环境和 MCP 桥接

```bash
# 1. 安装 Minion
git clone https://github.com/femto/minion.git
cd minion
pip install -r requirements.txt
cp config/config.yaml.example config/config.yaml

# 2. 配置 Minion
# 编辑 config/config.yaml
# 设置 LLM API key 和 base URL

# 3. 启动 Minion 服务
python -m minion.cli --port 8000

# 4. 实现 MCP 桥接服务器
# 复制 .claude/skills/minion-mcp-bridge.md 中的代码
# 到 src/mcp/minion-bridge-server.ts

# 5. 配置 Claude Code
# 编辑 .claude/settings.local.json
# 添加 MCP 服务器配置
```

**验收标准**:
- ✅ Minion 服务成功启动
- ✅ MCP 桥接服务器可连接
- ✅ Claude Code 可以调用 Minion 工具
- ✅ 简单查询测试通过（如 "2+2=?"）

---

### 阶段 2: 数据验证 Skill (1 周)

**目标**: 实现智能数据导入验证

```bash
# 1. 实现 MCP 服务器端点
# src/mcp/minion-validator-server.ts

# 2. 创建 Python 验证脚本
# minion/scripts/data_validation.py

# 3. 集成到导入页面
# src/app/import/page.tsx

# 4. 测试验证功能
pnpm dev
# 上传测试 CSV 文件
# 验证异常检测功能
```

**验收标准**:
- ✅ 能检测负值异常
- ✅ 能检测超出范围值
- ✅ 生成验证报告
- ✅ 提供修复建议

---

### 阶段 3: 代码审查 Skill (1 周)

**目标**: 实现智能代码审查

```bash
# 1. 实现 MCP 服务器端点
# src/mcp/minion-reviewer-server.ts

# 2. 创建 Python 审查脚本
# minion/scripts/code_review.py

# 3. 设置 Git hooks
# .git/hooks/pre-commit

# 4. 测试审查功能
git add .
git commit -m "test: trigger code review"
# 验证审查流程
```

**验收标准**:
- ✅ 检测缺失 @doc 标签
- ✅ 验证文档-代码一致性
- ✅ 检查 null 安全规则
- ✅ 阻止不符合规范的提交

---

### 阶段 4: 业务分析 Skill (1 周)

**目标**: 实现智能业务分析

```bash
# 1. 实现 MCP 服务器端点
# src/mcp/minion-analyzer-server.ts

# 2. 创建 Python 分析脚本
# minion/scripts/business_analysis.py

# 3. 创建分析 UI 组件
# src/components/analytics/BusinessAnalysisPanel.tsx

# 4. 测试分析功能
pnpm dev
# 访问仪表盘
# 点击"智能分析"按钮
# 查看分析结果
```

**验收标准**:
- ✅ 检测达成率异常
- ✅ 生成趋势分析
- ✅ 提供优化建议
- ✅ 可视化分析结果

---

### 阶段 5: 测试生成 Skill (1 周)

**目标**: 实现自动测试生成

```bash
# 1. 实现 MCP 服务器端点
# src/mcp/minion-test-generator-server.ts

# 2. 创建 Python 测试生成脚本
# minion/scripts/test_generation.py

# 3. 创建测试生成 UI
# src/components/testing/TestGeneratorPanel.tsx

# 4. 测试生成功能
# 输入函数路径
# 生成测试代码
# 保存并运行测试
```

**验收标准**:
- ✅ 生成正常情况测试
- ✅ 生成边界条件测试
- ✅ 生成异常情况测试
- ✅ 测试覆盖率 > 90%

---

### 阶段 6: 集成和优化 (1 周)

**目标**: 完善集成和优化性能

```bash
# 1. 完善工作流编排
# 创建 workflow 配置文件

# 2. 性能优化
# 实现连接池
# 添加缓存机制
# 优化批量处理

# 3. 监控和日志
# 添加 Minion 调用监控
# 记录性能指标

# 4. 文档完善
# 更新 CLAUDE.md
# 添加使用示例
# 编写故障排除指南
```

**验收标准**:
- ✅ 所有 Skills 正常工作
- ✅ 响应时间 < 5 秒
- ✅ 错误率 < 1%
- ✅ 文档完整

---

## 📊 技术对比

### Minion vs 纯 Claude Code

| 特性 | 纯 Claude Code | Claude Code + Minion |
|------|----------------|---------------------|
| **代码执行** | ❌ 需要手动 | ✅ 自动 Python 环境 |
| **验证循环** | ❌ 单次推理 | ✅ 自动验证改进 |
| **多策略推理** | ❌ 固定策略 | ✅ CoT/Code/Plan |
| **工具调用** | ✅ 丰富 | ✅ 丰富 + 自定义 |
| **性能** | ⚡ 快 | 🐌 稍慢（但更准确） |
| **准确性** | 📊 良好 | 📈 优秀（GSM8K 96%） |

### Minion vs 传统测试工具

| 特性 | 传统测试工具 | Minion 生成 |
|------|------------|------------|
| **测试覆盖** | 手动编写 | 自动生成 |
| **边界测试** | 容易遗漏 | 自动识别 |
| **业务规则** | 需查阅文档 | 自动提取 |
| **维护成本** | 高 | 低 |
| **更新速度** | 慢 | 快 |

---

## 💡 最佳实践

### 1. Skill 使用优先级

```
高优先级（立即实施）:
├─ minion-mcp-bridge        # 基础设施
└─ minion-code-reviewer     # 质量保证

中优先级（2-4 周）:
├─ minion-data-validator    # 数据质量
└─ minion-test-generator    # 测试覆盖

低优先级（长期优化）:
└─ minion-business-analyzer # 智能分析
```

### 2. 集成策略

```yaml
渐进式集成:
  step_1:
    - 安装 Minion
    - 实现 MCP 桥接
    - 验证基础功能

  step_2:
    - 集成 1-2 个核心 Skills
    - 收集反馈
    - 优化配置

  step_3:
    - 全面集成所有 Skills
    - 建立工作流
    - 监控效果

  step_4:
    - 持续优化
    - 扩展能力
    - 分享经验
```

### 3. 配置建议

```typescript
// 生产环境推荐配置
export const minionConfig = {
  // LLM 配置
  model: {
    apiType: 'openai',
    baseUrl: process.env.OPENAI_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4.1',  // 或 'deepseek-chat'
    temperature: 0
  },

  // 验证配置
  verification: {
    enabled: true,
    maxIterations: 3,
    improvementThreshold: 0.9
  },

  // 性能配置
  performance: {
    timeout: 30000,
    maxConcurrent: 3,
    cacheEnabled: true,
    cacheTTL: 3600
  },

  // 监控配置
  monitoring: {
    logLevel: 'info',
    metricsEnabled: true,
    errorAlerting: true
  }
};
```

---

## 🔧 故障排除

### 常见问题

#### 1. Minion 连接失败

```bash
# 问题: Cannot connect to Minion server
# 解决方案:

# 1. 检查 Minion 是否运行
curl http://localhost:8000/health

# 2. 检查防火墙设置
sudo ufw allow 8000

# 3. 检查配置文件
cat config/config.yaml

# 4. 重启 Minion
python -m minion.cli --port 8000 --reload
```

#### 2. MCP 桥接超时

```bash
# 问题: MCP bridge timeout
# 解决方案:

# 1. 增加超时时间
export MINION_TIMEOUT=60000

# 2. 启用异步模式
export MINION_ASYNC=true

# 3. 检查网络连接
ping localhost -c 5
```

#### 3. 生成的测试失败

```bash
# 问题: Generated tests failing
# 解决方案:

# 1. 检查函数签名
grep -A 10 "function calculateAchievementRate" src/domain/achievement.ts

# 2. 手动验证逻辑
pnpm exec tsx -e "console.log(calculateAchievementRate(80000, 100000))"

# 3. 重新生成测试（使用 improve 模式）
curl -X POST http://localhost:8000/api/generate-test \
  -H "Content-Type: application/json" \
  -d '{"targetFunction": "...", "improve": true}'
```

---

## 📈 成功指标

### 量化指标

| 指标 | 基线 | 目标 | 测量方法 |
|------|-----|------|---------|
| **代码审查覆盖率** | 60% | 95% | minions review / total commits |
| **测试覆盖率** | 70% | 95%+ | vitest --coverage |
| **数据导入错误率** | 5% | <1% | 验证报告统计 |
| **文档一致性** | 80% | 98%+ | docs:check 通过率 |
| **开发效率** | 基线 | +50% | 功能完成时间对比 |
| **Bug 检测率** | 基线 | +30% | 生产环境 bug 数量 |

### 定性指标

- ✅ 团队满意度 > 4.5/5
- ✅ 易用性评分 > 4/5
- ✅ 文档完整性 > 95%
- ✅ 工具可靠性 > 99%

---

## 🎓 学习资源

### 官方文档

- **Minion GitHub**: https://github.com/femto/minion
- **Minion 文档**: https://deepwiki.com/femto/minion
- **MCP 协议**: https://modelcontextprotocol.io
- **Claude Code**: https://code.anthropic.com

### 项目文档

- **CLAUDE.md**: 项目 AI 辅助开发指南
- **docs/.meta/ai-context.md**: AI 工具使用指南
- **docs/business/**: 业务规则权威文档

### 社区资源

- **Minion Discord**: https://discord.gg/HUC6xEK9aT
- **Twitter**: @femtowin
- **微信群**: 查看 Minion README

---

## 🤝 贡献指南

### 提交新 Skill

```bash
# 1. 创建 Skill 文档
touch .claude/skills/your-new-skill.md

# 2. 遵循模板
# - 概述
# - 何时使用
# - 工作流程
# - 核心功能
# - MCP 集成
# - 前端集成
# - 配置
# - 使用示例
# - 相关文档

# 3. 更新索引
echo "- your-new-skill" >> .claude/skills/INDEX.md

# 4. 提交 PR
git add .claude/skills/your-new-skill.md
git commit -m "docs: add new skill for ..."
git push
```

### 报告问题

```bash
# 1. 检查现有 issues
gh issue list --state all

# 2. 创建新 issue
gh issue create \
  --title "Minion integration issue: ..." \
  --body "Description: ... Steps to reproduce: ..."
```

---

## 📝 变更日志

### v1.0.0 (2025-12-27)

**新增**:
- ✅ 5 个核心 Skills 设计文档
- ✅ MCP 桥接方案
- ✅ 实施路线图
- ✅ 集成指南
- ✅ 故障排除指南

**待办**:
- ⏳ 实现 Minion MCP 服务器
- ⏳ 集成到开发工作流
- ⏳ 性能优化
- ⏳ 生产环境部署

---

## 📞 支持

### 获取帮助

1. **查阅文档**: 先查看本文档和相关 Skills 文档
2. **检查 Issues**: 搜索是否有类似问题
3. **提 Issue**: 创建详细的 bug 报告或功能请求
4. **加入社区**: Minion Discord 或微信群

### 联系方式

- **项目维护**: Development Team
- **Minion 支持**: @femtowin
- **Claude Code 支持**: Anthropic Support

---

**文档维护**: Development Team
**最后更新**: 2025-12-27
**下次审查**: 2025-01-27

**相关文件**:
- `.claude/skills/minion-*.md` - 各个 Skills 的详细文档
- `CLAUDE.md` - 项目开发指南
- `docs/.meta/ai-context.md` - AI 工具集成指南
