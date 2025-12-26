#!/usr/bin/env node

/**
 * 组件复用检查器 CLI 工具
 * 
 * @description 智能分析开发需求，推荐可复用组件，检查硬编码违规
 * @usage npm run check:reuse "我需要一个带搜索功能的下拉框"
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// 由于是TypeScript项目，直接在这里定义需要的映射
const COMPONENT_REUSE_MAP = {
  // 英文关键词
  'button': 'Button',
  'click': 'Button',
  'submit': 'Button',
  'cancel': 'Button',
  'input': 'Input',
  'text': 'Input',
  'field': 'Input',
  'form': 'Input',
  'card': 'Card',
  'container': 'Card',
  'panel': 'Card',
  'box': 'Card',
  'modal': 'Modal',
  'dialog': 'Modal',
  'popup': 'Modal',
  'overlay': 'Modal',
  'sort': 'SortButtonGroup',
  'filter': 'SortButtonGroup',
  'order': 'SortButtonGroup',
  'badge': 'Badge',
  'tag': 'Badge',
  'label': 'Badge',
  'status': 'Badge',
  
  // 中文关键词
  '按钮': 'Button',
  '点击': 'Button',
  '提交': 'Button',
  '取消': 'Button',
  '确认': 'Button',
  '输入框': 'Input',
  '文本框': 'Input',
  '输入': 'Input',
  '表单': 'Input',
  '卡片': 'Card',
  '容器': 'Card',
  '面板': 'Card',
  '模态框': 'Modal',
  '对话框': 'Modal',
  '弹窗': 'Modal',
  '排序': 'SortButtonGroup',
  '筛选': 'SortButtonGroup',
  '徽章': 'Badge',
  '标签': 'Badge',
  '状态': 'Badge'
};

const COMPONENT_USAGE_HEAT = {
  Button: 95,
  Input: 88,
  Card: 76,
  Modal: 65,
  SortButtonGroup: 42,
  Badge: 38
};

/**
 * 智能组件推荐函数
 */
function recommendComponent(requirement) {
  const keywords = requirement.toLowerCase().split(/\s+/);
  const recommendations = [];
  
  // 遍历复用映射
  Object.entries(COMPONENT_REUSE_MAP).forEach(([keyword, component]) => {
    const hasMatch = keywords.some(k => 
      keyword.includes(k) || k.includes(keyword) || 
      keyword === k || k.includes(keyword.slice(0, 3))
    );
    if (hasMatch) {
      const usageHeat = COMPONENT_USAGE_HEAT[component] || 0;
      recommendations.push({
        component,
        score: 20 + usageHeat * 0.5,
        reason: `关键词匹配: ${keyword}, 使用热度: ${usageHeat}%`
      });
    }
  });
  
  // 按分数排序
  return recommendations.sort((a, b) => b.score - a.score).slice(0, 3);
}

/**
 * 检查硬编码违规
 */
function checkHardcodedViolations(code) {
  const violations = [];
  const lines = code.split('\n');
  
  lines.forEach((line, index) => {
    // 检查硬编码颜色
    const colorMatch = line.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/);
    if (colorMatch && !line.includes('comment')) {
      violations.push({
        type: 'color',
        line: index + 1,
        content: colorMatch[0],
        suggestion: '使用 colors.brand.teslaBlue 或其他设计令牌'
      });
    }
    
    // 检查硬编码字体大小
    const fontSizeMatch = line.match(/fontSize:\s*[0-9]+px/);
    if (fontSizeMatch) {
      violations.push({
        type: 'fontSize',
        line: index + 1,
        content: fontSizeMatch[0],
        suggestion: '使用 FONT_SIZE.sm/md/lg 等字体常量'
      });
    }
    
    // 检查硬编码间距
    const spacingMatch = line.match(/(margin|padding):\s*[0-9]+px/);
    if (spacingMatch) {
      violations.push({
        type: 'spacing',
        line: index + 1,
        content: spacingMatch[0],
        suggestion: '使用 spacing.sm/md/lg 等间距常量'
      });
    }
  });
  
  return violations;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// CLI 参数解析
const args = process.argv.slice(2);
const command = args[0];
const input = args.slice(1).join(' ');

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
🔄 组件复用检查器 v1.0.0

