#!/usr/bin/env node

/**
 * 文档同步检查脚本
 * 检测代码变更并提醒更新相关文档
 */

const fs = require('fs');
const path = require('path');

// 影响映射规则
const impactMapping = {
  'src/domain/allocation.ts': [
    'docs/business/指标定义规范.md',
    'CHANGELOG_HQ_TARGET.md'
  ],
  'src/domain/time.ts': [
    'docs/business/指标定义规范.md'
  ],
  'src/domain/headquarters.ts': [
    'docs/business/指标定义规范.md'
  ],
  'src/app/page.tsx': [
    'docs/architecture/系统架构设计.md'
  ]
};

// 检查文件是否被修改
function checkFileModified(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const modifiedTime = stats.mtime;
    const now = new Date();
    const hoursSinceModified = (now - modifiedTime) / (1000 * 60 * 60);
    return hoursSinceModified < 1; // 最近1小时内修改
  } catch (error) {
    return false;
  }
}

// 生成文档更新建议
function generateUpdateSuggestions(modifiedFiles) {
  const suggestions = [];
  const affectedDocs = new Set();
  
  modifiedFiles.forEach(file => {
    if (impactMapping[file]) {
      affectedDocs.add(...impactMapping[file]);
    }
  });
  
  return Array.from(affectedDocs);
}

// 主函数
function main() {
  console.log('🔍 检查文档同步状态...\n');
  
  const modifiedFiles = Object.keys(impactMapping).filter(checkFileModified);
  
  if (modifiedFiles.length === 0) {
    console.log('✅ 没有检测到需要更新文档的代码变更');
    return;
  }
  
  console.log('⚠️  检测到以下代码文件变更：');
  modifiedFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
  
  const suggestedDocs = generateUpdateSuggestions(modifiedFiles);
  
  if (suggestedDocs.length > 0) {
    console.log('\n📝 建议更新以下文档：');
    suggestedDocs.forEach(doc => {
      console.log(`   - ${doc}`);
    });
    
    console.log('\n📋 快速更新模板：');
    console.log('```markdown');
    console.log('## 本次变更');
    console.log('- 代码修改：', modifiedFiles.join(', '));
    console.log('- 文档更新：', suggestedDocs.join(', '));
    console.log('- 影响分析：业务逻辑变更，需要更新相关文档');
    console.log('- 验证方式：功能测试通过');
    console.log('```');
  }
}

// 运行检查
main();