/**
 * Design Tokens V2 - 基于UI重构设计方案
 *
 * 完全遵循 UI重构设计方案.md 中定义的设计规范
 * 用于重构后的页面组件
 *
 * @version 2.0.0
 * @date 2025-12-27
 */

// ==================== 色彩系统 ====================

export const colorsV2 = {
  // 主色系
  primary: {
    blue: '#007BFF',           // 主蓝色 - 激活状态、主要按钮、图表主色
    blueLight: '#E6F0FF',      // 浅蓝背景
  },

  // 状态色
  status: {
    success: '#28A745',        // 成功绿 - 达成率、正向增长
    warning: '#FFC107',        // 警告黄 - 风险提示、中等进度
    danger: '#DC3545',         // 危险红 - 负向增长、未达标
  },

  // 背景色系
  background: {
    primary: '#F8FAFC',        // 主背景
    card: '#FFFFFF',           // 卡片背景
    separator: '#E9ECEF',      // 分隔线
    hover: '#F8FAFC',          // 悬停/交互
  },

  // 文字色系
  text: {
    primary: '#343A40',        // 主标题/高亮
    secondary: '#6C757D',      // 副标题/标签
    tertiary: '#ADB5BD',       // 辅助文字
  },

  // 状态色块（半透明背景 + 对应文字色）
  statusBlock: {
    success: {
      bg: 'rgba(38, 186, 104, 0.1)',
      text: '#26BA68',
    },
    warning: {
      bg: 'rgba(255, 193, 7, 0.1)',
      text: '#FFC107',
    },
    danger: {
      bg: 'rgba(220, 53, 69, 0.1)',
      text: '#DC3545',
    },
    info: {
      bg: 'rgba(54, 144, 204, 0.1)',
      text: '#368DCC',
    },
  },

  // 图表专用色
  chart: {
    // 柱状图
    target2026: '#007BFF',     // 2026规划 - 主蓝色
    actual2025: '#6C757D',     // 2025实际 - 灰色

    // 折线图
    mainLine: '#368DCC',       // 主线 - 亮蓝色
    dashLine: '#F7B500',       // 辅线 - 橙色虚线
  },
} as const;

// ==================== 布局系统 ====================

export const layoutV2 = {
  // 导航栏
  navbar: {
    height: 64,                // 顶部导航栏高度 (px)
  },

  // 侧边栏
  sidebar: {
    width: 240,                // 固定侧边栏宽度 (px)
  },

  // 网格系统
  grid: {
    columns: 4,                // 4列响应式网格
    gap: 20,                   // 网格列间距 (px)
  },

  // 间距系统
  spacing: {
    cardPadding: 24,           // 卡片内边距 (px)
    moduleGap: 28,             // 模块间垂直间距 (px)
    gridGap: 20,               // 网格列间距 (px)
    elementSmall: 8,           // 元素间小间距 (px)
    elementMedium: 16,         // 元素间中间距 (px)
  },
} as const;

// ==================== 字体系统 ====================

export const typographyV2 = {
  fontSize: {
    h1: 24,                    // 页面标题 (px)
    h2: 18,                    // 模块标题 (px)
    h3: 16,                    // 子标题 (px)
    body: 14,                  // 正文 (px)
    small: 12,                 // 小字/百分比 (px)
    kpi: 36,                   // 大数（KPI） (px)
  },

  fontWeight: {
    regular: 400,              // 正常
    medium: 500,               // 中等
    semibold: 600,             // 半粗
    bold: 700,                 // 粗体
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
} as const;

// ==================== 圆角系统 ====================

export const radiusV2 = {
  card: 8,                     // 卡片圆角 (px)
  button: 4,                   // 按钮圆角 (px)
  input: 4,                    // 输入框圆角 (px)
  badge: 12,                   // 状态标签圆角 (px)
} as const;

// ==================== 阴影系统 ====================

export const shadowsV2 = {
  card: '0 2px 4px rgba(0, 0, 0, 0.05)',           // 卡片默认阴影
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.08)',     // 卡片悬停阴影
} as const;

// ==================== 组件规范 ====================

