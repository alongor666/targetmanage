# AI编程进化知识库

> **目标**：记录问题、分析本质、改进Prompt、形成体系，让你成为顶级的AI编程"总司令"

**版本**：1.0.0
**创建日期**：2025-12-25
**最后更新**：2025-12-25

---

## 📋 目录

- [快速开始](#-快速开始)
- [知识库结构](#-知识库结构)
- [使用方法](#-使用方法)
- [进化指标](#-进化指标)
- [最佳实践](#-最佳实践)

---

## 🚀 快速开始

### 5分钟上手

1. **遇到问题时**：
   ```bash
   /ai-evolve record
   ```
   → 记录问题、尝试的Prompt、AI的输出

2. **解决问题后**：
   ```bash
   /ai-evolve analyze
   ```
   → 分析根本原因、提炼Prompt模式

3. **开始新任务前**：
   ```bash
   /ai-evolve query "关键词"
   ```
   → 查询类似问题的最佳实践

4. **定期回顾**：
   ```bash
   /ai-evolve report
   ```
   → 查看进化轨迹、总结经验

### 详细指南

阅读 [QUICKSTART.md](./QUICKSTART.md) 获取详细的使用指南。

---

## 🗂️ 知识库结构

```
docs/ai-evolution/
├── README.md                    # 📖 本文件 - 知识库总索引
├── QUICKSTART.md                # 🚀 5分钟快速上手指南
│
├── problems/                    # 🐛 问题记录库
│   ├── index.md                # 问题索引（按分类、时间、标签）
│   ├── template.md             # 问题记录模板
│   ├── P001-类型错误/          # 类型推断、类型安全相关问题
│   ├── P002-业务逻辑/          # 业务规则理解、计算逻辑问题
│   ├── P003-组件设计/          # 组件架构、API设计问题
│   ├── P004-数据流/            # 数据加载、状态管理问题
│   └── P005-性能优化/          # 性能、优化相关问题
│
├── solutions/                   # ✅ 解决方案库
│   ├── index.md                # 解决方案索引
│   ├── prompt-patterns/        # Prompt模式库 ⭐
│   │   ├── index.md
│   │   ├── context-提供模式.md
│   │   ├── 任务分解模式.md
│   │   ├── 错误处理模式.md
│   │   └── 代码审查模式.md
│   ├── context-patterns/       # Context模式库 ⭐
│   │   ├── index.md
│   │   ├── 业务规则提供.md
│   │   ├── 代码结构说明.md
│   │   └── 依赖关系图.md
│   └── best-practices/         # 最佳实践库 ⭐
│       ├── index.md
│       ├── 与AI协作流程.md
│       ├── 问题诊断技巧.md
│       └── 进化式开发.md
│
├── analysis/                    # 🔍 本质分析库
│   ├── index.md                # 分析索引
│   ├── root-causes/            # 根因分析
│   │   ├── 为什么AI理解错误.md
│   │   ├── 为什么Context不足.md
│   │   └── 为什么Prompt模糊.md
│   └── patterns/               # 模式总结
│       ├── 常见错误模式.md
│       ├── 成功模式.md
│       └── 反模式.md
│
├── evolution/                   # 📈 进化轨迹
│   ├── prompt-evolution.md     # Prompt进化史
│   ├── context-evolution.md    # Context进化史
│   ├── skill-evolution.md      # 技能进化史
│   └── metrics.md              # 进化指标追踪
│
└── .meta/                       # 🤖 自动生成的索引（不要手动编辑）
    ├── problems-index.json     # 问题索引
    ├── solutions-index.json    # 解决方案索引
    ├── knowledge-graph.json    # 知识图谱
    └── evolution-metrics.json  # 进化指标
```

---

## 🔧 使用方法

### 方法1：使用Skill（推荐）

```bash
# 记录问题
/ai-evolve record

# 分析本质
/ai-evolve analyze

# 改进方案
/ai-evolve improve

# 查询知识库
/ai-evolve query "关键词"

# 生成进化报告
/ai-evolve report
```

### 方法2：手动操作

1. **记录问题**：
   - 复制 `problems/template.md` 到相应分类目录
   - 填写问题详情、尝试的Prompt、AI输出
   - 保存文件

2. **分析本质**：
   - 在 `analysis/root-causes/` 创建分析文档
   - 分析技术层面、Prompt层面、Context层面的问题
   - 提炼根本原因

3. **改进方案**：
   - 在 `solutions/prompt-patterns/` 创建Prompt模式
   - 在 `solutions/best-practices/` 记录最佳实践
   - 更新索引文件

4. **更新进化轨迹**：
   - 更新 `evolution/prompt-evolution.md`
   - 更新 `evolution/metrics.md`

---

## 📊 进化指标

### 当前统计（自动更新）

- **问题记录数**：0
- **解决方案数**：0
- **Prompt模式数**：4（初始模板）
- **Context模式数**：3（初始模板）
- **最佳实践数**：3（初始模板）

### 进化目标

#### 短期（1个月）
- ✅ 记录问题数量 ≥ 10个
- ✅ 提炼Prompt模式 ≥ 5个
- ✅ 建立Context模式 ≥ 3个
- ✅ Skill调用成功率 ≥ 90%

#### 中期（3个月）
- ✅ 问题解决速度提升 50%+
- ✅ Prompt一次成功率提升 30%+
- ✅ 形成10+个可复用模式
- ✅ 知识库查询命中率 ≥ 60%

#### 长期（6个月）
- ✅ 成为项目的"AI编程总司令"
- ✅ 建立完整的Prompt模式库（20+模式）
- ✅ 形成系统的AI协作方法论
- ✅ 能够指导其他开发者与AI协作

---

## 💡 最佳实践

### 1. 问题记录原则

**及时记录**：
- 遇到问题时立即记录，不要等到解决后再记录（容易遗漏细节）
- 记录失败的Prompt和AI的错误输出（这些是宝贵的学习材料）

**详细描述**：
- 问题的上下文（在做什么任务）
- 期望的结果 vs 实际的结果
- 尝试的Prompt（包括失败的和成功的）
- AI的输出（包括错误的和正确的）

**分类标签**：
- 选择合适的问题分类（P001-P005）
- 添加标签（如：类型推断、业务逻辑、组件设计等）
- 便于后续检索和模式识别

### 2. 分析原则

**多层次分析**：
- **表面层**：技术错误（类型错误、语法错误等）
- **中间层**：Prompt问题（描述不清、上下文不足等）
- **深层**：思维模式（如何更好地与AI沟通）

**对比分析**：
- 失败的Prompt vs 成功的Prompt
- 错误的输出 vs 正确的输出
- 找出关键差异

**提炼模式**：
- 将具体问题抽象为通用模式
- 形成可复用的Prompt模板
- 建立最佳实践清单

### 3. 进化原则

**闭环学习**：
```
问题 → 分析 → 改进 → 应用 → 新问题 → 更深入分析 → ...
```

**定期回顾**：
- 每周回顾本周的问题记录
- 每月生成进化报告
- 每季度总结经验，更新方法论

**持续迭代**：
- 不断完善Prompt模式库
- 优化Context提供方式
- 提升AI协作效率

---

## 🔗 相关资源

### 项目文档
- [CLAUDE.md](../../CLAUDE.md) - Claude AI使用指南
- [AGENTS.md](../../AGENTS.md) - AI Agents使用指南
- [docs/.meta/ai-context.md](../.meta/ai-context.md) - AI工具使用指南

### 外部资源
- [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)

---

## 🤝 贡献指南

### 添加新问题

1. 使用 `/ai-evolve record` 或复制 `problems/template.md`
2. 填写完整的问题详情
3. 分类到合适的目录（P001-P005）
4. 更新 `problems/index.md`

### 添加新解决方案

1. 在 `solutions/` 对应目录创建文档
2. 使用清晰的标题和分类标签
3. 提供示例代码和使用场景
4. 更新索引文件

### 添加新模式

1. 分析多个类似问题，提炼通用模式
2. 在 `prompt-patterns/` 或 `context-patterns/` 创建文档
3. 包含：模式名称、适用场景、示例、注意事项
4. 更新索引

---

## 📅 更新日志

### 2025-12-25
- ✅ 初始化知识库结构
- ✅ 创建核心文档和模板
- ✅ 建立Prompt模式库初始内容
- ✅ 建立Context模式库初始内容
- ✅ 建立最佳实践库初始内容

---

## 📞 支持

如有问题或建议，请：
1. 查看 [QUICKSTART.md](./QUICKSTART.md)
2. 查看 [docs/.meta/ai-context.md](../.meta/ai-context.md)
3. 使用 `/ai-evolve query` 查询知识库

---

**让我们一起进化，成为顶级的AI编程"总司令"！** 🚀
