/**
 * 组织模式配置
 *
 * 定义5种组织模式：分公司、同城、异地、单机构、多机构
 * 用于控制数据筛选和标题生成逻辑
 */

export type OrganizationMode = 'branch' | 'local' | 'remote' | 'single' | 'multi';

export interface OrganizationModeConfig {
  /** 模式名称 */
  name: string;

  /** 标题前缀（字符串或函数） */
  titlePrefix: string | ((org: string) => string);

  /** 模式描述 */
  description: string;

  /** 该模式包含的机构列表（可选） */
  orgs?: string[];

  /** 是否需要用户选择机构 */
  requiresUserSelection?: boolean;

  /** 是否为派生模式（根据用户选择自动判断） */
  isDerived?: boolean;
}

/**
 * 组织模式定义
 */
export const organizationModes: Record<OrganizationMode, OrganizationModeConfig> = {
  /** 分公司模式：显示所有三级机构 */
  branch: {
    name: '分公司',
    titlePrefix: '四川分公司',
    description: '显示所有三级机构数据',
  },

  /** 同城模式：仅显示同城7个机构 */
  local: {
    name: '同城',
    titlePrefix: '四川同城机构',
    description: '仅显示同城机构数据',
    orgs: ['本部', '天府', '高新', '新都', '青羊', '武侯', '西财俊苑'],
  },

  /** 异地模式：仅显示异地7个机构 */
  remote: {
    name: '异地',
    titlePrefix: '四川异地机构',
    description: '仅显示异地机构数据',
    orgs: ['宜宾', '泸州', '德阳', '资阳', '乐山', '自贡', '达州'],
  },

  /** 单机构模式：仅显示单个机构 */
  single: {
    name: '单机构',
    titlePrefix: (org: string) => `${org}机构`,
    description: '仅显示单个机构数据',
    requiresUserSelection: true,
  },

  /** 多机构模式：用户自定义多机构选择 */
  multi: {
    name: '多机构',
    titlePrefix: '四川多机构',
    description: '用户自定义多机构选择',
    isDerived: true,
  },
};

/**
 * 检测组织模式结果
 */
export interface DetectedModeResult {
  /** 检测到的模式 */
  mode: OrganizationMode;

  /** 模式配置 */
  config: OrganizationModeConfig;

  /** 当前机构（单机构模式时） */
  currentOrg?: string;
}

/**
 * 根据选中的机构列表检测组织模式
 *
 * @param selectedOrgs - 用户选择的机构列表
 * @param allOrgs - 所有可用机构列表
 * @returns 检测到的模式及配置
 *
 * @example
 * ```ts
 * const result = detectOrganizationMode(['本部', '天府', '高新', '新都', '青羊', '武侯', '西财俊苑'], allOrgs);
 * console.log(result.mode); // 'local'
 * console.log(result.config.name); // '同城'
 * ```
 */
export function detectOrganizationMode(
  selectedOrgs: string[],
  allOrgs: string[]
): DetectedModeResult {
  const selectionCount = selectedOrgs.length;
  const totalCount = allOrgs.length;

  // 单机构模式
  if (selectionCount === 1) {
    return {
      mode: 'single',
      config: organizationModes.single,
      currentOrg: selectedOrgs[0],
    };
  }

  // 同城模式检查
  const localOrgs = organizationModes.local.orgs!;
  const isLocalMode =
    selectionCount === localOrgs.length &&
    selectedOrgs.every((org) => localOrgs.includes(org));

  if (isLocalMode) {
    return {
      mode: 'local',
      config: organizationModes.local,
    };
  }

  // 异地模式检查
  const remoteOrgs = organizationModes.remote.orgs!;
  const isRemoteMode =
    selectionCount === remoteOrgs.length &&
    selectedOrgs.every((org) => remoteOrgs.includes(org));

  if (isRemoteMode) {
    return {
      mode: 'remote',
      config: organizationModes.remote,
    };
  }

  // 分公司模式（全部选择）
  if (selectionCount === totalCount) {
    return {
      mode: 'branch',
      config: organizationModes.branch,
    };
  }

  // 多机构模式（其他自定义选择）
  return {
    mode: 'multi',
    config: organizationModes.multi,
  };
}

/**
 * 页面标题生成上下文
 */
export interface PageTitleContext {
  /** 周次（如 "50"） */
  week: string;

  /** 年份（如 "2025"） */
  year: string;

  /** 当前机构（单机构模式时使用） */
  currentOrg?: string;

  /** 公司名称（默认 "四川"） */
  company?: string;
}

/**
 * 根据组织模式和上下文生成页面标题
 *
 * @param mode - 组织模式
 * @param context - 上下文信息（周次、年份等）
 * @returns 生成的页面标题
 *
 * @example
 * ```ts
 * const title = generatePageTitle('local', { week: '50', year: '2025' });
 * // 结果: "四川同城机构车险第50周经营分析"
 * ```
 *
 * @example
 * ```ts
 * const title = generatePageTitle('single', {
 *   week: '50',
 *   year: '2025',
 *   currentOrg: '天府'
 * });
 * // 结果: "天府机构车险第50周经营分析"
 * ```
 */
export function generatePageTitle(
  mode: OrganizationMode,
  context: PageTitleContext
): string {
  const config = organizationModes[mode];
  const { week, currentOrg } = context;

  // 获取标题前缀
  const prefix =
    typeof config.titlePrefix === 'function'
      ? config.titlePrefix(currentOrg!)
      : config.titlePrefix;

  return `${prefix}车险第${week}周经营分析`;
}