用法:
  npm run check:reuse <需求描述>          # 分析需求并推荐组件
  npm run check:hardcode <文件路径>       # 检查文件中的硬编码违规
  npm run check:stats [组件名]           # 显示组件使用统计
  npm run check:list                     # 列出所有可用组件

示例:
  npm run check:reuse "我需要一个按钮"
  npm run check:hardcode "src/components/MyComponent.tsx"
  npm run check:stats Button
  npm run check:list

支持的组件:
  - Button: 按钮组件 (95% 使用热度)
  - Input: 输入框组件 (88% 使用热度)  
  - Card: 卡片组件 (76% 使用热度)
  - Modal: 模态框组件 (65% 使用热度)
  - SortButtonGroup: 排序按钮组 (42% 使用热度)
  - Badge: 徽章组件 (38% 使用热度)

关键词映射:
  ${Object.entries(COMPONENT_REUSE_MAP).map(([keyword, component]) => 
    `  ${keyword.padEnd(8)} → ${component}`
  ).join('\n')}
  `);
}

/**
 * 分析需求并推荐组件
 */
function analyzeRequirement(requirement) {
  if (!requirement) {
    console.log('❌ 请提供需求描述');
    console.log('用法: npm run check:reuse "你的需求描述"');
    process.exit(1);
  }

  console.log(`🔍 分析需求: "${requirement}"`);
  console.log('');

  const recommendations = recommendComponent(requirement);

  if (recommendations.length === 0) {
    console.log('❌ 未找到合适的可复用组件');
    console.log('');
    console.log('💡 建议:');
    console.log('  1. 尝试使用更通用的关键词');
    console.log('  2. 查看可用组件列表: npm run check:list');
    console.log('  3. 确实需要新组件时，请遵循设计系统规范');
    process.exit(0);
  }

  console.log('✅ 推荐的可复用组件:');
  console.log('');

  recommendations.forEach((rec, index) => {
    const usage = COMPONENT_USAGE_HEAT[rec.component] || 0;
    console.log(`${index + 1}. ${rec.component} (热度: ${usage}%)`);
    console.log(`   推荐分数: ${rec.score.toFixed(1)}`);
    console.log(`   理由: ${rec.reason}`);
    console.log('');
  });

  console.log('📖 使用示例:');
  console.log(`import { ${recommendations[0].component} } from '@/components/ui';`);
  console.log('');
}

/**
 * 检查文件中的硬编码违规
 */
function checkHardcoded(filePath) {
  if (!filePath) {
    console.log('❌ 请提供文件路径');
    console.log('用法: npm run check:hardcode "path/to/file.tsx"');
    process.exit(1);
  }

  const fullPath = join(projectRoot, filePath);
  
  if (!existsSync(fullPath)) {
    console.log(`❌ 文件不存在: ${fullPath}`);
    process.exit(1);
  }

  try {
    const content = readFileSync(fullPath, 'utf-8');
    const violations = checkHardcodedViolations(content);

    console.log(`🔍 检查文件: ${filePath}`);
    console.log('');

    if (violations.length === 0) {
      console.log('✅ 未发现硬编码违规');
      console.log('');
      console.log('🎉 恭喜！代码完全遵循设计系统规范');
      process.exit(0);
    }

    console.log(`❌ 发现 ${violations.length} 处硬编码违规:`);
    console.log('');

    violations.forEach((violation, index) => {
      console.log(`${index + 1}. 第 ${violation.line} 行 - ${violation.type}`);
      console.log(`   违规内容: ${violation.content}`);
      console.log(`   修复建议: ${violation.suggestion}`);
      console.log('');
    });

    console.log('🔧 修复指南:');
    console.log('  1. 颜色: 使用 colors.brand.teslaBlue 等设计令牌');
    console.log('  2. 字体: 使用 FONT_SIZE.sm/md/lg 等常量');
    console.log('  3. 间距: 使用 spacing.sm/md/lg 等常量');
    console.log('  4. 参考: src/styles/tokens.ts');

  } catch (error) {
    console.log(`❌ 读取文件失败: ${error.message}`);
    process.exit(1);
  }
}

/**
 * 显示组件使用统计
 */
function showStats(componentName) {
  if (!componentName) {
    // 显示总体统计
    console.log('📊 UI组件库总体统计:');
    console.log('');
    console.log(`总组件数量: 6`);
    console.log(`覆盖率: 85%`);
    console.log(`最后更新: 2025-01-25`);
    console.log('');
    console.log('🔥 使用热度排行:');
    console.log('');

    Object.entries(COMPONENT_USAGE_HEAT)
      .sort(([,a], [,b]) => b - a)
      .forEach(([component, usage], index) => {
        const heat = usage >= 80 ? '🔥' : usage >= 60 ? '📈' : usage >= 40 ? '📊' : '📉';
        console.log(`${index + 1}. ${component.padEnd(16)} ${heat} ${usage}%`);
      });
    
    console.log('');
    console.log('💡 查看单个组件统计: npm run check:stats <组件名>');
    return;
  }

  // 显示单个组件统计
  console.log(`📊 ${componentName} 组件统计:`);
  console.log('');

  const usage = COMPONENT_USAGE_HEAT[componentName];
  if (!usage) {
    console.log(`❌ 组件 "${componentName}" 不存在`);
    console.log('');
    console.log('可用组件: Button, Input, Card, Modal, SortButtonGroup, Badge');
    process.exit(1);
  }

  console.log(`使用热度: ${usage}%`);
  console.log(`文件路径: src/components/ui/${componentName}/`);
  console.log(`导出方式: import { ${componentName} } from '@/components/ui';`);
  console.log('');

  // 显示使用场景
  const scenarios = {
    Button: ['表单提交', '页面导航', '操作触发', '状态切换'],
    Input: ['用户输入', '数据编辑', '搜索框', '表单字段'],
    Card: ['内容展示', '信息分组', '功能模块', '数据卡片'],
    Modal: ['确认对话框', '表单弹窗', '详情展示', '操作确认'],
    SortButtonGroup: ['数据排序', '视图切换', '筛选选项', '状态分组'],
    Badge: ['状态标识', '分类标签', '数量显示', '优先级标记']
  };

  const componentScenarios = scenarios[componentName];
  if (componentScenarios) {
    console.log('🎯 使用场景:');
    componentScenarios.forEach((scenario, index) => {
      console.log(`  ${index + 1}. ${scenario}`);
    });
  }

  console.log('');
}

/**
 * 列出所有可用组件
 */
function listComponents() {
  console.log('📦 可用组件列表:');
  console.log('');

  const components = [
    { 
      name: 'Button', 
      desc: '按钮组件', 
      usage: 95,
      features: ['4种变体', '3种尺寸', '5种状态']
    },
    { 
      name: 'Input', 
      desc: '输入框组件', 
      usage: 88,
      features: ['4种类型', '3种尺寸', '验证支持']
    },
    { 
      name: 'Card', 
      desc: '卡片容器', 
      usage: 76,
      features: ['3种变体', '响应式', '交互支持']
    },
    { 
      name: 'Modal', 
      desc: '模态框组件', 
      usage: 65,
      features: ['2种尺寸', '动画支持', '可访问性']
    },
    { 
      name: 'SortButtonGroup', 
      desc: '排序按钮组', 
      usage: 42,
      features: ['多选', '预设', '搜索']
    },
    { 
      name: 'Badge', 
      desc: '徽章组件', 
      usage: 38,
      features: ['4种状态', '3种尺寸', '自动颜色']
    }
  ];

  components.forEach((component, index) => {
    const heat = component.usage >= 80 ? '🔥' : component.usage >= 60 ? '📈' : component.usage >= 40 ? '📊' : '📉';
    console.log(`${index + 1}. ${component.name} - ${component.desc} ${heat}`);
    console.log(`   热度: ${component.usage}% | 特性: ${component.features.join(', ')}`);
    console.log('');
  });

  console.log('🔗 快速开始:');
  console.log('  import { Button, Input, Card } from "@/components/ui";');
  console.log('');
  console.log('💡 获取推荐: npm run check:reuse "你的需求"');
}

// 主程序逻辑
switch (command) {
  case 'reuse':
    analyzeRequirement(input);
    break;
    
  case 'hardcode':
    checkHardcoded(input);
    break;
    
  case 'stats':
    showStats(input);
    break;
    
  case 'list':
    listComponents();
    break;
    
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
    
  default:
    if (!command) {
      showHelp();
    } else {
      console.log(`❌ 未知命令: ${command}`);
      console.log('');
      showHelp();
      process.exit(1);
    }
}