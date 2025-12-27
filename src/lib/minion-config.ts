/**
 * Minion 配置管理
 *
 * 负责加载和验证 Minion 框架的配置
 */

export enum MinionMode {
  API = 'api',      // HTTP REST API 调用
  CLI = 'cli',      // 命令行调用
  Local = 'local'   // 本地 Python 子进程
}

export interface MinionServerConfig {
  url: string;
  timeout: number;
  retryAttempts: number;
}

export interface MinionSkillConfig {
  enabled: boolean;
  endpoint: string;
  timeout: number;
}

export interface MinionConfig {
  version: string;
  mode: MinionMode;
  server: MinionServerConfig;
  skills: Record<string, MinionSkillConfig>;
  fallback?: {
    mode: MinionMode;
    command?: string;
  };
}

/**
 * 加载 Minion 配置文件
 */
export async function loadMinionConfig(): Promise<MinionConfig> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const configPath = path.join(process.cwd(), '.claude/minion.config.json');

  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent) as MinionConfig;

    // 验证配置
    validateConfig(config);

    return config;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // 配置文件不存在，返回默认配置
      console.warn('Minion config not found, using defaults');
      return getDefaultConfig();
    }

    throw new Error(`Failed to load Minion config: ${(error as Error).message}`);
  }
}

/**
 * 获取默认配置
 */
function getDefaultConfig(): MinionConfig {
  return {
    version: '1.0.0',
    mode: MinionMode.API,
    server: {
      url: 'http://localhost:8000',
      timeout: 30000,
      retryAttempts: 3
    },
    skills: {
      'data-validation': {
        enabled: true,
        endpoint: '/api/validate',
        timeout: 10000
      },
      'business-analysis': {
        enabled: true,
        endpoint: '/api/analyze',
        timeout: 30000
      },
      'code-review': {
        enabled: true,
        endpoint: '/api/review',
        timeout: 20000
      },
      'test-generation': {
        enabled: true,
        endpoint: '/api/generate-tests',
        timeout: 15000
      }
    },
    fallback: {
      mode: MinionMode.CLI,
      command: 'minion'
    }
  };
}

/**
 * 验证配置
 */
function validateConfig(config: MinionConfig): void {
  // 验证版本
  if (!config.version) {
    throw new Error('Missing required field: version');
  }

  // 验证模式
  if (!Object.values(MinionMode).includes(config.mode)) {
    throw new Error(`Invalid mode: ${config.mode}`);
  }

  // 验证服务器配置
  if (!config.server?.url) {
    throw new Error('Missing required field: server.url');
  }

  if (config.server.timeout <= 0) {
    throw new Error('Invalid timeout value');
  }

  // 验证技能配置
  for (const [skillName, skillConfig] of Object.entries(config.skills)) {
    if (!skillConfig.endpoint) {
      throw new Error(`Missing endpoint for skill: ${skillName}`);
    }

    if (skillConfig.timeout <= 0) {
      throw new Error(`Invalid timeout for skill: ${skillName}`);
    }
  }
}

/**
 * 获取技能配置
 */
export async function getSkillConfig(skillName: string): Promise<MinionSkillConfig | null> {
  const config = await loadMinionConfig();

  if (!config.skills[skillName]) {
    return null;
  }

  if (!config.skills[skillName].enabled) {
    return null;
  }

  return config.skills[skillName];
}

/**
 * 检查技能是否启用
 */
export async function isSkillEnabled(skillName: string): Promise<boolean> {
  const skillConfig = await getSkillConfig(skillName);
  return skillConfig !== null;
}
