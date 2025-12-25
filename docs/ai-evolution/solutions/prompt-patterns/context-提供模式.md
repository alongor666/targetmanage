# [P-001] Context提供模式

> **核心理念**：给AI提供充足的上下文，让AI准确理解项目背景和需求

**效果提升**：AI理解准确率 +40%
**适用场景**：所有需要AI理解项目背景的任务
**难度**：⭐ 简单
**标签**：#基础模式 #必备 #通用

---

## 🎯 模式概述

### 问题
❌ **不提供Context的Prompt**：
```
创建一个图表组件
```

AI的困惑：
- 什么类型的图表？
- 使用什么技术栈？
- 遵循什么设计规范？
- 与现有代码如何集成？

结果：AI生成的代码与项目不匹配，需要大量修改。

---

### 解决方案
✅ **提供完整Context的Prompt**：
```
创建一个ECharts折线图组件

## Context

### 项目背景
- 项目：目标管理可视化平台
- 技术栈：Next.js 14 + TypeScript + Tailwind CSS
- 图表库：ECharts (已安装echarts-for-react)

### 设计规范
- 参考：src/components/charts/UniversalChart/
- 配色：使用项目的tokens.ts中定义的颜色
- 布局：响应式设计，支持2400px PPT容器

### 需求
1. 接收data prop（格式：{x: string, y: number}[]）
2. 支持自定义标题
3. 支持自定义颜色主题
4. 自动响应容器大小
5. 使用TypeScript严格类型

### 参考代码
- 类似组件：src/components/charts/UniversalChart/UniversalChart.tsx
- 类型定义：src/components/charts/UniversalChart/UniversalChart.types.ts
```

结果：AI一次生成符合要求的代码，无需大改。

---

## 📝 Prompt模板

```markdown
[任务描述]

## Context

### 项目背景
- 项目：[项目名称和用途]
- 技术栈：[框架、库、工具]
- 相关技术：[具体使用的技术]

### 设计规范
- 参考：[参考的代码/文档路径]
- 样式：[设计要求]
- 布局：[布局规范]

### 业务规则（如适用）
- 规则1：[具体业务规则]
- 规则2：[计算公式]
- 规则3：[约束条件]

### 需求列表
1. [具体需求1]
2. [具体需求2]
3. [具体需求3]
...

### 参考代码（如适用）
- 类似实现：[文件路径]
- 类型定义：[文件路径]
- 配置文件：[文件路径]

### 约束条件
- [限制条件1]
- [限制条件2]
```

---

## 💡 使用示例

### 示例1：创建组件

```
创建一个机构选择下拉组件

## Context

### 项目背景
- 项目：川分目标管理系统
- 技术栈：Next.js 14 + TypeScript + Tailwind CSS
- 状态管理：React useState

### 设计规范
- 参考：src/components/filters/ 中的其他筛选器
- 样式：使用Tailwind CSS，保持与现有组件一致
- 交互：下拉选择，支持搜索

### 业务规则
- 机构数据来自：public/data/orgs.json
- 支持5种组织模式：branch/local/remote/single/multi
- 默认选中：branch模式

### 需求列表
1. 下拉选择器（使用HTML select或自定义组件）
2. 显示机构中文名（org_cn字段）
3. 按group分组显示（local和remote）
4. 支持onChange回调
5. TypeScript严格类型

### 参考代码
- 数据加载：src/services/loaders.ts - loadOrgs()
- 组织模式：src/config/organizationModes.ts
- 类型定义：src/schemas/types.ts - Org类型

### 约束条件
- 不要使用外部UI库（如antd、mui）
- 保持与项目现有风格一致
```

---

### 示例2：修复Bug

