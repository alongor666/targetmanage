/**
 * Skills 加载器
 * 负责从文件系统加载 Skills
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import yaml from 'yaml';
import { Skill, SkillPath, SkillFrontmatter } from './types';

export class SkillLoader {
  // 技能搜索目录（按优先级排序）
  private readonly SKILL_DIRS: string[] = ['.skills/', '.claude/skills/'];

  // 用户级目录
  private readonly USER_SKILL_DIRS: string[] = ['~/.skills/', '~/.claude/skills/'];

  /**
   * 获取所有技能搜索路径
   */
  getSearchPaths(): SkillPath[] {
    const paths: SkillPath[] = [];

    // 项目级目录（高优先级）
    for (const skillDir of this.SKILL_DIRS) {
      const fullPath = this.resolvePath(skillDir);
      if (fullPath) {
        paths.push({
          path: fullPath,
          priority: this.getPriority(skillDir)
        });
      }
    }

    // 用户级目录（低优先级）
    for (const skillDir of this.USER_SKILL_DIRS) {
      const fullPath = this.resolvePath(skillDir);
      if (fullPath) {
        paths.push({
          path: fullPath,
          priority: this.getPriority(skillDir)
        });
      }
    }

    // 按优先级排序
    return paths.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 解析路径（处理 ~ 符号）
   */
  private resolvePath(skillDir: string): string | null {
    let fullPath: string;

    if (skillDir.startsWith('~')) {
      fullPath = skillDir.replace('~', os.homedir());
    } else {
      fullPath = path.join(process.cwd(), skillDir);
    }

    // 检查目录是否存在
    try {
      fs.access(fullPath);
      return fullPath;
    } catch {
      return null;
    }
  }

  /**
   * 获取优先级数值
   */
  private getPriority(dir: string): number {
    const priorityMap: Record<string, number> = {
      '.skills/': 1,
      '.claude/skills/': 2,
      '~/.skills/': 3,
      '~/.claude/skills/': 4
    };
    return priorityMap[dir] ?? 999;
  }

  /**
   * 加载所有技能
   */
  async loadAll(): Promise<Skill[]> {
    const skills: Skill[] = [];
    const paths = this.getSearchPaths();

    for (const searchPath of paths) {
      const location = searchPath.path.includes(process.cwd()) ? 'project' : 'user';
      const skillDirs = await this.listSkillDirectories(searchPath.path);

      for (const skillDir of skillDirs) {
        const skill = await this.parseSkill(skillDir, location);
        if (skill) {
          skills.push(skill);
        }
      }
    }

    return skills;
  }

  /**
   * 列出指定目录下的所有技能目录
   */
  private async listSkillDirectories(searchPath: string): Promise<string[]> {
    const skillDirs: string[] = [];

    try {
      const entries = await fs.readdir(searchPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const skillPath = path.join(searchPath, entry.name);
          const skillFile = path.join(skillPath, 'SKILL.md');

          // 检查是否存在 SKILL.md
          try {
            await fs.access(skillFile);
            skillDirs.push(skillPath);
          } catch {
            // 不是技能目录，跳过
          }
        }
      }
    } catch (error) {
      console.warn(`[SkillLoader] Failed to list directory ${searchPath}:`, error);
    }

    return skillDirs;
  }

  /**
   * 解析单个技能
   */
  async parseSkill(skillDir: string, location: 'project' | 'user'): Promise<Skill | null> {
    const skillPath = path.join(skillDir, 'SKILL.md');

    try {
      const content = await fs.readFile(skillPath, 'utf-8');
      const { frontmatter, body } = this.parseFrontmatter(content);

      return {
        name: frontmatter.name,
        description: frontmatter.description,
        version: frontmatter.version || '1.0.0',
        license: frontmatter.license,
        category: frontmatter.category,
        content: body,
        path: skillDir,
        location,
        metadata: frontmatter
      };
    } catch (error) {
      console.error(`[SkillLoader] Failed to parse skill ${skillDir}:`, error);
      return null;
    }
  }

  /**
   * 解析 frontmatter
   */
  private parseFrontmatter(content: string): { frontmatter: SkillFrontmatter; body: string } {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) {
      throw new Error('Invalid frontmatter format');
    }

    const frontmatterYaml = frontmatterMatch[1];
    const body = content.slice(frontmatterMatch[0].length).trim();

    let frontmatter: SkillFrontmatter;
    try {
      frontmatter = yaml.parse(frontmatterYaml);
    } catch (error) {
      throw new Error(`Failed to parse YAML frontmatter: ${error}`);
    }

    return { frontmatter, body };
  }
}
