/**
 * Skills 注册表
 * 管理所有技能的注册、查询和执行
 */

import { Skill, SkillResult } from './types';

export class SkillRegistry {
  private _skills: Map<string, Skill> = new Map();

  /**
   * 注册技能，高优先级覆盖低优先级
   */
  register(skill: Skill): boolean {
    const existing = this._skills.get(skill.name);

    if (existing) {
      const priority: Record<string, number> = { project: 0, user: 1 };
      if (priority[skill.location] >= priority[existing.location]) {
        console.warn(
          `[SkillRegistry] Skipping ${skill.name}: existing skill has higher or equal priority`
        );
        return false;
      }
      console.log(`[SkillRegistry] Overriding ${skill.name} with higher priority skill`);
    }

    this._skills.set(skill.name, skill);
    console.log(`[SkillRegistry] Registered skill: ${skill.name} (${skill.location})`);
    return true;
  }

  /**
   * 获取指定技能
   */
  get(name: string): Skill | undefined {
    return this._skills.get(name);
  }

  /**
   * 列出所有技能
   */
  listAll(): Skill[] {
    return Array.from(this._skills.values());
  }

  /**
   * 按类别列出技能
   */
  listByCategory(category: string): Skill[] {
    return this.listAll().filter((s) => s.category === category);
  }

  /**
   * 搜索技能
   */
  search(query: string): Skill[] {
    const lowerQuery = query.toLowerCase();
    return this.listAll().filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * 生成可用技能列表（用于错误提示）
   */
  generateSkillsPrompt(charBudget = 10000): string {
    const skills = this.listAll();
    let prompt = '## Available Skills\n\n';

    for (const skill of skills) {
      const skillInfo = `- **${skill.name}**: ${skill.description}\n`;
      if (prompt.length + skillInfo.length > charBudget) {
        prompt += `\n... and ${skills.length - prompt.split('\n').length + 1} more skills\n`;
        break;
      }
      prompt += skillInfo;
    }

    return prompt;
  }

  /**
   * 获取技能的完整指令内容
   */
  getSkillPrompt(skillName: string): string | null {
    const skill = this.get(skillName);
    if (!skill) return null;

    return `
Loading skill: ${skill.name}
Version: ${skill.version || '1.0.0'}
Description: ${skill.description}
License: ${skill.license || 'MIT'}

## Skill Instructions
${skill.content}
    `.trim();
  }
}
