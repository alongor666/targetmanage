---
name: skill-loader
description: Skills加载器，用于动态加载和管理所有专业技能
license: MIT
version: 1.0.0
category: infrastructure
---

# Skill Loader

## 功能概述
Skill Loader 是 Skills 系统的核心组件，负责发现、加载、注册和管理所有专业技能。支持项目级和用户级技能分层，提供技能注册表和按需加载能力。

## 目录结构

```
targetmanage/
├── .skills/                  # 项目级技能（最高优先级）
│   ├── data-import/          # 数据导入技能
│   │   └── SKILL.md
│   ├── kpi-calculation/      # KPI计算技能
│   │   └── SKILL.md
│   └── chart-visualization/  # 图表可视化技能
│       └── SKILL.md
│
├── lib/                      # 技能加载器实现
│   └── skill-loader.ts
│
└── .claude/skills/           # Claude Code 兼容路径
    └── (项目级技能符号链接)
```

## 加载优先级

| 优先级 | 路径 | 说明 |
|-------|------|------|
| 1 | `.skills/` | 项目级技能，最高优先级 |
| 2 | `.claude/skills/` | Claude Code 兼容路径 |
| 3 | `~/.skills/` | 用户级技能，跨项目共享 |
| 4 | `~/.claude/skills/` | Claude Code 用户级路径 |

## 核心功能

### 1. 技能发现

```typescript
class SkillLoader {
  private SKILL_DIRS = [
    '.skills/',              // 项目级
    '.claude/skills/',       // Claude 兼容
    '~/.skills/',            // 用户级
    '~/.claude/skills/'      // Claude 用户级
  ];

  getSearchPaths(): SkillPath[] {
    const paths: SkillPath[] = [];

    for (const skillDir of this.SKILL_DIRS) {
      // 解析 ~ 路径
      const fullPath = skillDir.startsWith('~')
        ? skillDir.replace('~', os.homedir())
        : path.join(process.cwd(), skillDir);

      if (fs.existsSync(fullPath)) {
        paths.push({
          path: fullPath,
          priority: this.getPriority(skillDir)
        });
      }
    }

    return paths.sort((a, b) => a.priority - b.priority);
  }

  private getPriority(dir: string): number {
    const priorityMap: Record<string, number> = {
      '.skills/': 1,
      '.claude/skills/': 2,
      '~/.skills/': 3,
      '~/.claude/skills/': 4
    };
    return priorityMap[dir] ?? 999;
  }
}
```

### 2. 技能解析

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

class SkillLoader {
  async parseSkill(skillDir: string): Promise<Skill | null> {
    const skillPath = path.join(skillDir, 'SKILL.md');

    if (!fs.existsSync(skillPath)) {
      console.warn(`SKILL.md not found in ${skillDir}`);
      return null;
    }

    const content = await fs.readFile(skillPath, 'utf-8');

    // 解析 frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      console.warn(`Invalid frontmatter in ${skillPath}`);
      return null;
    }

    const frontmatter = frontmatterMatch[1];
    const body = content.slice(frontmatterMatch[0].length);

    // 解析 YAML frontmatter
    const metadata = yaml.parse(frontmatter);

    return {
      name: metadata.name,
      description: metadata.description,
      version: metadata.version ?? '1.0.0',
      license: metadata.license,
      category: metadata.category,
      content: body,
      path: skillDir,
      location: skillDir.includes(process.cwd()) ? 'project' : 'user',
      metadata
    };
  }
}
```

### 3. 技能注册表

```typescript
class SkillRegistry {
  private _skills: Map<string, Skill> = new Map();

  register(skill: Skill): boolean {
    // 同名技能：高优先级覆盖低优先级
    const existing = this._skills.get(skill.name);
    if (existing) {
      const priority = { project: 0, user: 1 };
      if (priority[skill.location] >= priority[existing.location]) {
        console.warn(`Skipping ${skill.name}: existing skill has higher priority`);
        return false;
      }
    }

    this._skills.set(skill.name, skill);
    console.log(`Registered skill: ${skill.name} (${skill.location})`);
    return true;
  }

  get(name: string): Skill | undefined {
    return this._skills.get(name);
  }

  listAll(): Skill[] {
    return Array.from(this._skills.values());
  }

  listByCategory(category: string): Skill[] {
    return this.listAll().filter(s => s.category === category);
  }

  search(query: string): Skill[] {
    const lowerQuery = query.toLowerCase();
    return this.listAll().filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery)
    );
  }
}
```

### 4. 技能执行器

```typescript
class SkillExecutor {
  constructor(private registry: SkillRegistry) {}

