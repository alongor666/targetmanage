#!/usr/bin/env node

/**
 * 防循环检测器
 * 防止AI建议无限循环
 */

const fs = require('fs');
const path = require('path');

class LoopDetector {
  constructor() {
    this.stateFile = path.join(__dirname, '../.trae/state/loop-detector.json');
    this.ensureStateDir();
    this.loadState();
  }
  
  ensureStateDir() {
    const dir = path.dirname(this.stateFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  loadState() {
    try {
      this.state = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
    } catch (error) {
      this.state = {
        fileCheckCounts: new Map(),
        lastCheckTimes: new Map(),
        aiGeneratedFiles: new Set(),
        globalEnabled: true
      };
    }
  }
  
  saveState() {
    fs.writeFileSync(this.stateFile, JSON.stringify({
      fileCheckCounts: Object.fromEntries(this.state.fileCheckCounts),
      lastCheckTimes: Object.fromEntries(this.state.lastCheckTimes),
      aiGeneratedFiles: Array.from(this.state.aiGeneratedFiles),
      globalEnabled: this.state.globalEnabled
    }, null, 2));
  }
  
  /**
   * 检查是否应该运行AI检查
   * @param {string} filePath - 文件路径
   * @param {Object} context - 上下文信息
   * @returns {boolean} - 是否应该检查
   */
  shouldRunAICheck(filePath, context = {}) {
    // 检查1：全局开关
    if (!this.state.globalEnabled) {
      console.log('🔴 AI检查已全局禁用');
      return false;
    }
    
    // 检查2：AI生成的文件跳过
    if (this.state.aiGeneratedFiles.has(filePath)) {
      console.log('🔴 跳过AI生成的文件:', filePath);
      return false;
    }
    
    // 检查3：文档文件跳过
    if (this.isDocFile(filePath)) {
      console.log('🔴 跳过文档文件:', filePath);
      return false;
    }
    
    // 检查4：时间窗口控制
    if (this.isInTimeWindow(filePath)) {
      console.log('🔴 时间窗口内跳过:', filePath);
      return false;
    }
    
    // 检查5：最大检查次数控制
    if (this.exceedsMaxChecks(filePath)) {
      console.log('🔴 超过最大检查次数:', filePath);
      return false;
    }
    
    // 检查6：批量操作保护
    if (context.isBatchOperation) {
      console.log('🔴 批量操作中跳过:', filePath);
      return false;
    }
    
    // 通过所有检查，记录并允许
    this.recordCheck(filePath);
    console.log('✅ 允许AI检查:', filePath);
    return true;
  }
  
  isDocFile(filePath) {
    const docPatterns = [
      /\.md$/,
      /docs\//,
      /CHANGELOG/,
      /\.txt$/,
      /\.yml$/,
      /\.yaml$/,
      /\.json$/
    ];
    
    return docPatterns.some(pattern => filePath.match(pattern));
  }
  
  isInTimeWindow(filePath) {
    const lastCheck = this.state.lastCheckTimes[filePath] || 0;
    const now = Date.now();
    const TIME_WINDOW = 5000; // 5秒
    
    return (now - lastCheck) < TIME_WINDOW;
  }
  
  exceedsMaxChecks(filePath) {
    const count = this.state.fileCheckCounts[filePath] || 0;
    const MAX_CHECKS = 3;
    
    return count >= MAX_CHECKS;
  }
  
  recordCheck(filePath) {
    this.state.fileCheckCounts[filePath] = (this.state.fileCheckCounts[filePath] || 0) + 1;
    this.state.lastCheckTimes[filePath] = Date.now();
    this.saveState();
  }
  
  markAsAIGenerated(filePath) {
    this.state.aiGeneratedFiles.add(filePath);
    this.saveState();
  }
  
  resetFile(filePath) {
    delete this.state.fileCheckCounts[filePath];
    delete this.state.lastCheckTimes[filePath];
    this.state.aiGeneratedFiles.delete(filePath);
    this.saveState();
  }
  
  enableGlobal() {
    this.state.globalEnabled = true;
    this.saveState();
    console.log('✅ AI检查已启用');
  }
  
  disableGlobal() {
    this.state.globalEnabled = false;
    this.saveState();
    console.log('🔴 AI检查已禁用');
  }
  
  resetAll() {
    this.state = {
      fileCheckCounts: new Map(),
      lastCheckTimes: new Map(),
      aiGeneratedFiles: new Set(),
      globalEnabled: true
    };
    this.saveState();
    console.log('🔄 所有检查状态已重置');
  }
  
  getStatus() {
    return {
      enabled: this.state.globalEnabled,
      filesChecked: Object.keys(this.state.fileCheckCounts).length,
      aiGeneratedFiles: this.state.aiGeneratedFiles.size
    };
  }
}

// 命令行接口
if (require.main === module) {
  const detector = new LoopDetector();
  const command = process.argv[2];
  
  switch (command) {
    case 'status':
      console.log('📊 状态:', detector.getStatus());
      break;
      
    case 'enable':
      detector.enableGlobal();
      break;
      
    case 'disable':
      detector.disableGlobal();
      break;
      
    case 'reset':
      if (process.argv[3]) {
        detector.resetFile(process.argv[3]);
        console.log('🔄 文件状态已重置:', process.argv[3]);
      } else {
        detector.resetAll();
      }
      break;
      
    case 'check':
      const filePath = process.argv[3];
      if (filePath) {
        const shouldCheck = detector.shouldRunAICheck(filePath);
        console.log(`${shouldCheck ? '✅' : '❌'} 检查结果: ${filePath}`);
      } else {
        console.log('❌ 请提供文件路径');
      }
      break;
      
    default:
      console.log(`
用法:
  node scripts/loop-detector.js status                    # 查看状态
  node scripts/loop-detector.js enable                   # 启用AI检查
  node scripts/loop-detector.js disable                  # 禁用AI检查
  node scripts/loop-detector.js check <file>             # 检查文件
  node scripts/loop-detector.js reset                    # 重置所有
  node scripts/loop-detector.js reset <file>             # 重置特定文件
      `);
  }
}

module.exports = LoopDetector;