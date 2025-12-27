/**
 * Skills 系统 - 主入口
 * 提供单例访问模式
 */

import { SkillLoader } from './loader';
import { SkillRegistry } from './registry';
import { SkillExecutor } from './executor';

let loaderInstance: SkillLoader | null = null;
let registryInstance: SkillRegistry | null = null;
let executorInstance: SkillExecutor | null = null;

/**
 * 获取技能加载器实例
 */
export async function getSkillLoader(): Promise<SkillLoader> {
  if (!loaderInstance) {
    loaderInstance = new SkillLoader();
  }
  return loaderInstance;
}

/**
 * 获取技能注册表实例（自动加载所有技能）
 */
export async function getSkillRegistry(): Promise<SkillRegistry> {
  if (!registryInstance) {
    registryInstance = new SkillRegistry();

    // 加载所有技能
    const loader = await getSkillLoader();
    const skills = await loader.loadAll();

    console.log(`[SkillSystem] Loading ${skills.length} skills...`);
    skills.forEach((skill) => {
      registryInstance!.register(skill);
    });
    console.log(`[SkillSystem] Loaded skills:`, registryInstance.listAll().map((s) => s.name));
  }
  return registryInstance;
}

/**
 * 获取技能执行器实例
 */
export async function getSkillExecutor(): Promise<SkillExecutor> {
  if (!executorInstance) {
    const registry = await getSkillRegistry();
    executorInstance = new SkillExecutor(registry);
  }
  return executorInstance;
}

/**
 * 重新加载所有技能
 */
export async function reloadSkills(): Promise<void> {
  // 清空实例
  registryInstance = null;
  executorInstance = null;

  // 重新加载
  await getSkillRegistry();
}

// 导出类型
export * from './types';
export { SkillLoader } from './loader';
export { SkillRegistry } from './registry';
export { SkillExecutor } from './executor';
