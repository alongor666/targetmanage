# 代码变更影响映射规则

## 核心映射关系

### 业务逻辑变更
- `src/domain/allocation.ts` → `docs/business/指标定义规范.md`
- `src/domain/time.ts` → `docs/business/指标定义规范.md`
- `src/domain/headquarters.ts` → `docs/business/指标定义规范.md`

### 架构变更
- `src/app/page.tsx` → `docs/architecture/系统架构设计.md`
- 新增组件 → `docs/design/组件设计规范.md`

### 数据结构变更
- `src/schemas/*.ts` → `docs/architecture/数据模型设计.md`
- `public/data/*.json` → `CHANGELOG_HQ_TARGET.md`

## 自动化触发条件

### 条件1：业务逻辑函数修改
```typescript
// 检测到以下模式时触发
export function.*修改|新增|删除
```

### 条件2：新增重要功能
```typescript
// 检测到新导出时触发
export const|export function 新功能名称
```

### 条件3：配置文件变更
```json
// 检测到数据结构变更时触发
public/data/*.json 文件修改
```

## 自动化响应动作

### 动作1：生成文档更新建议
```markdown
## 建议文档更新
- [ ] 更新 docs/business/指标定义规范.md
- [ ] 添加变更说明到 CHANGELOG_HQ_TARGET.md
```

### 动作2：自动更新相关章节
```typescript
// 自动提取函数注释更新文档
/**
 * 时间进度口径：2025年实际贡献度分布
 * @update 2025-12-23 修改计算逻辑
 */
```

### 动作3：生成提交信息模板
```bash
git commit -m "feat: 修改时间进度口径分配逻辑

- 添加基于2025年实际贡献度分布的分配函数
- 修复前端选择逻辑支持三种分配模式
- 更新相关文档：docs/business/指标定义规范.md
- 验证：三种分配模式测试通过"
```

## 使用方法

1. **AI 主动检查**：每次代码变更后，AI 自动检查影响映射
2. **生成建议**：AI 自动生成文档更新建议
3. **快速确认**：开发者快速确认或修改建议
4. **自动应用**：AI 自动应用确认的更新