/**
 * 顶部导航栏规范
 */
export const navbarV2 = {
  height: 64,                  // 高度 (px)
  background: '#FFFFFF',       // 背景色
  paddingX: 24,                // 左右边距 (px)

  link: {
    normal: '#6C757D',         // 普通状态
    active: '#007BFF',         // 激活状态
    fontWeight: 600,           // 激活时字重
    height: 32,                // 链接高度 (px)
  },
} as const;

/**
 * 筛选控制区规范
 */
export const filterV2 = {
  background: '#F8FAFC',       // 背景色
  padding: 16,                 // 内边距 (px)

  dropdown: {
    background: '#F8FAFC',     // 背景色
    border: '1px solid #E9ECEF', // 边框
    borderRadius: 4,           // 圆角 (px)
    height: 36,                // 高度 (px)
    fontSize: 14,              // 字号 (px)
    color: '#6C757D',          // 文字颜色
    arrowSize: 12,             // 下拉箭头尺寸 (px)
  },

  tag: {
    background: '#E9ECEF',     // 背景色
    borderRadius: 4,           // 圆角 (px)
    paddingX: 12,              // 左右内边距 (px)
    paddingY: 8,               // 上下内边距 (px)
  },
} as const;

/**
 * KPI卡片规范（4列网格）
 */
export const kpiCardV2 = {
  background: '#FFFFFF',       // 背景色
  borderRadius: 8,             // 圆角 (px)
  padding: 24,                 // 内边距 (px)
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', // 阴影

  icon: {
    size: 24,                  // 图标尺寸 (px)
  },

  title: {
    fontSize: 14,              // 字号 (px)
    fontWeight: 500,           // 字重
    color: '#6C757D',          // 颜色
    marginBottom: 8,           // 下边距 (px)
  },

  value: {
    fontSize: 36,              // 大数字号 (px)
    fontWeight: 700,           // 字重
    color: '#343A40',          // 颜色
    marginBottom: 8,           // 下边距 (px)
  },

  progressBar: {
    height: 4,                 // 进度条高度 (px)
    borderRadius: 2,           // 圆角 (px)
    background: '#E9ECEF',     // 背景色
  },
} as const;

/**
 * 图表组件规范
 */
export const chartV2 = {
  background: '#FFFFFF',       // 背景色
  borderRadius: 8,             // 圆角 (px)
  padding: 24,                 // 内边距 (px)

  axis: {
    labelSize: 12,             // 标签字号 (px)
    labelColor: '#ADB5BD',     // 标签颜色
    lineColor: '#E9ECEF',      // 线条颜色
    lineWidth: 1,              // 线条粗细 (px)
  },

  bar: {
    target2026: '#007BFF',     // 2026规划柱
    actual2025: '#6C757D',     // 2025实际柱
  },

  line: {
    main: '#368DCC',           // 主线 - 亮蓝色
    secondary: '#F7B500',      // 辅线 - 橙色虚线
  },
} as const;

/**
 * 数据表格规范
 */
export const tableV2 = {
  header: {
    background: '#F8FAFC',     // 表头背景
    fontSize: 14,              // 字号 (px)
    fontWeight: 600,           // 字重
    color: '#343A40',          // 颜色
  },

  row: {
    backgroundDefault: '#FFFFFF',        // 默认行背景
    backgroundAlternate: '#F8FAFC',      // 交替行背景
    borderBottom: '1px solid #E9ECEF',   // 底边框
    hoverBackground: '#F8FAFC',          // 悬停背景
  },

  badge: {
    borderRadius: 12,          // 状态标签圆角 (px)
    paddingX: 8,               // 左右内边距 (px)
    paddingY: 4,               // 上下内边距 (px)
  },
} as const;

// ==================== 交互状态规范 ====================

/**
 * 按钮状态
 */
export const buttonStatesV2 = {
  default: {
    background: '#007BFF',
    border: '#007BFF',
  },

  hover: {
    background: '#0056b3',     // 背景色加深10%
    border: '#0056b3',
  },

  active: {
    background: '#0069D9',     // 激活背景
    border: '#0069D9',
  },

  disabled: {
    background: '#E9ECEF',     // 禁用背景
    color: '#6C757D',          // 禁用文字
  },
} as const;

