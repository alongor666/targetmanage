# 文档-代码索引系统 - 快速入门

> 5分钟上手知识图谱驱动的文档工程

## 🚀 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 运行第一次同步
```bash
pnpm docs:sync
```

输出示例：
```
🔍 扫描文档和代码...

✅ 发现 25 个文档文件
✅ 发现 18 个代码模块

🕸️  生成知识图谱...

✅ 索引已保存到 docs/.meta

🔎 检查文档-代码一致性...

✨ 没有发现一致性问题！

📊 统计信息:
   - 文档节点: 25
   - 代码节点: 18
   - 关联边: 47
   - 文档-代码链接: 12
```

### 3. 查看知识图谱
```bash
pnpm docs:graph
```

这会打开 `docs/.meta/knowledge-graph.mmd` 文件，你可以在VS Code中预览Mermaid图。

---

## 📖 基本概念

### 什么是文档-代码索引？

传统开发：
```
文档.md  ❌  代码.ts
   ↓          ↓
 手动查找   手动查找
   ↓          ↓
 容易脱节   容易脱节
```

索引系统：
```
文档.md  ⟷  索引  ⟷  代码.ts
   ↓          ↓         ↓
 自动链接   图谱      自动链接
   ↓          ↓         ↓
 一致性保障 可视化    一致性保障
```

### 核心文件

| 文件 | 作用 | 你需要做什么 |
|------|------|-------------|
| `docs/.meta/docs-index.json` | 文档索引 | 自动生成，不用管 |
| `docs/.meta/code-index.json` | 代码索引 | 自动生成，不用管 |
| `docs/.meta/graph.json` | 知识图谱 | 自动生成，不用管 |
| `docs/.meta/sync-rules.yaml` | 同步规则配置 | 可以自定义 |
| `docs/.meta/ai-context.md` | AI工具指南 | 阅读了解 |

---

## ✍️ 日常使用

### 场景1: 我要添加新功能

#### 步骤1: 先写文档
```markdown
<!-- docs/business/指标定义规范.md -->

## 新增指标

### 月度环比增长率
- **formula**: (当月 - 上月) / 上月
- **returns**: 百分比（0.15 = 15%）
- **implementation**: `src/domain/growth.ts:monthOverMonthRate()`
```

#### 步骤2: 再写代码
```typescript
// src/domain/growth.ts

/**
 * 月度环比增长率
 * @doc docs/business/指标定义规范.md:新增指标
 * @formula (当月 - 上月) / 上月
 * @param current 当月值
 * @param previous 上月值
 * @returns 增长率，分母为0时返回null
 */
export function monthOverMonthRate(
  current: number,
  previous: number
): number | null {
  if (previous === 0) return null;
  return (current - previous) / previous;
}
```

#### 步骤3: 验证同步
```bash
pnpm docs:check
```

如果一切正常，应该输出：
```
✨ 没有发现一致性问题！
```

### 场景2: 我要修改现有功能

#### 步骤1: 查找相关文档
```bash
# 方法1: 直接看代码注释
# src/domain/time.ts 中找到 @doc 标记

# 方法2: 搜索索引
jq '.modules["src/domain/time.ts"].documentedIn' \
   docs/.meta/code-index.json

# 输出: ["docs/business/指标定义规范.md:26-64"]
```

#### 步骤2: 同步更新文档和代码
```bash
# 修改文档
vim docs/business/指标定义规范.md

# 修改代码
vim src/domain/time.ts

# 验证一致性
pnpm docs:check
```

### 场景3: 我要重构文件

#### 错误做法 ❌
```bash
rm src/old-file.ts
vim src/new-file.ts
# 结果：所有引用失效！
```

#### 正确做法 ✅
```bash
# 使用 git mv 保留历史
git mv src/old-file.ts src/new-file.ts

# 自动更新引用
pnpm docs:sync

# 检查结果
git diff docs/.meta/
```

---

## 🔍 实用命令

### 文档相关

```bash
# 同步索引（手动触发）
pnpm docs:sync

# 检查一致性（不修改）
pnpm docs:check

# 自动修复问题
pnpm docs:fix

# 可视化知识图谱
pnpm docs:graph
```

### 查询索引

```bash
# 查找某个文档被哪些代码引用
jq '.modules[] | select(.documentedIn[] | contains("指标定义"))' \
   docs/.meta/code-index.json

# 查找某个代码模块的文档
jq '.modules["src/domain/time.ts"].documentedIn' \
   docs/.meta/code-index.json

# 查看知识图谱统计
jq '{nodes: .nodes | length, edges: .edges | length}' \
   docs/.meta/graph.json
```

### Git集成

```bash
# 提交前检查（自动运行）
git commit -m "feat: 添加新功能"
# → 自动运行 pnpm docs:check

# 如果检查失败
pnpm docs:sync    # 修复问题
git add docs/.meta/
git commit --amend --no-edit
```

