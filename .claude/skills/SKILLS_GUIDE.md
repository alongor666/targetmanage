# Skills 系统使用指南

## 📚 目录

- [概述](#概述)
- [架构设计](#架构设计)
- [快速开始](#快速开始)
- [创建自定义技能](#创建自定义技能)
- [在代码中使用](#在代码中使用)
- [React Hooks](#react-hooks)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 概述

Skills 系统是一个模块化的 AI 技能管理系统，基于 Minion Skills 架构实现。它允许你将专业知识、工作流程和特定领域的逻辑封装成独立的 Skill，然后根据需要动态加载和使用。

### 核心优势

- **模块化**：每个 Skill 独立管理，互不影响
- **按需加载**：只在需要时加载特定 Skill，减少资源消耗
- **可扩展**：轻松添加新 Skill，无需修改核心代码
- **类型安全**：完整的 TypeScript 类型支持
- **优先级管理**：支持项目级和用户级 Skill 分层

---

## 架构设计

### 目录结构

```
targetmanage/
├── .skills/                    # 项目级技能目录
│   ├── data-import/            # 数据导入技能
│   │   └── SKILL.md
│   ├── kpi-calculation/        # KPI计算技能
│   │   └── SKILL.md
│   ├── chart-visualization/    # 图表可视化技能
│   │   └── SKILL.md
│   ├── skill-loader/           # 技能加载器文档
│   │   └── SKILL.md
│   └── README.md               # Skills 系统总览
│
├── src/lib/skill-loader/       # Skills 系统实现
│   ├── types.ts               # 类型定义
│   ├── loader.ts              # 技能加载器
│   ├── registry.ts            # 技能注册表
│   ├── executor.ts             # 技能执行器
│   ├── hooks.ts               # React Hooks
│   └── index.ts               # 主入口
│
└── src/app/skills-demo/        # 演示页面
    └── page.tsx
```

### 核心组件

| 组件 | 职责 |
|------|------|
| `SkillLoader` | 从文件系统加载 Skills |
| `SkillRegistry` | 管理技能的注册、查询 |
| `SkillExecutor` | 执行技能并返回结果 |
| React Hooks | 提供便捷的 React 集成 |

---

## 快速开始

### 1. 查看演示页面

启动开发服务器：

```bash
pnpm dev
```

访问演示页面：

```
http://localhost:3000/skills-demo
```

### 2. 基础使用

```typescript
import { getSkillExecutor } from '@/lib/skill-loader';

// 获取执行器
const executor = await getSkillExecutor();

// 执行技能
const result = await executor.execute('data-import', {
  csvText: 'year,month,org_cn,product_cn,premium\n2026,1,成都分公司,车险,8500'
});

if (result.success) {
  console.log('Imported records:', result.result.imported);
} else {
  console.error('Error:', result.error);
}
```

### 3. 使用 React Hooks

```typescript
'use client';

import { useSkills, useSkillExecution } from '@/lib/skill-loader/hooks';

export default function MyComponent() {
  const { skills, loading } = useSkills();
  const { execute, result, loading: execLoading } = useSkillExecution();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Available Skills</h1>
      {skills.map((skill) => (
        <button key={skill.name} onClick={() => execute(skill.name)}>
          {skill.name}
        </button>
      ))}

      {result && <div>Result: {JSON.stringify(result.result)}</div>}
    </div>
  );
}
```

---

## 创建自定义技能

### 1. 创建技能目录

在 `.skills/` 目录下创建新文件夹：

```bash
mkdir -p .skills/my-skill
```

### 2. 创建 SKILL.md 文件

```markdown
---
name: my-skill
description: 我的自定义技能
license: MIT
version: 1.0.0
category: custom
---

# My Skill

这是我的自定义技能说明。

## 功能

- 功能1
- 功能2

## 使用方法

1. 步骤1
2. 步骤2

## 示例

```typescript
// 示例代码
const result = await execute('my-skill', { param: 'value' });
```
```

### 3. 实现技能逻辑

在 `src/lib/skill-loader/executor.ts` 中添加逻辑：

```typescript
private async runSkillLogic(skill: Skill, prompt: string, context: SkillContext): Promise<any> {
  switch (skill.name) {
    case 'my-skill':
      return await this.executeMySkill(context);
    // ... 其他技能
    default:
      return { instructions: prompt };
  }
}

private async executeMySkill(context: SkillContext): Promise<any> {
  // 实现你的技能逻辑
  const result = doSomething(context);
  return { type: 'my-skill', result };
}
```

### 4. 测试技能

访问演示页面，查看新技能是否出现在列表中。

---

## 在代码中使用

### 场景 1：数据导入

```typescript
import { getSkillExecutor } from '@/lib/skill-loader';

async function importCSV(csvText: string) {
  const executor = await getSkillExecutor();
  const result = await executor.execute('data-import', { csvText });

  if (result.success) {
    // 处理导入的数据
    const records = result.result.records;
    console.log(`成功导入 ${records.length} 条记录`);
    return records;
  } else {
    // 处理错误
    console.error('导入失败:', result.error);
    throw new Error(result.error);
  }
}
```

### 场景 2：KPI 计算

```typescript
import { getSkillExecutor } from '@/lib/skill-loader';

async function calculateMetrics(orgId: string, year: number) {
  const executor = await getSkillExecutor();

  // 获取当前数据和基期数据
  const current = await fetchData(orgId, year);
  const baseline = await fetchData(orgId, year - 1);

  // 计算指标
  const result = await executor.execute('kpi-calculation', {
    current,
    baseline
  });

  if (result.success) {
    return result.result.metrics;
  } else {
    throw new Error(result.error);
  }
}
```

### 场景 3：图表生成

```typescript
import { getSkillExecutor } from '@/lib/skill-loader';

async function generateChart(data: any) {
  const executor = await getSkillExecutor();

  const result = await executor.execute('chart-visualization', {
    chartType: 'bar',
    data,
    options: {
      showGrowthLine: true,
      enableWarning: true
    }
  });

  if (result.success) {
    return result.result.config; // ECharts 配置
  } else {
    throw new Error(result.error);
  }
}
```

---

## React Hooks

### useSkills

获取所有可用技能列表。

```typescript
const { skills, loading, error } = useSkills();

skills.forEach(skill => {
  console.log(skill.name, skill.description);
});
```

### useSkill

获取单个技能详情。

```typescript
const { skill, loading, error } = useSkill('data-import');

if (skill) {
  console.log(skill.content);
}
```

### useSkillExecution

执行技能。

```typescript
const { execute, result, loading, error, reset } = useSkillExecution();

// 执行技能
await execute('data-import', { csvText });

// 查看结果
if (result) {
  console.log(result.result);
}

// 重置
reset();
```

### useSkillsByCategory

按类别获取技能。

```typescript
const { skills, loading } = useSkillsByCategory('data-processing');

skills.forEach(skill => {
  console.log(skill.name);
});
```

---

## 最佳实践

### 1. 技能设计原则

- **单一职责**：每个 Skill 只负责一个特定领域
- **清晰描述**：description 字段要简洁明了
- **详细文档**：SKILL.md 中包含完整的使用说明
- **示例代码**：提供可运行的示例代码

### 2. 性能优化

- **缓存结果**：避免重复计算
- **延迟加载**：只在需要时加载 Skill
- **批量操作**：支持批量数据处理

### 3. 错误处理

```typescript
try {
  const result = await executor.execute('skill-name', context);

  if (!result.success) {
    // 处理业务错误
    console.error(result.error);

    // 显示可用技能列表
    if (result.availableSkills) {
      console.log('Available skills:', result.availableSkills);
    }
  }
} catch (error) {
  // 处理系统错误
  console.error('System error:', error);
}
```

### 4. 类型安全

```typescript
import type { SkillContext, SkillResult } from '@/lib/skill-loader';

// 定义你的上下文类型
interface MyContext extends SkillContext {
  csvText: string;
  format: 'monthly' | 'yearly';
}

// 定义你的结果类型
interface MyResult extends SkillResult {
  result: {
    imported: number;
    records: Array<any>;
  };
}
```

---

## 常见问题

### Q: 如何调试技能加载过程？

A: 查看浏览器控制台，Skills 系统会输出详细的加载日志：

```
[SkillSystem] Loading 4 skills...
[SkillRegistry] Registered skill: data-import (project)
[SkillRegistry] Registered skill: kpi-calculation (project)
[SkillRegistry] Registered skill: chart-visualization (project)
[SkillRegistry] Registered skill: skill-loader (project)
[SkillSystem] Loaded skills: data-import, kpi-calculation, chart-visualization, skill-loader
```

### Q: 技能加载失败怎么办？

A: 检查以下几点：

1. SKILL.md 文件是否存在
2. Frontmatter 格式是否正确（YAML）
3. 是否有语法错误
4. 路径是否正确

### Q: 如何在客户端使用？

A: 使用 `use client` 指令标记客户端组件，然后使用 React Hooks：

```typescript
'use client';

import { useSkills } from '@/lib/skill-loader/hooks';

export default function ClientComponent() {
  const { skills } = useSkills();
  // ...
}
```

### Q: 如何在服务端使用？

A: 直接导入并使用：

```typescript
import { getSkillExecutor } from '@/lib/skill-loader';

export async function getServerSideProps() {
  const executor = await getSkillExecutor();
  const result = await executor.execute('skill-name', context);

  return {
    props: { result }
  };
}
```

### Q: 如何更新技能？

A: 直接修改 SKILL.md 文件，Skills 系统会自动重新加载。如果需要手动刷新，可以调用：

```typescript
import { reloadSkills } from '@/lib/skill-loader';

await reloadSkills();
```

---

## 相关文档

- [Skills 系统总览](.skills/README.md)
- [数据导入技能](.skills/data-import/SKILL.md)
- [KPI 计算技能](.skills/kpi-calculation/SKILL.md)
- [图表可视化技能](.skills/chart-visualization/SKILL.md)
- [技能加载器](.skills/skill-loader/SKILL.md)

---

## 贡献

欢迎贡献新的 Skills！请参考[创建自定义技能](#创建自定义技能)章节。

---

## 许可证

MIT License
