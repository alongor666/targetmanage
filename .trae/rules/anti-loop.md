# 防循环机制规则

## 🔄 循环检测原则

### 状态标识系统
AI在每次操作前必须检查当前状态，防止重复触发：

```typescript
// 全局状态检查
const currentState = {
  isAIGenerated: boolean,        // 是否为AI生成的内容
  lastAction: string,            // 最后执行的动作
  actionSource: 'human' | 'ai', // 动作来源
  isBatchOperation: boolean      // 是否为批量操作
};
```

### 防循环检查清单

#### 🚨 检查1：动作来源识别
```typescript
// 如果当前变更是由AI触发的，则不再次触发AI检查
if (currentState.actionSource === 'ai') {
  console.log('AI触发的变更，跳过AI检查');
  return;
}
```

#### 🚨 检查2：文件类型区分
```typescript
// 文档文件变更不触发业务逻辑检查
const DOC_PATTERNS = [
  /\.md$/,
  /docs\//,
  /CHANGELOG/,
  /\.txt$/
];

if (isDocFile(modifiedFile)) {
  console.log('文档文件变更，不触发AI检查');
  return;
}
```

#### 🚨 检查3：时间窗口控制
```typescript
// 同一文件在短时间内只检查一次
const lastCheckTime = getLastCheckTime(filePath);
const now = Date.now();
const TIME_WINDOW = 5000; // 5秒窗口

if (now - lastCheckTime < TIME_WINDOW) {
  console.log('时间窗口内，跳过检查');
  return;
}
```

#### 🚨 检查4：批量操作保护
```typescript
// 批量操作时只在开始时检查一次
if (currentState.isBatchOperation) {
  console.log('批量操作中，跳过AI检查');
  return;
}
```

## 🎯 具体防循环策略

### 策略1：白名单机制
```typescript
// 只对特定文件类型和路径触发AI检查
const AI_CHECK_WHITELIST = [
  'src/domain/*.ts',
  'src/app/page.tsx',
  'public/data/*.json'
];

function shouldTriggerAICheck(filePath) {
  return AI_CHECK_WHITELIST.some(pattern => 
    filePath.match(pattern.replace('*', '.*'))
  );
}
```

### 策略2：变更深度控制
```typescript
// 控制AI建议的递归深度
let aiSuggestionDepth = 0;
const MAX_DEPTH = 3;

function suggestUpdate(suggestion) {
  if (aiSuggestionDepth >= MAX_DEPTH) {
    console.log('AI建议深度已达上限，停止递归');
    return;
  }
  
  aiSuggestionDepth++;
  // ... 执行建议
  aiSuggestionDepth--;
}
```

### 策略3：确认机制
```typescript
// AI建议必须经人类确认才能执行
function requestConfirmation(suggestion) {
  const confirmation = await askUser(
    `AI建议：${suggestion}\n是否执行？(y/n/q)`
  );
  
  switch(confirmation) {
    case 'y': return executeSuggestion(suggestion);
    case 'n': return skipSuggestion();
    case 'q': return stopAllSuggestions(); // 终止所有建议
  }
}
```

## 🛠️ 实现机制

### 1. 状态文件
```json
// .trae/state/last-check.json
{
  "lastCheckTime": 1703318400000,
  "lastCheckedFiles": [],
  "isAIGeneration": false,
  "currentBatch": null
}
```

### 2. 检查函数
```typescript
function shouldRunAICheck(filePath, context) {
  // 检查1：文件类型
  if (isDocFile(filePath)) return false;
  
  // 检查2：来源
  if (context.isAIGenerated) return false;
  
  // 检查3：时间窗口
  if (isInTimeWindow(filePath)) return false;
  
  // 检查4：批量操作
  if (context.isBatchOperation) return false;
  
  return true;
}
```

### 3. 循环检测器
```typescript
class LoopDetector {
  private checkHistory = new Map<string, number>();
  private maxRetries = 3;
  
  canCheck(filePath: string): boolean {
    const attempts = this.checkHistory.get(filePath) || 0;
    
    if (attempts >= this.maxRetries) {
      console.log(`文件 ${filePath} 已达到最大检查次数`);
      return false;
    }
    
    this.checkHistory.set(filePath, attempts + 1);
    return true;
  }
  
  reset(filePath: string): void {
    this.checkHistory.delete(filePath);
  }
}
```

## 🚨 紧急停止机制

### 全局停止开关
```typescript
// 可以随时停止所有AI自动检查
let globalAICheckEnabled = true;

function stopAllAIChecks() {
  globalAICheckEnabled = false;
  console.log('AI自动检查已全局停止');
}
```

### 用户手动干预
```bash
# 停止AI检查
echo "DISABLE_AI_CHECK=true" > .trae/disable-ai

# 恢复AI检查  
rm .trae/disable-ai
```

## 📋 防循环检查清单

AI在每次执行前必须检查：

- [ ] 是否为AI触发的变更？
- [ ] 是否为文档文件变更？
- [ ] 是否在时间窗口内？
- [ ] 是否为批量操作？
- [ ] 是否达到最大检查次数？
- [ ] 用户是否已禁用AI检查？
- [ ] 是否为白名单文件？

只有所有检查都通过，才能执行AI建议。

---

**核心原则：宁可漏检，不可循环！**