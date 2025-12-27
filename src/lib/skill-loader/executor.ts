/**
 * Skills 执行器
 * 负责执行技能并返回结果
 */

import { SkillRegistry } from './registry';
import { Skill, SkillResult, SkillContext } from './types';

export class SkillExecutor {
  constructor(private registry: SkillRegistry) {}

  /**
   * 执行指定技能
   */
  async execute(skillName: string, context: SkillContext = {}): Promise<SkillResult> {
    const skill = this.registry.get(skillName);

    if (!skill) {
      return {
        success: false,
        error: `Unknown skill: ${skillName}`,
        availableSkills: this.registry.listAll().map((s) => ({
          name: s.name,
          description: s.description
        }))
      };
    }

    try {
      // 生成技能指令
      const prompt = this.generateSkillPrompt(skill, context);

      // 执行技能逻辑
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

  /**
   * 生成技能提示词
   */
  private generateSkillPrompt(skill: Skill, context: SkillContext): string {
    const contextStr = Object.keys(context).length > 0
      ? `\n\n## Current Context\n\`\`\`json\n${JSON.stringify(context, null, 2)}\n\`\`\``
      : '';

    return `
Loading skill: ${skill.name}
Version: ${skill.version || '1.0.0'}
Description: ${skill.description}
License: ${skill.license || 'MIT'}

## Skill Instructions
${skill.content}
${contextStr}
    `.trim();
  }

  /**
   * 运行技能逻辑
   */
  private async runSkillLogic(skill: Skill, prompt: string, context: SkillContext): Promise<any> {
    // 根据技能名称执行不同的逻辑
    switch (skill.name) {
      case 'data-import':
        return await this.executeDataImport(context);
      case 'kpi-calculation':
        return await this.executeKPICalculation(context);
      case 'chart-visualization':
        return await this.executeChartVisualization(context);
      default:
        // 默认：返回技能指令供 AI 使用
        return { instructions: prompt };
    }
  }

  /**
   * 执行数据导入逻辑
   */
  private async executeDataImport(context: SkillContext): Promise<any> {
    // 动态导入相关模块
    const { parseMonthlyCsv } = await import('@/services/loaders');

    const csvText = context.csvText;
    if (!csvText) {
      throw new Error('Missing csvText in context');
    }

    // 解析 CSV
    const data = parseMonthlyCsv(csvText);

    return {
      type: 'data-import',
      imported: data.length,
      records: data
    };
  }

  /**
   * 执行 KPI 计算逻辑
   */
  private async executeKPICalculation(context: SkillContext): Promise<any> {
    const { calculateGrowthMetrics } = await import('@/domain/growth');

    const current = context.current;
    const baseline = context.baseline;

    if (!current || !baseline) {
      throw new Error('Missing current or baseline in context');
    }

    // 计算增长指标
    const metrics = calculateGrowthMetrics(current, baseline);

    return {
      type: 'kpi-calculation',
      metrics
    };
  }

  /**
   * 执行图表可视化逻辑
   */
  private async executeChartVisualization(context: SkillContext): Promise<any> {
    // 这里可以调用 ECharts 工具函数
    // 例如：src/lib/echarts-utils.ts

    const chartType = context.chartType || 'bar';
    const data = context.data;

    if (!data) {
      throw new Error('Missing data in context');
    }

    return {
      type: 'chart-visualization',
      chartType,
      data,
      config: 'ECharts configuration would be generated here'
    };
  }
}