  async execute(skillName: string, context: any): Promise<SkillResult> {
    const skill = this.registry.get(skillName);

    if (!skill) {
      return {
        success: false,
        error: `Unknown skill: ${skillName}`,
        availableSkills: this.registry.listAll().map(s => ({
          name: s.name,
          description: s.description
        }))
      };
    }

    try {
      // 获取技能指令
      const prompt = this.generateSkillPrompt(skill, context);

      // 执行技能逻辑（这里可以集成到 AI 系统）
      const result = await this.runSkillLogic(skill, prompt, context);

      return {
        success: true,
        skillName,
        prompt,
        result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private generateSkillPrompt(skill: Skill, context: any): string {
    return `
Loading skill: ${skill.name}
Version: ${skill.version}
Description: ${skill.description}

## Skill Instructions
${skill.content}

## Current Context
${JSON.stringify(context, null, 2)}
    `.trim();
  }

  private async runSkillLogic(skill: Skill, prompt: string, context: any): Promise<any> {
    // 这里实现技能的具体逻辑
    // 可以调用相关的 TypeScript 函数、API 等

    // 示例：data-import 技能
    if (skill.name === 'data-import') {
      return this.executeDataImport(context);
    }

    // 示例：kpi-calculation 技能
    if (skill.name === 'kpi-calculation') {
      return this.executeKPICalculation(context);
    }

    // 默认：返回技能内容供 AI 使用
    return { instructions: prompt };
  }

  private async executeDataImport(context: any): Promise<any> {
    // 调用 src/services/loaders.ts 中的函数
    const { parseMonthlyCsv, loadOrgs } = await import('@/services/loaders');

    const csvText = context.csvText;
    const data = parseMonthlyCsv(csvText);
    const orgs = await loadOrgs();

    // 验证数据...
    // 保存到 localStorage...

    return { imported: data.length, orgs: orgs.length };
  }

  private async executeKPICalculation(context: any): Promise<any> {
    // 调用 src/domain/ 中的函数
    const { calculateGrowthMetrics } = await import('@/domain/growth');
    const { safeDivide } = await import('@/domain/achievement');

    const { current, baseline } = context;
    const metrics = calculateGrowthMetrics(current, baseline);

    return { metrics };
  }
}
```

## 完整集成

### 在 Next.js 中使用

```typescript
// src/lib/skill-loader.ts
import { SkillLoader, SkillRegistry, SkillExecutor } from './skill-loader';

// 单例模式
let loaderInstance: SkillLoader | null = null;
let registryInstance: SkillRegistry | null = null;
let executorInstance: SkillExecutor | null = null;

export async function getSkillLoader(): Promise<SkillLoader> {
  if (!loaderInstance) {
    loaderInstance = new SkillLoader();
  }
  return loaderInstance;
}

export async function getSkillRegistry(): Promise<SkillRegistry> {
  if (!registryInstance) {
    const loader = await getSkillLoader();
    registryInstance = new SkillRegistry();

    // 加载所有技能
    const skills = await loader.loadAll();
    skills.forEach(skill => registryInstance!.register(skill));
  }
  return registryInstance;
}

export async function getSkillExecutor(): Promise<SkillExecutor> {
  if (!executorInstance) {
    const registry = await getSkillRegistry();
    executorInstance = new SkillExecutor(registry);
  }
  return executorInstance;
}

// React Hook
export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSkillRegistry().then(registry => {
      setSkills(registry.listAll());
      setLoading(false);
    });
  }, []);

  return { skills, loading };
}

export function useSkill(name: string) {
  const [skill, setSkill] = useState<Skill | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSkillRegistry().then(registry => {
      setSkill(registry.get(name));
      setLoading(false);
    });
  }, [name]);

  return { skill, loading };
}
```

### React 组件集成

```typescript
// src/components/SkillSelector.tsx
import { useSkills, useSkill } from '@/lib/skill-loader';

export function SkillSelector() {
  const { skills, loading } = useSkills();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  if (loading) return <div>Loading skills...</div>;

  return (
    <div>
      <h2>Available Skills</h2>
      <select onChange={(e) => setSelectedSkill(e.target.value)}>
        <option value="">Select a skill...</option>
        {skills.map(skill => (
          <option key={skill.name} value={skill.name}>
            {skill.name} - {skill.description}
          </option>
        ))}
      </select>

      {selectedSkill && <SkillDetail skillName={selectedSkill} />}
    </div>
  );
}

function SkillDetail({ skillName }: { skillName: string }) {
  const { skill } = useSkill(skillName);

  if (!skill) return null;

  return (
    <div>
      <h3>{skill.name}</h3>
      <p>{skill.description}</p>
      <pre>{skill.content}</pre>
    </div>
  );
}
```

## API 参考

### SkillLoader

| 方法 | 说明 |
|------|------|
| `loadAll()` | 加载所有技能 |
| `loadFromPath(path)` | 从指定路径加载技能 |
| `parseSkill(path)` | 解析单个技能文件 |

### SkillRegistry

| 方法 | 说明 |
|------|------|
| `register(skill)` | 注册技能 |
| `get(name)` | 获取指定技能 |
| `listAll()` | 列出所有技能 |
| `listByCategory(category)` | 按类别列出技能 |
| `search(query)` | 搜索技能 |

### SkillExecutor

| 方法 | 说明 |
|------|------|
| `execute(name, context)` | 执行指定技能 |

## 最佳实践

1. **延迟加载**：只在需要时加载技能，避免影响启动性能
2. **缓存机制**：缓存已加载的技能，减少重复解析
3. **错误处理**：技能加载失败时不影响系统其他功能
4. **日志记录**：记录技能加载和执行过程，便于调试
5. **版本管理**：支持技能版本，避免兼容性问题

## 参考文档
- @code .skills/data-import/SKILL.md
- @code .skills/kpi-calculation/SKILL.md
- @code .skills/chart-visualization/SKILL.md