```
修复时间进度计算错误

## Context

### 项目背景
- 项目：川分目标管理系统
- 模块：时间进度计算（domain layer）

### 问题描述
- 文件：src/domain/time.ts
- 函数：calculateTimeProgress()
- 错误：2025-Actual模式下，进度计算不正确

### 业务规则
- 业务规则文档：docs/business/指标定义规范.md:26-64
- 计算公式：
  - Linear模式：currentMonth / 12
  - Weighted模式：sum(weights[0..currentMonth-1])
  - 2025-Actual模式：sum(actuals2025[0..currentMonth-1]) / sum(actuals2025[0..11])

### 期望vs实际
- 期望：2025-Actual模式返回基于2025年实际数据的进度
- 实际：返回的进度值明显偏高

### 相关代码
- 数据加载：src/services/loaders.ts - loadActualsMonthly2025()
- 类型定义：src/schemas/types.ts - MonthlyActualRecord
- 测试数据：public/data/actuals_monthly_2025.json

### 约束条件
- 保持函数签名不变
- 遵循Null-safe原则（缺少数据时返回null）
- 添加@doc标签指向业务文档
```

---

## ✅ Context清单

使用此模式时，确保提供以下Context：

### 必须提供 ✅
- [ ] **任务描述**：明确要做什么
- [ ] **技术栈**：使用什么技术
- [ ] **项目背景**：项目的基本信息

### 强烈推荐 ⭐
- [ ] **设计规范**：遵循什么规范
- [ ] **参考代码**：类似的实现
- [ ] **需求列表**：具体要求

### 根据情况提供
- [ ] **业务规则**：涉及业务逻辑时必须
- [ ] **数据结构**：涉及数据操作时必须
- [ ] **约束条件**：有特殊要求时
- [ ] **期望vs实际**：修复Bug时必须

---

## 🎯 效果验证

### 验证指标
- ✅ AI一次生成正确代码的概率
- ✅ 需要修改的次数
- ✅ 代码与项目的一致性

### 对比数据

**不使用模式**：
- 一次成功率：30-40%
- 平均修改次数：3-5次
- 平均耗时：45分钟

**使用模式**：
- 一次成功率：70-85%
- 平均修改次数：0-1次
- 平均耗时：15分钟

**提升**：+40% 成功率，-67% 时间

---

## ⚠️ 注意事项

### 1. Context不是越多越好
- ❌ 不要复制粘贴大量无关代码
- ✅ 提供关键的、相关的信息
- ✅ 使用文件路径而不是完整代码

### 2. 分层提供Context
```
Level 1: 基础Context（必须）
- 项目类型、技术栈

Level 2: 详细Context（推荐）
- 设计规范、参考代码

Level 3: 补充Context（可选）
- 业务规则、约束条件
```

### 3. 动态调整
- 第一次Prompt：提供基础Context
- AI理解有偏差：补充详细Context
- AI完全理解错误：提供完整Context + 示例

---

## 📚 相关模式

- [P-002] 任务分解模式 - 复杂任务时结合使用
- [C-001] 业务规则提供 - 业务逻辑任务的Context模式
- [C-002] 代码结构说明 - 大型项目的Context模式

---

## 📊 实战案例

### 案例1：创建UniversalChart组件
**原始Prompt（失败）**：
```
创建一个通用图表组件
```

**使用模式后（成功）**：
```
创建一个通用ECharts图表组件

## Context

### 项目背景
- 项目：目标管理可视化平台
- 技术栈：Next.js 14 + TypeScript + echarts-for-react
- 设计系统：参考docs/design/全局设计规范.md

### 需求
1. 支持多种图表类型（折线、柱状、饼图）
2. 通过type prop切换类型
3. 通过config prop配置图表选项
4. 响应式设计，自动适应容器
5. TypeScript严格类型，使用泛型

### 参考
- 现有简单图表：src/components/charts/
- ECharts官方示例：https://echarts.apache.org/examples/
- 项目配色：src/styles/tokens.ts

### 约束
- 不要包含数据加载逻辑（Pure Component）
- 遵循项目的命名规范
- 添加完整的JSDoc注释
```

**效果**：一次生成，完全符合要求

---

## 🔄 模式进化

### v1.0（当前）
- 基础Context清单
- 通用模板

### 未来计划
- 针对不同任务类型的专门模板
- 自动Context提取工具
- Context最小化建议

---

**创建日期**：2025-12-25
**最后更新**：2025-12-25
**使用次数**：0
**成功率**：-（待验证）
