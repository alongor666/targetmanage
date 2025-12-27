/**
 * Skills 系统类型定义
 */

export interface Skill {
  name: string;
  description: string;
  version: string;
  license?: string;
  category?: string;
  content: string;
  path: string;
  location: 'project' | 'user';
  metadata: SkillMetadata;
}

export interface SkillMetadata {
  [key: string]: any;
}

export interface SkillPath {
  path: string;
  priority: number;
}

export interface SkillResult {
  success: boolean;
  skillName?: string;
  prompt?: string;
  result?: any;
  error?: string;
  availableSkills?: Array<{ name: string; description: string }>;
}

export interface SkillContext {
  [key: string]: any;
}

export interface SkillFrontmatter {
  name: string;
  description: string;
  version?: string;
  license?: string;
  category?: string;
  allowedTools?: string[];
  [key: string]: any;
}
