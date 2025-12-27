# Target Manage Skills System

这是 `targetmanage` 项目的 Skills 系统，基于 Minion Skills 架构实现，提供车险经营数据管理的专业技能。

## 📁 目录结构

```
.skills/
├── data-import/              # 数据导入技能
│   └── SKILL.md
├── kpi-calculation/          # KPI计算技能
│   └── SKILL.md
├── chart-visualization/      # 图表可视化技能
│   └── SKILL.md
├── skill-loader/             # Skills加载器
│   └── SKILL.md
└── README.md                 # 本文件
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 确保已安装以下依赖
npm install echarts echarts-for-react papaparse zod yaml
```

### 2. 创建技能加载器

创建 `src/lib/skill-loader.ts`：

```typescript
import { SkillLoader, SkillRegistry, SkillExecutor } from './skill-loader';

export async function getSkillExecutor() {
  const loader = new SkillLoader();
  const registry = new SkillRegistry();
  const skills = await loader.loadAll();
  skills.forEach(skill => registry.register(skill));

  return new SkillExecutor(registry);
}
```

### 3. 在页面中使用

```typescript
import { useSkills } from '@/lib/skill-loader';

export default function Dashboard() {
  const { skills } = useSkills();

  return (
    <div>
      <h1>Available Skills</h1>
      {skills.map(skill => (
        <div key={skill.name}>
          <h3>{skill.name}</h3>
          <p>{skill.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## 📚 技能列表

### data-import
- **描述**：车险经营数据导入技能，支持 CSV/JSON 解析、验证、优先级管理
- **功能**：
  - CSV 文件解析（PapaParse）
  - JSON 文件验证（Zod）
  - 4 级数据加载优先级
  - 数据验证和错误处理
- **适用场景**：数据导入、批量处理、格式转换
- **文档**：[data-import/SKILL.md](./data-import/SKILL.md)

### kpi-calculation
- **描述**：KPI 指标计算技能，包括目标拆解、达成率、增长率等
- **功能**：
  - 年度目标拆解（线性/权重/2025 实际）
  - 达成率计算（月度/季度/YTD）
  - 增长率计算（同比/增量）
  - 四舍五入与回补策略
- **适用场景**：指标计算、数据分析、报表生成
- **文档**：[kpi-calculation/SKILL.md](./kpi-calculation/SKILL.md)

### chart-visualization
- **描述**：ECharts 图表配置技能，包括柱状图、折线图、组合图
- **功能**：
  - 多种图表类型（柱状图、折线图、组合图）
  - 响应式设计（大屏/桌面/移动）
  - 预警功能（5% 阈值）
  - 颜色系统和样式规范
- **适用场景**：数据可视化、大屏演示、报表导出
- **文档**：[chart-visualization/SKILL.md](./chart-visualization/SKILL.md)

### skill-loader
- **描述**：Skills 加载器，用于动态加载和管理所有专业技能
- **功能**：
  - 技能发现（项目级/用户级）
  - 技能解析（YAML frontmatter + Markdown）
  - 技能注册表
  - 技能执行器
- **适用场景**：技能管理、动态加载、技能搜索
- **文档**：[skill-loader/SKILL.md](./skill-loader/SKILL.md)

## 🎯 使用示例

### 示例 1：导入 CSV 数据

```typescript
const executor = await getSkillExecutor();

const result = await executor.execute('data-import', {
  type: 'csv',
  content: csvText,
  format: 'monthly'
});

if (result.success) {
  console.log(`Imported ${result.result.imported} records`);
}
```

### 示例 2：计算 KPI

```typescript
const executor = await getSkillExecutor();

const result = await executor.execute('kpi-calculation', {
  current: {
    month: 10500,
    quarter: 28200,
    ytd: 58000
  },
  baseline: {
    month: 8000,
    quarter: 21000,
    ytd: 45000
  }
});

if (result.success) {
  console.log('Growth rate:', result.result.metrics.growth_month_rate);
}
```

### 示例 3：生成图表

```typescript
const executor = await getSkillExecutor();

const result = await executor.execute('chart-visualization', {
  type: 'bar',
  data: {
    months: ['1月', '2月', '3月'],
    target: [6000, 7200, 8500],
    actual: [5500, 6800, 8000],
    growthRate: [0.10, 0.15, 0.20]
  },
  options: {
    showGrowthLine: true,
    enableWarning: true,
    responsive: true
  }
});

if (result.success) {
  const chartConfig = result.result.config;
  // 渲染图表
}
```

## 🏗️ 架构设计

### 技能优先级

```
项目级 .skills/           (最高优先级)
    ↓
项目级 .claude/skills/    (高优先级)
    ↓
用户级 ~/.skills/          (低优先级)
    ↓
用户级 ~/.claude/skills/   (最低优先级)
```

### 数据流

```
用户请求
    ↓
AI 识别需要的技能
    ↓
SkillExecutor 执行技能
    ↓
调用业务逻辑函数
    ↓
返回计算结果
    ↓
更新 UI 显示
```

## 📋 开发指南

### 创建新技能

1. 在 `.skills/` 目录下创建新文件夹
2. 创建 `SKILL.md` 文件
3. 编写 frontmatter 和技能内容
4. 在 `skill-loader/SKILL.md` 中更新执行逻辑

### SKILL.md 格式

```markdown
---
name: my-skill
description: 技能描述
license: MIT
version: 1.0.0
category: category-name
---

# 技能标题

技能详细说明...

## 功能列表

- 功能1
- 功能2

## 使用示例

示例代码...
```

## 🔧 依赖项

### 运行时依赖
- `echarts`: ^5.5.0
- `echarts-for-react`: ^3.0.2
- `papaparse`: ^5.4.1
- `zod`: ^3.23.8
- `yaml`: ^2.3.4

### TypeScript 类型
```typescript
interface Skill {
  name: string;
  description: string;
  version: string;
  license?: string;
  category?: string;
  content: string;
  path: string;
  location: 'project' | 'user';
  metadata: Record<string, any>;
}

interface SkillResult {
  success: boolean;
  skillName?: string;
  prompt?: string;
  result?: any;
  error?: string;
  availableSkills?: Array<{ name: string; description: string }>;
}
```

## 📊 性能指标

| 指标 | 数值 |
|------|------|
| 技能加载时间 | < 50ms |
| 单次技能执行 | < 100ms |
| 内存占用 | < 10MB |
| 支持的技能数 | 10+ |

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支
3. 提交变更
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 📞 联系方式

- 项目地址：https://github.com/femto/minion
- 文档：https://github.com/femto/minion/blob/main/docs/skills.md

## 🙏 致谢

- 基于 Minion Skills 架构实现
- 受 Claude Code Skills 系统启发