---

## 🎯 最佳实践

### ✅ 做什么

1. **修改业务逻辑前，先看文档**
   ```bash
   # 不要直接改代码
   vim src/domain/xxx.ts  # ❌

   # 先找到文档
   grep -r "xxx" docs/business/  # ✅
   # 理解业务逻辑 → 再改代码
   ```

2. **添加新函数时，加 @doc 标记**
   ```typescript
   // ❌ 不好
   export function calculate() { ... }

   // ✅ 好
   /**
    * @doc docs/business/指标定义规范.md:31
    */
   export function calculate() { ... }
   ```

3. **提交前运行 docs:check**
   ```bash
   git add .
   pnpm docs:check  # ← 养成习惯
   git commit -m "..."
   ```

4. **文件移动用 git mv**
   ```bash
   # ❌ 不要
   rm old.ts && vim new.ts

   # ✅ 要
   git mv old.ts new.ts
   pnpm docs:sync
   ```

### ❌ 不要做什么

1. **不要手动编辑索引文件**
   ```bash
   vim docs/.meta/code-index.json  # ❌ 禁止
   # 索引文件由工具自动生成
   ```

2. **不要忽略一致性警告**
   ```bash
   pnpm docs:check
   # ⚠️ 发现3个问题
   git commit  # ❌ 不要直接提交

   # ✅ 先修复问题
   pnpm docs:fix
   git add docs/.meta/
   git commit
   ```

3. **不要为琐碎函数添加文档**
   ```typescript
   // ❌ 过度文档化
   /**
    * @doc docs/xxx.md
    */
   function add(a: number, b: number) {
     return a + b;
   }

   // ✅ 只为业务逻辑添加
   /**
    * @doc docs/business/指标定义规范.md:31
    */
   export function calculateTimeProgress() { ... }
   ```

---

## 🆘 常见问题

### Q1: 提示"索引文件不存在"

**原因**: 首次使用，还没生成索引

**解决**:
```bash
pnpm docs:sync
```

### Q2: 提示"文档引用的代码不存在"

**原因**: 文档中引用了已删除的代码

**定位**:
```bash
pnpm docs:check
# 查看具体错误信息
```

**解决**:
```bash
# 方法1: 删除文档中的引用
vim docs/xxx.md  # 删除 <!--impl:...-->

# 方法2: 恢复代码
git restore src/xxx.ts
```

### Q3: 提示"代码引用的文档不存在"

**原因**: 代码中 @doc 标记指向了不存在的文档

**解决**:
```typescript
// 找到代码中的 @doc 标记
/**
 * @doc docs/old-path.md  // ← 这个路径不对
 */

// 修改为正确路径
/**
 * @doc docs/business/指标定义规范.md:31
 */
```

### Q4: Git合并时索引文件冲突

**解决**:
```bash
# 放弃索引文件的合并
git checkout --theirs docs/.meta/*.json

# 重新生成
pnpm docs:sync

# 提交
git add docs/.meta/
git commit
```

### Q5: 工具运行太慢

**优化**:
```yaml
# 编辑 docs/.meta/sync-rules.yaml
performance:
  enableCache: true
  parallelScan: true
  ignorePatterns:
    - "**/node_modules/**"
    - "**/*.test.ts"
```

---

## 📚 深入学习

### 推荐阅读顺序

1. **新手** (5分钟)
   - ✅ 你正在读的这篇
   - → `docs/.meta/ai-context.md` - AI工具使用

2. **进阶** (30分钟)
   - → `docs/.meta/index-schema.md` - 索引结构
   - → `docs/architecture/文档代码索引系统设计.md` - 系统设计

3. **专家** (1小时)
   - → `scripts/sync-docs-code.ts` - 工具源码
   - → `docs/.meta/sync-rules.yaml` - 配置详解

### 视频教程

- [ ] 5分钟快速上手（待录制）
- [ ] 15分钟最佳实践（待录制）
- [ ] 30分钟工具定制（待录制）

### 互动演示

```bash
# 克隆示例项目
git clone https://github.com/example/docs-code-sync-demo
cd docs-code-sync-demo

# 跟随教程一步步操作
cat TUTORIAL.md
```

---

## 🎉 开始使用

现在你已经了解了基础知识，可以：

1. **试试看**: 运行 `pnpm docs:sync`
2. **探索**: 打开 `docs/.meta/knowledge-graph.mmd`
3. **实践**: 添加一个新函数，完整走一遍流程
4. **分享**: 把这个系统介绍给团队

**需要帮助？**
- 查看 `docs/.meta/ai-context.md`
- 提Issue到项目仓库
- 在团队频道提问

祝你开发愉快！🚀