/**
 * 下拉框状态
 */
export const dropdownStatesV2 = {
  default: {
    background: '#F8FAFC',
    border: '#E9ECEF',
  },

  focus: {
    border: '#007BFF',
    boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.08)',
  },

  expanded: {
    menuBackground: '#FFFFFF',
    menuBorder: '#E9ECEF',
  },
} as const;

/**
 * 卡片状态
 */
export const cardStatesV2 = {
  default: {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },

  hover: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
} as const;

// ==================== 动效规范 ====================

export const animationsV2 = {
  // 页面加载
  pageLoad: {
    cardSlideUp: {
      duration: 300,           // 毫秒
      easing: 'ease-out',
    },
    chartDataFill: {
      duration: 500,           // 毫秒
      easing: 'ease-out',
    },
  },

  // 交互反馈
  interaction: {
    buttonClick: {
      scale: 0.98,
      duration: 150,           // 毫秒
    },
    dropdownExpand: {
      duration: 200,           // 毫秒
      easing: 'ease-in-out',
    },
    tableSortArrow: {
      duration: 200,           // 毫秒
      easing: 'ease-in-out',
    },
  },
} as const;

// ==================== 响应式断点 ====================

export const breakpointsV2 = {
  mobile: 768,                 // <768px: 移动端
  tablet: 1024,                // 768-1023px: 平板端
  desktop: 1024,               // ≥1024px: 桌面端
} as const;

/**
 * 响应式布局规范
 */
export const responsiveLayoutV2 = {
  // 桌面端 (≥1024px)
  desktop: {
    kpiColumns: 4,             // KPI卡片4列
    chartColumns: 2,           // 图表区域2列
    tableDisplay: 'full',      // 完整表格
  },

  // 平板端 (768-1023px)
  tablet: {
    kpiColumns: 2,             // KPI卡片2列
    chartColumns: 1,           // 图表区域1列
    tableScroll: true,         // 表格横向滚动
  },

  // 移动端 (<768px)
  mobile: {
    kpiColumns: 1,             // KPI卡片1列
    chartColumns: 1,           // 图表区域1列
    tableSimplified: true,     // 简化表格
  },
} as const;

// ==================== 类型导出 ====================

export type ColorsV2 = typeof colorsV2;
export type LayoutV2 = typeof layoutV2;
export type TypographyV2 = typeof typographyV2;
export type RadiusV2 = typeof radiusV2;
export type ShadowsV2 = typeof shadowsV2;
export type NavbarV2 = typeof navbarV2;
export type FilterV2 = typeof filterV2;
export type KpiCardV2 = typeof kpiCardV2;
export type ChartV2 = typeof chartV2;
export type TableV2 = typeof tableV2;
export type ButtonStatesV2 = typeof buttonStatesV2;
export type DropdownStatesV2 = typeof dropdownStatesV2;
export type CardStatesV2 = typeof cardStatesV2;
export type AnimationsV2 = typeof animationsV2;
export type BreakpointsV2 = typeof breakpointsV2;
export type ResponsiveLayoutV2 = typeof responsiveLayoutV2;

// ==================== 工具函数 ====================

/**
 * 获取状态颜色
 * @param status 状态类型
 * @returns 状态颜色
 */
export function getStatusColor(status: 'success' | 'warning' | 'danger'): string {
  return colorsV2.status[status];
}

/**
 * 获取状态色块配置
 * @param status 状态类型
 * @returns {bg, text} 背景色和文字色
 */
export function getStatusBlockColors(status: 'success' | 'warning' | 'danger' | 'info'): {
  bg: string;
  text: string;
} {
  return colorsV2.statusBlock[status];
}

/**
 * 生成响应式类名
 * @param base 基础类名
 * @returns 完整的响应式类名字符串
 */
export function generateResponsiveClass(base: string): string {
  return `${base} md:${base}-tablet lg:${base}-desktop`;
}
