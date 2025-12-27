/**
 * Minion API 客户端
 *
 * 提供多种方式调用 Minion 框架：
 * - API: HTTP REST 调用（推荐）
 * - CLI: 命令行调用（简单场景）
 * - Local: 本地 Python 子进程（开发环境）
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import type {
  MinionConfig,
  MinionMode,
  MinionSkillConfig
} from './minion-config';

const execAsync = promisify(exec);

/**
 * 调用 Minion API
 *
 * @param params - API 调用参数
 * @returns API 响应
 */
export async function callMinionAPI<T>(params: {
  endpoint: string;
  method: 'GET' | 'POST';
  body?: any;
  skillName?: string;
}): Promise<T> {
  const { loadMinionConfig, getSkillConfig } = await import('./minion-config');
  const config = await loadMinionConfig();

  // 如果指定了技能名称，检查技能是否启用
  if (params.skillName) {
    const skillConfig = await getSkillConfig(params.skillName);
    if (!skillConfig) {
      throw new Error(`Skill ${params.skillName} is not enabled or not found`);
    }
  }

  // 构建 URL
  const url = `${config.server.url}${params.endpoint}`;

  // 构建 fetch 选项
  const fetchOptions: RequestInit = {
    method: params.method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (params.body) {
    fetchOptions.body = JSON.stringify(params.body);
  }

  // 添加超时
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.server.timeout);
  fetchOptions.signal = controller.signal;

  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Minion API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if ((error as Error).name === 'AbortError') {
      throw new Error(`Minion API timeout after ${config.server.timeout}ms`);
    }

    // 注意：CLI 降级模式已移除，因为 API 和 CLI 参数格式不兼容
    // 如果需要 CLI 模式，请直接使用 callMinionCLI 函数

    throw error;
  }
}

/**
 * 调用 Minion CLI
 *
 * @param params - CLI 调用参数
 * @param config - Minion 配置（可选）
 * @returns CLI 输出
 */
export async function callMinionCLI<T>(
  params: {
    skill: string;
    inputFile?: string;
    inputData?: any;
    outputFile?: string;
    options?: Record<string, any>;
  },
  config?: MinionConfig
): Promise<T> {
  const minionCommand = config?.fallback?.command || 'minion';

  // 构建 CLI 命令
  const commandParts = [minionCommand, 'run', `--skill ${params.skill}`];

  // 添加输入文件
  if (params.inputFile) {
    commandParts.push(`--input ${params.inputFile}`);
  }

  // 添加输出文件
  if (params.outputFile) {
    commandParts.push(`--output ${params.outputFile}`);
  }

  // 添加选项
  if (params.options) {
    for (const [key, value] of Object.entries(params.options)) {
      commandParts.push(`--${key} ${value}`);
    }
  }

  const command = commandParts.join(' ');

  try {
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.error('Minion CLI stderr:', stderr);
    }

    // 尝试解析 JSON 输出
    try {
      return JSON.parse(stdout) as T;
    } catch {
      // 如果不是 JSON，返回原始输出
      return stdout as unknown as T;
    }
  } catch (error) {
    throw new Error(`Minion CLI error: ${(error as Error).message}`);
  }
}

/**
 * 验证 CSV 数据（便捷方法）
 */
export async function validateCSVData(params: {
  csvData: string;
  schema: string;
  checks?: {
    organization?: boolean;
    product?: boolean;
    valueRange?: { min: number; max: number };
    anomalies?: boolean;
  };
}) {
  return callMinionAPI({
    endpoint: '/api/validate',
    method: 'POST',
    body: {
      csvData: params.csvData,
      config: {
        schema: params.schema,
        checks: params.checks || {}
      }
    },
    skillName: 'data-validation'
  });
}

/**
 * 分析业务数据（便捷方法）
 */
export async function analyzeBusinessData(params: {
  type: string;
  data: any;
  options?: {
    detectAnomalies?: boolean;
    compareWith?: string;
    generateInsights?: boolean;
    threshold?: number;
  };
}) {
  return callMinionAPI({
    endpoint: '/api/analyze',
    method: 'POST',
    body: {
      type: params.type,
      data: params.data,
      options: params.options || {}
    },
    skillName: 'business-analysis'
  });
}

/**
 * 审查代码（便捷方法）
 */
export async function reviewCode(params: {
  files: Array<{ path: string; content: string }>;
  documents?: Array<{ path: string; content: string }>;
  checks?: {
    businessRules?: boolean;
    docConsistency?: boolean;
    docTags?: boolean;
    typeSafety?: boolean;
  };
}) {
  return callMinionAPI({
    endpoint: '/api/review',
    method: 'POST',
    body: {
      files: params.files,
      documents: params.documents || [],
      checks: params.checks || {}
    },
    skillName: 'code-review'
  });
}

/**
 * 生成测试（便捷方法）
 */
export async function generateTests(params: {
  target: {
    type: 'function' | 'module';
    name: string;
    code: string;
    documentation?: string;
  };
  framework?: 'vitest' | 'jest' | 'playwright';
  options?: {
    includeBoundaryTests?: boolean;
    includeNullTests?: boolean;
    coverage?: 'low' | 'medium' | 'high';
  };
}) {
  return callMinionAPI({
    endpoint: '/api/generate-tests',
    method: 'POST',
    body: {
      target: params.target,
      framework: params.framework || 'vitest',
      options: params.options || {}
    },
    skillName: 'test-generation'
  });
}

/**
 * 测试 Minion 连接
 */
export async function testMinionConnection(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:8000/health', {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });

    return response.ok;
  } catch {
    return false;
  }
}
